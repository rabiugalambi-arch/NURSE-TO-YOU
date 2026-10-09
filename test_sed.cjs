const fs = require('fs');

let adminContent = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

adminContent = adminContent.replace(
  `import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store } from 'lucide-react';`,
  `import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store, Stethoscope, Phone, Mail } from 'lucide-react';`
);

adminContent = adminContent.replace(
  `import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';`,
  `import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';`
);

adminContent = adminContent.replace(
  `const unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`,
  `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
);

fs.writeFileSync('src/components/AdminApp.tsx', adminContent);

let patientContent = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');
patientContent = patientContent.replace(
  `import { collection, query, where, onSnapshot, doc, getDocs, runTransaction } from 'firebase/firestore';`,
  `import { collection, query, where, onSnapshot, doc, getDocs, runTransaction, serverTimestamp } from 'firebase/firestore';`
);
fs.writeFileSync('src/components/PatientApp.tsx', patientContent);

let langContent = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
let lines = langContent.split('\n');
let seen = new Set();
let cleaned = [];
for(let line of lines) {
  if (line.match(/^\\s*'([^']+)'\\s*:/)) {
    let key = line.match(/^\\s*'([^']+)'\\s*:/)[1];
    if (seen.has(key)) continue;
    seen.add(key);
  }
  cleaned.push(line);
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', cleaned.join('\n'));

console.log("Fixed manually via node");
