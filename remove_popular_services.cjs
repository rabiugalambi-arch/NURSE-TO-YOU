const fs = require('fs');

let patientContent = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const regex = /<div>\s*<div className="flex justify-between items-center mb-4">\s*<h3 className="text-gray-900 font-semibold">Popular Services<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

patientContent = patientContent.replace(regex, '');

fs.writeFileSync('src/components/PatientApp.tsx', patientContent);
