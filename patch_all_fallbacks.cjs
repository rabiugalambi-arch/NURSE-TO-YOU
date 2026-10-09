const fs = require('fs');

const FALLBACK_CATEGORIES = [
  { id: 'Medication & Therapy', name: "Medication & Therapy", active: true },
  { id: 'Wound Care', name: "Wound Care", active: true },
  { id: 'Respiratory Care', name: "Respiratory Care", active: true },
  { id: 'Health Monitoring', name: "Health Monitoring", active: true },
  { id: 'Urinary Care', name: "Urinary Care", active: true },
  { id: 'Gastrointestinal Care', name: "Gastrointestinal Care", active: true },
  { id: 'Physical Care & Mobility', name: "Physical Care & Mobility", active: true },
  { id: 'Diagnostic Services', name: "Diagnostic Services", active: true },
  { id: 'Laboratory Services', name: "Laboratory Services", active: true },
  { id: 'Pregnancy & Maternity Care', name: "Pregnancy & Maternity Care", active: true },
  { id: 'Family Planning Services', name: "Family Planning Services", active: true },
  { id: 'General Health Education', name: "General Health Education", active: true },
  { id: 'Oral Health', name: "Oral Health", active: true },
  { id: 'Eye Care', name: "Eye Care", active: true },
  { id: 'ENT Care', name: "ENT Care", active: true },
  { id: 'Skin Care', name: "Skin Care", active: true },
  { id: 'Orthopedic Care', name: "Orthopedic Care", active: true },
  { id: 'Mental Health', name: "Mental Health", active: true },
  { id: 'Pediatric / Children\'s Health', name: "Pediatric / Children's Health", active: true },
  { id: 'Physician Care', name: "Physician Care", active: true },
  { id: 'Specialist Care', name: "Specialist Care", active: true },
  { id: 'Ambulance Service', name: "Ambulance Service", active: true },
  { id: 'Pharmacy Services', name: "Pharmacy Services", active: true }
];

let patientApp = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// Replace the existing fallback string with the new one
patientApp = patientApp.replace(
  /\{\(categories\.length > 0 \? categories : \[.*?\]\)\.map/g,
  `{(categories.length > 0 ? categories : ${JSON.stringify(FALLBACK_CATEGORIES)}).map`
);

fs.writeFileSync('src/components/PatientApp.tsx', patientApp);

let adminApp = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');
adminApp = adminApp.replace(
  /\{\(categories\.length > 0 \? categories : \[.*?\]\)\.map/g,
  `{(categories.length > 0 ? categories : ${JSON.stringify(FALLBACK_CATEGORIES)}).map`
);
fs.writeFileSync('src/components/AdminApp.tsx', adminApp);

console.log('Patched all fallbacks');
