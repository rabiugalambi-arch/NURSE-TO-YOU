const fs = require('fs');

let adminContent = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

if (!adminContent.includes('Mail } from \'lucide-react\'')) {
  adminContent = adminContent.replace(
    /import \{[^}]+\} from 'lucide-react';/g,
    `import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store, Stethoscope, Phone, Mail } from 'lucide-react';`
  );
}

if (!adminContent.includes('addDoc } from \'firebase/firestore\'')) {
  adminContent = adminContent.replace(
    /import \{[^}]+\} from 'firebase\/firestore';/g,
    `import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc, getDocs, query, where, setDoc } from 'firebase/firestore';`
  );
}

adminContent = adminContent.replace(
  /const unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g,
  `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
);

fs.writeFileSync('src/components/AdminApp.tsx', adminContent);

let patientContent = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');
if (!patientContent.includes('serverTimestamp } from \'firebase/firestore\'')) {
    patientContent = patientContent.replace(
    /import \{[^}]+\} from 'firebase\/firestore';/g,
    `import { collection, query, where, onSnapshot, doc, getDocs, runTransaction, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';`
    );
}
fs.writeFileSync('src/components/PatientApp.tsx', patientContent);

let langContent = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
let lines = langContent.split('\\n');
let seen = new Set();
let cleaned = [];
for(let line of lines) {
  let match = line.match(/^\\s*'([^']+)'\\s*:/);
  if (match) {
    let key = match[1];
    if (seen.has(key)) {
        continue;
    }
    seen.add(key);
  }
  cleaned.push(line);
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', cleaned.join('\\n'));

console.log("Fixed again v3");
