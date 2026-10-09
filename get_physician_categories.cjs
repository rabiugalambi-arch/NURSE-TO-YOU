const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const match = content.indexOf(`{step === 'physician_categories' && (`);
console.log(match);
