const fs = require('fs');

let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

content = content.replace(
  `export function PatientApp({ patientId, userName }: { patientId: string, userName?: string }) {`,
  `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
