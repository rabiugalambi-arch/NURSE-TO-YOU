const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

admin = admin.replace(
  /const unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g,
  `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
);

if(!admin.includes('const [physicianBookings')) {
    admin = admin.replace(/const \[bookings, setBookings\] = useState<any\[\]>\(\[\]\);/g, "const [bookings, setBookings] = useState<any[]>([]);\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');");
}
fs.writeFileSync('src/components/AdminApp.tsx', admin);


let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
lang = lang.replace(
    /const t = \(key: string\) => \{/g,
    `const t = (key: string, _arg2?: any) => {`
);

let existingTranslations = lang.match(/const HAUSA_TRANSLATIONS: Record<string, string> = {([^}]*)}/s);
if (!existingTranslations) {
    lang = lang.replace(
        /export function LanguageProvider/g,
        `const HAUSA_TRANSLATIONS: Record<string, string> = {};\nexport function LanguageProvider`
    )
}

fs.writeFileSync('src/contexts/LanguageContext.tsx', lang);
console.log("Cleaned up final 2");
