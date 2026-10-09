/**
 * Clinical and Calendar Calculation utilities for Nurse To You Menstrual Tracker.
 * Accurately handles leap years, month boundaries, and timezone-safe date arithmetic.
 */

export interface MenstrualInput {
  lmpDate: string; // 'YYYY-MM-DD'
  cycleLength: number; // e.g. 28 days
  bleedingDuration: number; // e.g. 5 days
  previousPeriodDate?: string; // Optional 'YYYY-MM-DD'
}

export type CyclePhaseType = 
  | 'menstrual' 
  | 'follicular' 
  | 'ovulatory' 
  | 'luteal' 
  | 'due_or_late' 
  | 'upcoming';

export interface MenstrualCalculationResult {
  lmpDate: Date;
  nextPeriodStartDate: Date;
  nextPeriodEndDate: Date;
  estimatedCycleLength: number;
  bleedingDuration: number;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  currentCycleDay: number;
  daysUntilNextPeriod: number;
  phase: CyclePhaseType;
  phaseLabel: string;
  phaseDescription: string;
  observedCycleLength?: number;
  isIrregular: boolean;
  irregularityReason?: string;
}

/**
 * Safely parse 'YYYY-MM-DD' string to a local Date object at 00:00:00 local time
 * Avoiding UTC conversion shifts.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error('Invalid date string');
  }
  const parts = dateStr.trim().split('-');
  if (parts.length !== 3) {
    throw new Error('Date must be in YYYY-MM-DD format');
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error('Invalid date components');
  }

  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  // Verify date didn't overflow (e.g. Feb 31 -> Mar 3)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error('Invalid calendar date for given month');
  }
  return date;
}

/**
 * Format a Date to 'YYYY-MM-DD' string
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Add or subtract days from a Date without timezone distortion.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Difference in full calendar days between two dates (to - from).
 */
export function diffCalendarDays(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Format a Date for friendly display (e.g. "Wed, Oct 28, 2026")
 */
export function formatDisplayDate(date: Date, includeWeekday = true): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeWeekday ? { weekday: 'short' } : {})
  };
  return date.toLocaleDateString(undefined, options);
}

/**
 * Validate input fields and return user-friendly errors
 */
