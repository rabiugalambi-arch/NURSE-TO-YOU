const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

let fixedAdmin = admin.replace(
  /const unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g,
  `let unsubPhysicianBookings = () => {};\n      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`
);

let stateVarMissing = !fixedAdmin.includes('const [physicianBookings');
if(stateVarMissing) {
    fixedAdmin = fixedAdmin.replace(/const \[bookings, setBookings\] = useState<any\[\]>\(\[\]\);/g, "const [bookings, setBookings] = useState<any[]>([]);\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');");
}
fs.writeFileSync('src/components/AdminApp.tsx', fixedAdmin);

let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
let newLines = [];
for (let line of lang.split('\\n')) {
    if (line.includes("'Physician Care' :") || line.includes("'Physician Care':")) { continue; } // strip to rely on the fact that if we have a duplicate error we can just rebuild it properly or not include the keys
    newLines.push(line);
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', newLines.join('\\n'));
console.log("Cleaned up final");
