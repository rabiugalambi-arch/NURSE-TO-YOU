const fs = require('fs');

let patient = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

patient = patient.replace(
  /t\([^)]+\)/g,
  (match) => {
    let internal = match.substring(2, match.length-1);
    // if there is a comma, it's a multi arg t
    if (internal.includes(',')) {
        return `t(${internal})`;
    }
    return match;
  }
)

fs.writeFileSync('src/components/PatientApp.tsx', patient);
console.log("Fixed patient");
