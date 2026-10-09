const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const mappingCode = `
const CATEGORY_ICONS: Record<string, string> = {
  'Medication & Therapy': '💉',
  'Wound Care': '🩹',
  'Respiratory Care': '🫁',
  'Health Monitoring': '❤️',
  'Urinary Care': '🚻',
  'Gastrointestinal Care': '🩺',
  'Gastro Care': '🩺',
  'Physical Care & Mobility': '🧑‍🦽',
  'Physical Care': '🧑‍🦽',
  'Diagnostic Services': '🔬',
  'Laboratory Services': '🧪',
  'Pregnancy & Maternity Care': '🤰',
  'Pregnancy & Maternity': '🤰',
  'Family Planning Services': '👨‍👩‍👧',
  'Family Planning': '👨‍👩‍👧',
  'General Health Education': '📚',
  'Health Education': '📚',
  'Oral Health': '🦷',
  'Eye Care': '👁️',
  'ENT Care': '👂',
  'Skin Care': '🧴',
  'Orthopedic Care': '🦴',
  'Mental Health': '🧠',
  'Pediatric / Children\\'s Health': '👶',
  'Pediatric Care': '👶',
  'Physician Care': '👨‍⚕️',
  'Specialist Care': '🏥',
  'Ambulance Service': '🚑',
  'Pharmacy Services': '💊',
};
`;

if (!content.includes('CATEGORY_ICONS')) {
  // Insert before PatientApp function
  content = content.replace('export function PatientApp', mappingCode + '\\nexport function PatientApp');
}

// Replace the icon rendering
content = content.replace(
  /<div className="w-10 h-10 shrink-0 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">\s*<ActivitySquare className="w-5 h-5" \/>\s*<\/div>/g,
  `<div className="w-10 h-10 shrink-0 bg-slate-100 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-200/60">
                       {CATEGORY_ICONS[cat.name] || '🏥'}
                    </div>`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log('Patched Emojis');