export function validateMenstrualInput(
  input: {
    lmpDate: string;
    cycleLength: number;
    bleedingDuration: number;
    previousPeriodDate?: string;
  },
  referenceDate?: Date
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.lmpDate || input.lmpDate.trim() === '') {
    errors.push('Please select the first day of your last menstrual period.');
  } else {
    try {
      const lmp = parseLocalDate(input.lmpDate);
      const ref = referenceDate ? new Date(referenceDate) : new Date();
      // Allow realistic historical and upcoming dates up to 365 days ahead
      const maxFuture = addDays(ref, 365);
      if (lmp > maxFuture) {
        errors.push('The last menstrual period date cannot be more than a year in the future.');
      }
    } catch {
      errors.push('Please enter a valid last menstrual period date.');
    }
  }

  if (isNaN(input.cycleLength) || input.cycleLength < 20 || input.cycleLength > 50) {
    errors.push('Cycle length must be between 20 and 50 days (average is 28 days).');
  }

  if (isNaN(input.bleedingDuration) || input.bleedingDuration < 1 || input.bleedingDuration > 14) {
    errors.push('Bleeding duration must be between 1 and 14 days (typical is 3 to 7 days).');
  }

  if (input.previousPeriodDate && input.previousPeriodDate.trim() !== '') {
    try {
      const pmp = parseLocalDate(input.previousPeriodDate);
      if (input.lmpDate) {
        const lmp = parseLocalDate(input.lmpDate);
        if (pmp >= lmp) {
          errors.push('The previous period date must be earlier than the last menstrual period.');
        } else {
          const gap = diffCalendarDays(pmp, lmp);
          if (gap < 15) {
            errors.push('The gap between previous and last period is less than 15 days.');
          } else if (gap > 120) {
            errors.push('The gap between previous and last period is more than 120 days. Cycle estimates may vary.');
          }
        }
      }
    } catch {
      errors.push('Please enter a valid date for previous menstrual period.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate cycle metrics, estimates, fertile window, and phase.
 */
export function calculateMenstrualResults(
  input: MenstrualInput,
  currentDate?: Date
): MenstrualCalculationResult {
  const validation = validateMenstrualInput(input, currentDate);
  if (!validation.isValid) {
    throw new Error(validation.errors[0] || 'Invalid menstrual data');
  }

  const lmp = parseLocalDate(input.lmpDate);
  const cycleLength = Math.round(input.cycleLength);
  const bleedingDuration = Math.round(input.bleedingDuration);

  // Reference date (today at 00:00:00)
  const today = currentDate 
    ? new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)
    : new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Cycle Day 1 = first day of last period
  const currentCycleDay = diffCalendarDays(lmp, today) + 1;

  // 2. Next expected period start date = LMP + cycleLength
  const nextPeriodStartDate = addDays(lmp, cycleLength);

  // 3. Expected period end date = nextPeriodStartDate + (bleedingDuration - 1)
  const nextPeriodEndDate = addDays(nextPeriodStartDate, bleedingDuration - 1);

  // 4. Ovulation date = 14 days before next expected period
  const ovulationDate = addDays(nextPeriodStartDate, -14);

  // 5. Fertile window = 5 days before ovulation up to and including the day of ovulation
  const fertileWindowStart = addDays(ovulationDate, -5);
  const fertileWindowEnd = ovulationDate;

  // 6. Days until next expected period
  const daysUntilNextPeriod = diffCalendarDays(today, nextPeriodStartDate);

  // 7. Cycle Phase Determination
  let phase: CyclePhaseType = 'follicular';
  let phaseLabel = 'Follicular Phase';
  let phaseDescription = 'Estrogen levels rise as the follicle develops to release a mature egg.';

  if (currentCycleDay < 1) {
    phase = 'upcoming';
    phaseLabel = 'Upcoming Cycle';
    phaseDescription = 'Cycle day count will begin on the entered period start date.';
  } else if (currentCycleDay >= 1 && currentCycleDay <= bleedingDuration) {
    phase = 'menstrual';
    phaseLabel = 'Menstrual Phase';
    phaseDescription = 'Active bleeding duration. Uterine lining is shedding.';
  } else if (today.getTime() >= fertileWindowStart.getTime() && today.getTime() <= fertileWindowEnd.getTime()) {
    phase = 'ovulatory';
    if (today.getTime() === ovulationDate.getTime()) {
      phaseLabel = 'Peak Ovulation Day';
      phaseDescription = 'Mature egg is released from ovary. Highest chance of conception.';
    } else {
      phaseLabel = 'Fertile Window';
      phaseDescription = 'High probability of conception. Sperm can survive up to 5 days.';
    }
  } else if (today.getTime() > fertileWindowEnd.getTime() && today.getTime() < nextPeriodStartDate.getTime()) {
    phase = 'luteal';
    phaseLabel = 'Luteal Phase';
    phaseDescription = 'Progesterone dominates after ovulation in preparation for possible implantation or next cycle.';
  } else if (today.getTime() >= nextPeriodStartDate.getTime()) {
    phase = 'due_or_late';
    phaseLabel = daysUntilNextPeriod === 0 ? 'Period Expected Today' : 'Late / Next Cycle Due';
    phaseDescription = daysUntilNextPeriod === 0 
      ? 'Your next period is estimated to begin today.' 
      : `Next cycle was estimated ${Math.abs(daysUntilNextPeriod)} days ago. Cycles can fluctuate naturally.`;
  }

  // Previous period observed interval & irregularity check
  let observedCycleLength: number | undefined;
  let isIrregular = false;
  let irregularityReason: string | undefined;

  if (input.previousPeriodDate && input.previousPeriodDate.trim() !== '') {
    try {
      const pmp = parseLocalDate(input.previousPeriodDate);
      if (pmp < lmp) {
        observedCycleLength = diffCalendarDays(pmp, lmp);
        if (Math.abs(observedCycleLength - cycleLength) >= 5) {
          isIrregular = true;
          irregularityReason = `Your observed interval between your last two periods was ${observedCycleLength} days, which differs from your entered average of ${cycleLength} days.`;
        }
      }
    } catch {
      // Ignored
    }
  }

  if (cycleLength < 21 || cycleLength > 36) {
    isIrregular = true;
    irregularityReason = irregularityReason 
      ? `${irregularityReason} Also, cycle lengths outside 21–36 days are more variable.` 
      : `Cycles shorter than 21 days or longer than 36 days are considered variable or irregular.`;
  }

  return {
    lmpDate: lmp,
    nextPeriodStartDate,
    nextPeriodEndDate,
    estimatedCycleLength: cycleLength,
    bleedingDuration,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    currentCycleDay,
    daysUntilNextPeriod,
    phase,
    phaseLabel,
    phaseDescription,
    observedCycleLength,
    isIrregular,
    irregularityReason
  };
}
