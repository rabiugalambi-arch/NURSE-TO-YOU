import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  Calendar as CalendarIcon, 
  Info, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit2, 
  ArrowLeft, 
  Droplet, 
  Sparkles, 
  Clock, 
  Heart, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  BookmarkCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  MenstrualCalculationResult,
  calculateMenstrualResults,
  validateMenstrualInput,
  formatDisplayDate,
  formatLocalDate,
  parseLocalDate,
  addDays,
  diffCalendarDays
} from '../lib/menstrualCalculations';

export interface MenstrualCycle {
  id?: string;
  userId: string;
  periodStartDate: string;
  periodEndDate?: string;
  cycleLength: number;
  periodLength: number;
  previousPeriodDate?: string;
  createdAt: number;
  updatedAt?: number;
}

export function MenstrualTracker({ patientId, onBack }: { patientId: string, onBack: () => void }) {
  const { t } = useLanguage();
  const [cycles, setCycles] = useState<MenstrualCycle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Inputs
  const [startDate, setStartDate] = useState<string>(() => {
    // Default to a recent date (7 days ago or today)
    const d = new Date();
    d.setDate(d.getDate() - 5);
    return formatLocalDate(d);
  });
  const [cycleLength, setCycleLength] = useState<number>(28);
  const [bleedingDuration, setBleedingDuration] = useState<number>(5);
  const [previousPeriodDate, setPreviousPeriodDate] = useState<string>('');
  
  // Calculations & Validation State
  const [results, setResults] = useState<MenstrualCalculationResult | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');

  // Load saved cycles on mount
  useEffect(() => {
    if (patientId) {
      fetchCycles();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  // Initial calculation on load with default inputs
  useEffect(() => {
    try {
      const initial = calculateMenstrualResults({
        lmpDate: startDate,
        cycleLength,
        bleedingDuration,
        previousPeriodDate: previousPeriodDate || undefined
      });
      setResults(initial);
    } catch {
      // Ignored for initial default
    }
  }, []);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'menstrualCycles'),
        where('userId', '==', patientId)
      );
      const snap = await getDocs(q);
      const fetched: MenstrualCycle[] = [];
      snap.forEach(docSnap => fetched.push({ id: docSnap.id, ...docSnap.data() } as MenstrualCycle));
      
      // Sort by start date descending
      fetched.sort((a, b) => new Date(b.periodStartDate).getTime() - new Date(a.periodStartDate).getTime());
      
      setCycles(fetched);

      // If user has saved cycles and no results calculated yet, pre-populate with the latest cycle
      if (fetched.length > 0 && fetched[0].periodStartDate) {
        const latest = fetched[0];
        setStartDate(latest.periodStartDate);
        if (latest.cycleLength) setCycleLength(latest.cycleLength);
        if (latest.periodLength) setBleedingDuration(latest.periodLength);
        if (latest.previousPeriodDate) setPreviousPeriodDate(latest.previousPeriodDate);

        try {
          const res = calculateMenstrualResults({
            lmpDate: latest.periodStartDate,
            cycleLength: latest.cycleLength || 28,
            bleedingDuration: latest.periodLength || 5,
            previousPeriodDate: latest.previousPeriodDate || undefined
          });
          setResults(res);
        } catch {
          // Fallback to default
        }
      }
    } catch (e: any) {
      console.warn("MenstrualTracker fetch error:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate Results Button Handler
   */
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormErrors([]);
    setSavedSuccessMessage(null);
    setIsCalculating(true);

    const validation = validateMenstrualInput({
      lmpDate: startDate,
      cycleLength,
      bleedingDuration,
      previousPeriodDate: previousPeriodDate.trim() ? previousPeriodDate : undefined
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsCalculating(false);
      return;
    }

    try {
      const calcResults = calculateMenstrualResults({
        lmpDate: startDate,
        cycleLength,
        bleedingDuration,
        previousPeriodDate: previousPeriodDate.trim() ? previousPeriodDate : undefined
      });
      setResults(calcResults);
      setFormErrors([]);
    } catch (err: any) {
      setFormErrors([err.message || 'Unable to calculate cycle results. Please verify your inputs.']);
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Save to Firestore Cycle History
   */
  const handleSaveToHistory = async () => {
    if (!results) {
      handleCalculate();
    }
    setSavedSuccessMessage(null);

    const validation = validateMenstrualInput({
      lmpDate: startDate,
      cycleLength,
      bleedingDuration,
      previousPeriodDate: previousPeriodDate.trim() ? previousPeriodDate : undefined
    });

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const calculatedEnd = formatLocalDate(results?.nextPeriodEndDate || addDays(parseLocalDate(startDate), bleedingDuration - 1));
      const payload: Partial<MenstrualCycle> = {
        userId: patientId || 'guest',
        periodStartDate: startDate,
        periodEndDate: calculatedEnd,
        cycleLength,
        periodLength: bleedingDuration,
        previousPeriodDate: previousPeriodDate.trim() || undefined,
        updatedAt: Date.now()
      };

      if (editingId) {
        await updateDoc(doc(db, 'menstrualCycles', editingId), payload);
        setSavedSuccessMessage(t('Cycle record successfully updated in history!'));
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'menstrualCycles'), {
          ...payload,
          createdAt: Date.now()
        });
        setSavedSuccessMessage(t('Cycle successfully saved to your private history!'));
      }

      await fetchCycles();
      setTimeout(() => setSavedSuccessMessage(null), 4000);
    } catch (err: any) {
      console.warn("Error saving cycle record:", err);
      setSavedSuccessMessage(t('Record saved locally for this session.'));
      setTimeout(() => setSavedSuccessMessage(null), 4000);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menstrualCycles', id));
      await fetchCycles();
    } catch (err: any) {
      console.warn("MenstrualTracker delete error:", err?.message);
    }
  };

  const handleLoadCycleIntoCalculator = (c: MenstrualCycle) => {
    setEditingId(c.id || null);
    setStartDate(c.periodStartDate);
    setCycleLength(c.cycleLength || 28);
    setBleedingDuration(c.periodLength || 5);
    setPreviousPeriodDate(c.previousPeriodDate || '');
    setFormErrors([]);
    setSavedSuccessMessage(null);
    setActiveTab('calculator');

    try {
      const res = calculateMenstrualResults({
        lmpDate: c.periodStartDate,
        cycleLength: c.cycleLength || 28,
        bleedingDuration: c.periodLength || 5,
        previousPeriodDate: c.previousPeriodDate || undefined
      });
      setResults(res);
    } catch {
      // Ignored
    }
  };

  // Observed interval helper
  const observedInterval = (() => {
    if (!previousPeriodDate || !startDate) return null;
    try {
      const p = parseLocalDate(previousPeriodDate);
      const l = parseLocalDate(startDate);
      if (p < l) {
        return diffCalendarDays(p, l);
      }
    } catch {
      return null;
    }
    return null;
  })();

  // Render Calendar Grid (35-day sliding view covering cycle, fertile window & next period)
  const renderCalendar = () => {
    if (!results) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lmp = results.lmpDate;
    const nextStart = results.nextPeriodStartDate;
    const nextEnd = results.nextPeriodEndDate;
    const ovulation = results.ovulationDate;
    const fertileStart = results.fertileWindowStart;
    const fertileEnd = results.fertileWindowEnd;

    // Build 35 days starting from LMP (or 3-4 days before LMP to show context)
    const calendarStart = addDays(lmp, -2);
    const calendarDays = [];

    for (let i = 0; i < 35; i++) {
      const d = addDays(calendarStart, i);
      const time = d.getTime();

      const isCurrentPeriod = time >= lmp.getTime() && time <= addDays(lmp, results.bleedingDuration - 1).getTime();
      const isNextPeriod = time >= nextStart.getTime() && time <= nextEnd.getTime();
      const isOvulation = time === ovulation.getTime();
      const isFertile = time >= fertileStart.getTime() && time <= fertileEnd.getTime() && !isOvulation;
      const isToday = time === today.getTime();

      calendarDays.push({
        date: d,
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString(undefined, { month: 'short' }),
        isCurrentPeriod,
        isNextPeriod,
        isOvulation,
        isFertile,
        isToday
      });
    }

    return (
      <div className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-pink-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base md:text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-pink-600" />
              {t('Cycle Calendar')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDisplayDate(calendarStart, false)} – {formatDisplayDate(calendarDays[calendarDays.length - 1].date, false)}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full border border-pink-100">
            {results.estimatedCycleLength} {t('day cycle')}
          </span>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
            <div key={idx} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* Empty slots for starting weekday */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: calendarDays[0].date.getDay() }).map((_, emptyIdx) => (
            <div key={`empty-${emptyIdx}`} className="aspect-square" />
          ))}

          {calendarDays.map((dayItem, idx) => {
            let bgClass = "bg-gray-50 text-gray-700 hover:bg-gray-100";
            let badge = null;

            if (dayItem.isCurrentPeriod) {
              bgClass = "bg-rose-500 text-white font-bold shadow-sm ring-1 ring-rose-400";
              badge = "Period";
            } else if (dayItem.isNextPeriod) {
              bgClass = "bg-rose-100 text-rose-800 font-semibold border border-rose-300";
              badge = "Next";
            } else if (dayItem.isOvulation) {
              bgClass = "bg-purple-600 text-white font-extrabold shadow-md ring-2 ring-purple-300";
              badge = "Ovul.";
            } else if (dayItem.isFertile) {
              bgClass = "bg-purple-100 text-purple-900 font-semibold border border-purple-200";
            }

            return (
              <div
                key={idx}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl text-xs relative transition-all duration-150 p-0.5",
                  bgClass,
                  dayItem.isToday && "ring-2 ring-pink-500 ring-offset-2 font-black"
                )}
                title={`${formatDisplayDate(dayItem.date)}${badge ? ` - ${badge}` : ''}`}
              >
                <span className="text-[13px] leading-tight">{dayItem.dayNum}</span>
                {dayItem.dayNum === 1 && (
                  <span className="text-[9px] uppercase tracking-tighter opacity-80">{dayItem.monthName}</span>
                )}
                {dayItem.isOvulation && (
                  <span className="w-1.5 h-1.5 bg-amber-300 rounded-full mt-0.5"></span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shrink-0"></span>
            <span>{t('Period Days')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-100 border border-purple-200 shrink-0"></span>
            <span>{t('Fertile Window')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md bg-purple-600 shrink-0 flex items-center justify-center">
              <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
            </span>
            <span>{t('Ovulation Day')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-md border-2 border-pink-500 bg-white shrink-0"></span>
            <span>{t('Today')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-slate-50 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack} 
            className="text-pink-600 hover:bg-pink-50 p-2 rounded-xl transition-colors"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-pink-700 leading-tight">
              {t('Menstrual & Fertility Tracker')}
            </h1>
            <p className="text-xs text-gray-500">Nurse To You • Women's Health</p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('calculator')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all",
              activeTab === 'calculator' ? "bg-white text-pink-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {t('Calculate')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-all flex items-center gap-1",
              activeTab === 'history' ? "bg-white text-pink-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {t('Cycle History')}
            {cycles.length > 0 && (
              <span className="bg-pink-100 text-pink-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {cycles.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-3xl mx-auto w-full pb-28">
        
        {/* Medical & Privacy Disclaimers */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-amber-900 flex gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              {t('Cycle and fertility dates shown here are estimates. Menstrual cycles and ovulation can vary. These predictions should not be used as a guarantee of preventing pregnancy.')}
            </p>
            <p className="text-amber-800">
              {t('If you need contraception or have concerns about your menstrual cycle, speak with a qualified healthcare professional.')}
            </p>
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-6 text-xs text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>
            <strong className="font-semibold">{t('Privacy Protected')}:</strong>{' '}
            {t('Your menstrual cycle entries are strictly confidential and used solely to calculate health estimates on your private account.')}
          </p>
        </div>

        {/* Success Alert Banner */}
        {savedSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-sm text-green-800 flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="font-semibold">{savedSuccessMessage}</span>
          </div>
        )}

        {/* Tab 1: CALCULATOR TAB */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            
            {/* Input Form Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-pink-600" />
                  {editingId ? t('Edit Cycle Information') : t('Enter Menstrual Information')}
                </h2>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setStartDate(formatLocalDate(new Date()));
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    {t('Cancel edit')}
                  </button>
                )}
              </div>

              {/* Validation Errors */}
              {formErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 text-xs sm:text-sm text-red-700 space-y-1">
                  {formErrors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold">•</span>
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleCalculate} className="space-y-5">
                {/* 1. First day of last menstrual period */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>{t('First day of last menstrual period')} <span className="text-pink-600">*</span></span>
                    <span className="text-xs text-gray-400 font-normal">Cycle Day 1</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setFormErrors([]);
                    }}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-base font-medium outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select the date when your most recent menstrual bleeding began.
                  </p>
                </div>

                {/* 2. Average cycle length */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>{t('Average menstrual cycle length (days)')} <span className="text-pink-600">*</span></span>
                    <span className="text-xs text-gray-400 font-normal">Default: 28 days</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      required
                      min={20}
                      max={50}
                      value={cycleLength}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCycleLength(isNaN(val) ? 28 : val);
                        setFormErrors([]);
                      }}
                      className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-base font-semibold outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
                    />
                  </div>
                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Quick select:</span>
                    {[24, 26, 28, 30, 32].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => {
                          setCycleLength(preset);
                          setFormErrors([]);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors",
                          cycleLength === preset
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {preset} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Average duration of menstrual bleeding */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>{t('Average duration of menstrual bleeding (days)')} <span className="text-pink-600">*</span></span>
                    <span className="text-xs text-gray-400 font-normal">Typical: 3–7 days</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={14}
                    value={bleedingDuration}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setBleedingDuration(isNaN(val) ? 5 : val);
                      setFormErrors([]);
                    }}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3.5 text-base font-semibold outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
                  />
                  {/* Quick Duration Buttons */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Quick select:</span>
                    {[3, 4, 5, 6, 7].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => {
                          setBleedingDuration(preset);
                          setFormErrors([]);
                        }}
                        className={cn(
                          "px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors",
                          bleedingDuration === preset
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                      >
                        {preset} days
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Previous menstrual period date (optional) */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center justify-between">
                    <span>{t('Previous period start date (optional)')}</span>
                    <span className="text-xs text-purple-600 font-medium">Improves estimate</span>
                  </label>
                  <input
                    type="date"
                    value={previousPeriodDate}
                    onChange={(e) => {
                      setPreviousPeriodDate(e.target.value);
                      setFormErrors([]);
                    }}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all bg-white"
                  />
                  
                  {/* Observed Interval Alert & Calibrate Button */}
                  {observedInterval !== null && (
                    <div className="mt-2.5 p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 flex items-center justify-between">
                      <div>
                        <span className="font-bold">Observed interval:</span> {observedInterval} days between periods.
                      </div>
                      {observedInterval !== cycleLength && (
                        <button
                          type="button"
                          onClick={() => setCycleLength(observedInterval)}
                          className="bg-purple-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"
                        >
                          Use {observedInterval} days
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. CALCULATE RESULTS BUTTON */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-pink-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99]"
                  >
                    {isCalculating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>{t('Calculating...')}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>{t('Calculate Results')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* RESULTS DASHBOARD */}
            {results && (
              <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
                
                {/* Irregular Cycle Notice */}
                {results.isIrregular && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 text-xs sm:text-sm text-purple-900 flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold mb-0.5">{t('Irregular Cycle Notice')}</p>
                      <p>
                        {results.irregularityReason || t('Your cycle appears variable, so fertility estimates may be less reliable.')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Primary Hero Results Card */}
                <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  {/* Top Row: Cycle Day & Phase Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-wider font-extrabold bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
                      {results.currentCycleDay >= 1 
                        ? `${t('Cycle Day')} ${results.currentCycleDay}` 
                        : t('Upcoming Cycle')}
                    </span>
                    <span className="text-xs font-semibold bg-white/25 px-3 py-1 rounded-full">
                      {results.phaseLabel}
                    </span>
                  </div>

                  {/* Main Metric: Next Period & Days Remaining */}
                  <div className="mb-4">
                    <p className="text-pink-100 text-xs font-medium uppercase tracking-wider mb-1">
                      {t('Next Expected Period')}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black tracking-tight">
                      {formatDisplayDate(results.nextPeriodStartDate)}
                    </p>
                    <p className="text-sm font-semibold text-pink-100 mt-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {results.daysUntilNextPeriod > 0 ? (
                        <span>{results.daysUntilNextPeriod} {t('days remaining')}</span>
                      ) : results.daysUntilNextPeriod === 0 ? (
                        <span>{t('Period is expected today')}</span>
                      ) : (
                        <span>{Math.abs(results.daysUntilNextPeriod)} {t('days past estimated start')}</span>
                      )}
                    </p>
                  </div>

                  {/* Phase description */}
                  <div className="pt-3 border-t border-white/20 text-xs text-pink-50 leading-relaxed">
                    {results.phaseDescription}
                  </div>
                </div>

                {/* 6 Key Results Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Expected Period Range */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{t('Expected Period End Date')}</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {formatDisplayDate(results.nextPeriodEndDate)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {results.bleedingDuration} {t('days of bleeding duration')}
                      </p>
                    </div>
                  </div>

                  {/* 2. Estimated Ovulation Date */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{t('Estimated Ovulation Date')}</p>
                      <p className="text-base font-bold text-purple-900 mt-0.5">
                        {formatDisplayDate(results.ovulationDate)}
                      </p>
                      <p className="text-xs text-purple-600 font-medium mt-0.5">
                        ~14 {t('days before next period')}
                      </p>
                    </div>
                  </div>

                  {/* 3. Estimated Fertile Window */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{t('Estimated Fertile Window')}</p>
                      <p className="text-base font-bold text-indigo-900 mt-0.5">
                        {formatDisplayDate(results.fertileWindowStart, false)} – {formatDisplayDate(results.fertileWindowEnd, false)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t('Higher probability of conception')}
                      </p>
                    </div>
                  </div>

                  {/* 4. Estimated Cycle Length */}
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{t('Estimated Cycle Length')}</p>
                      <p className="text-base font-bold text-gray-900 mt-0.5">
                        {results.estimatedCycleLength} {t('Days')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        LMP: {formatDisplayDate(results.lmpDate, false)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Calendar Visualization */}
                {renderCalendar()}

                {/* Action Controls: Save to History & Re-calculate */}
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{t('Save this cycle record?')}</h4>
                    <p className="text-xs text-gray-500">
                      {t('Store this calculation securely in your personal cycle history.')}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveToHistory}
                      className="flex-1 sm:flex-none bg-pink-600 hover:bg-pink-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-pink-100 transition-colors"
                    >
                      <BookmarkCheck className="w-4 h-4" />
                      {editingId ? t('Update Record') : t('Save to Cycle History')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors"
                    >
                      {t('Edit Inputs')}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Tab 2: HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{t('Cycle History')}</h3>
                <p className="text-xs text-gray-500">
                  {t('Your securely stored menstrual records on Nurse To You.')}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingId(null);
                  setActiveTab('calculator');
                }}
                className="bg-pink-600 hover:bg-pink-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> {t('New Cycle')}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
                <RefreshCw className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">{t('Loading your cycle records...')}</p>
              </div>
            ) : cycles.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 p-6">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-700 mb-1">{t('No cycles logged yet')}</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                  {t('Calculate and save your first menstrual cycle to begin keeping a private record.')}
                </p>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="bg-pink-100 text-pink-700 hover:bg-pink-200 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  {t('Go to Calculator')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-pink-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                        <span className="font-bold text-gray-900 text-sm sm:text-base">
                          {new Date(item.periodStartDate).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                          {item.periodEndDate && ` – ${new Date(item.periodEndDate).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                        <span>Cycle: <strong>{item.cycleLength} days</strong></span>
                        <span>Bleeding: <strong>{item.periodLength} days</strong></span>
                        {item.previousPeriodDate && (
                          <span className="text-purple-600">Prev: {item.previousPeriodDate}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleLoadCycleIntoCalculator(item)}
                        className="bg-pink-50 text-pink-700 hover:bg-pink-100 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Load this record into the calculator"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t('Recalculate')}
                      </button>
                      <button
                        onClick={() => handleLoadCycleIntoCalculator(item)}
                        className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (item.id) handleDeleteHistory(item.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
