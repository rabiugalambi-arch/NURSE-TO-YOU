const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

// Fix getDoc
if(!admin.includes('getDoc } from \'firebase/firestore\'')) {
    admin = admin.replace(/getDocs, query, where, setDoc \} from 'firebase\/firestore';/, `getDocs, query, where, setDoc, getDoc } from 'firebase/firestore';`);
}

// Ensure state variables exist. They must have been blown away by sed or patch.
const stateAnchor = `  const [bookings, setBookings] = useState<any[]>([]);`;
if (admin.includes(stateAnchor) && !admin.includes('const [physicianBookings')) {
    admin = admin.replace(stateAnchor, stateAnchor + `\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');`);
}

// Re-inject unsub scope correctly
admin = admin.replace(
  /let unsubPhysicianBookings = \(\) => \{\};\n      unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g,
  `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
);
if (!admin.includes('let unsubPhysicianBookings')) {
     admin = admin.replace(
        /const unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g,
        `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
      );
}

fs.writeFileSync('src/components/AdminApp.tsx', admin);

// Fix language context duplicates
let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
let fixedLang = lang.replace(/'Price varies': 'Farashi ya danganta',\s*/g, ''); // strip it globally
// re-add it once at the top of the hausa object
fixedLang = fixedLang.replace(/const HAUSA_TRANSLATIONS: Record<string, string> = \{/, "const HAUSA_TRANSLATIONS: Record<string, string> = {\n  'Price varies': 'Farashi ya danganta',");

fs.writeFileSync('src/contexts/LanguageContext.tsx', fixedLang);

console.log("Final fix run");
