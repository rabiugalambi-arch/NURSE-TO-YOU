const fs = require('fs');

const FALLBACK_CATEGORIES = [
  { id: 'Medication & Therapy', name: "Medication & Therapy", active: true },
  { id: 'Wound Care', name: "Wound Care", active: true },
  { id: 'Respiratory Care', name: "Respiratory Care", active: true },
  { id: 'Health Monitoring', name: "Health Monitoring", active: true },
  { id: 'Diagnostic Services', name: "Diagnostic Services", active: true },
  { id: 'Pharmacy Services', name: "Pharmacy Services", active: true },
  { id: 'Physician Care', name: "Physician Care", active: true },
  { id: 'Ambulance Service', name: "Ambulance Service", active: true }
];

const FALLBACK_SERVICES = [
  { id: 's1', categoryId: 'Medication & Therapy', name: 'Medication Administration', price: 5000, description: 'Professional medication administration.', active: true },
  { id: 's2', categoryId: 'Wound Care', name: 'Dressing Procedures', price: 6500, description: 'Professional wound dressing.', active: true },
  { id: 's3', categoryId: 'Health Monitoring', name: 'Vital Signs Monitoring', price: 3000, description: 'BP, HR, Temp, RR, SpO2 monitoring.', active: true },
  { id: 's4', categoryId: 'Diagnostic Services', name: 'Malaria Testing', price: 4000, description: 'Rapid malaria tests.', active: true }
];

let patientApp = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

patientApp = patientApp.replace(
  `{categories.map(cat => (`,
  `{(categories.length > 0 ? categories : ${JSON.stringify(FALLBACK_CATEGORIES)}).map(cat => (`
);

patientApp = patientApp.replace(
  `{allServices.filter(s => s.categoryId === selectedCategory.name).map(service => (`,
  `{(allServices.length > 0 ? allServices : ${JSON.stringify(FALLBACK_SERVICES)}).filter(s => s.categoryId === selectedCategory.name).map(service => (`
);

patientApp = patientApp.replace(
  `{allServices.filter(s => s.categoryId === selectedCategory.name).length === 0 && (`,
  `{(allServices.length > 0 ? allServices : ${JSON.stringify(FALLBACK_SERVICES)}).filter(s => s.categoryId === selectedCategory.name).length === 0 && (`
);

fs.writeFileSync('src/components/PatientApp.tsx', patientApp);

let adminApp = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');
adminApp = adminApp.replace(
  `{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}`,
  `{(categories.length > 0 ? categories : ${JSON.stringify(FALLBACK_CATEGORIES)}).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}`
);
fs.writeFileSync('src/components/AdminApp.tsx', adminApp);

console.log('Patched fallbacks');
