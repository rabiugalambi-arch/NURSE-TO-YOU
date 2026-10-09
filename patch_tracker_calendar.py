import re

with open('src/components/MenstrualTracker.tsx', 'r') as f:
    content = f.read()

calendar_component = '''
  // Simple Calendar generation
  const renderCalendar = () => {
    if (!calculations || !activeCycle) return null;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // We'll show a 4-week sliding window starting from a few days before LMP, or just the current month.
    // Let's do a simple current month view based on activeCycle's LMP month.
    const lmp = new Date(activeCycle.periodStartDate);
    
    // Show 35 days starting from LMP
    const days = [];
    let currentDate = new Date(lmp);
    
    const fertileStart = addDays(calculations.ovulation, -5); // We can parse from string, but string is locale formatted
    // Re-calculate dates as objects
    const nextPeriodObj = addDays(activeCycle.periodStartDate, activeCycle.cycleLength);
    const ovulationObj = addDays(activeCycle.periodStartDate, activeCycle.cycleLength - 14);
    const fStartObj = addDays(ovulationObj.toISOString().split('T')[0], -5);
    const fEndObj = addDays(ovulationObj.toISOString().split('T')[0], 1);
    
    for (let i = 0; i < 35; i++) {
      const d = new Date(currentDate);
      d.setHours(0,0,0,0);
      
      let isPeriod = false;
      if (i < activeCycle.periodLength) isPeriod = true;
      
      let isNextPeriod = d.getTime() >= nextPeriodObj.getTime() && d.getTime() < nextPeriodObj.getTime() + (activeCycle.periodLength * 86400000);
      let isFertile = d.getTime() >= fStartObj.getTime() && d.getTime() <= fEndObj.getTime();
      let isOvulation = d.getTime() === ovulationObj.getTime();
      let isToday = d.getTime() === today.getTime();
      
      days.push({
        date: d,
        isPeriod,
        isNextPeriod,
        isFertile,
        isOvulation,
        isToday
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-900 mb-4">{t('Cycle Calendar (35 Days)')}</h3>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S','M','T','W','T','F','S'].map((day, i) => <div key={i} className="text-xs font-bold text-gray-400">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayObj, i) => {
            // Offset first day of LMP to its day of week
            if (i === 0) {
              const offset = dayObj.date.getDay();
              // return empty divs for offset
            }
            return (
              <div key={i} className={cn(
                "aspect-square flex items-center justify-center rounded-full text-sm relative border-2",
                dayObj.isPeriod || dayObj.isNextPeriod ? "bg-red-100 text-red-800 border-red-100" :
                dayObj.isOvulation ? "bg-purple-600 text-white border-purple-600 shadow-md font-bold z-10" :
                dayObj.isFertile ? "bg-purple-100 text-purple-800 border-purple-100" :
                "bg-gray-50 text-gray-700 border-gray-50",
                dayObj.isToday ? "ring-2 ring-pink-500 ring-offset-1 font-bold" : ""
              )}>
                {dayObj.date.getDate()}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
'''

content = content.replace("  let activeCycle = cycles[0];", calendar_component + "\n  let activeCycle = cycles[0];")

content = content.replace(
    "{/* Legend */}",
    "{renderCalendar()}\n        {/* Legend */}"
)

# Fix calendar offset issue
fix_offset = '''        <div className="grid grid-cols-7 gap-2">
          {Array.from({length: days[0]?.date.getDay() || 0}).map((_, i) => <div key={`empty-${i}`}></div>)}
          {days.map((dayObj, i) => {
            return (
              <div key={i} className={cn(
                "aspect-square flex items-center justify-center rounded-full text-sm font-medium relative border-2",
                dayObj.isPeriod || dayObj.isNextPeriod ? "bg-red-100 text-red-800 border-red-100" :
                dayObj.isOvulation ? "bg-purple-600 text-white border-purple-600 shadow-md font-bold z-10" :
                dayObj.isFertile ? "bg-purple-100 text-purple-800 border-purple-100" :
                "bg-gray-50 text-gray-700 border-gray-50 hover:bg-gray-100 transition-colors",
                dayObj.isToday ? "ring-2 ring-pink-500 ring-offset-2 font-black" : ""
              )}>
                {dayObj.date.getDate()}
              </div>
            );
          })}
        </div>'''

content = re.sub(
    r'<div className="grid grid-cols-7 gap-1">\n\s*\{days\.map\(\(dayObj, i\) => \{.*?<\/[a-zA-Z0-9]+>\s*\);\s*\}\)\}\s*<\/div>',
    fix_offset,
    content,
    flags=re.DOTALL
)

with open('src/components/MenstrualTracker.tsx', 'w') as f:
    f.write(content)
