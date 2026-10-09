const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

content = content.replace(/\\nexport function PatientApp/g, '\nexport function PatientApp');

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log('Fixed newline');
