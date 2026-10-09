const fs = require('fs');

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // We need to inject roles: ['RN', 'LPN'] into the FALLBACK_SERVICES array elements
  content = content.replace(
    /price: 5000,/g,
    `price: 5000,\n      roles: ['RN', 'LPN'],`
  );

  fs.writeFileSync(filename, content);
}

patchFile('src/components/PatientApp.tsx');
patchFile('src/components/AdminApp.tsx');
console.log("Patched fallback roles successfully");
