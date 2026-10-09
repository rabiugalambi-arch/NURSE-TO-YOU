const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

let startStr = `{step === 'results'`;
let start = content.indexOf(startStr);
let end = content.indexOf(`{step === 'provider_profile'`, start);

console.log(content.substring(start, end));
