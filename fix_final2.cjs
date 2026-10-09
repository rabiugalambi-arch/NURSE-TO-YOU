const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

const targetUnsub = `let unsubPhysicianBookings = () => {};
      unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings')`;
if (!admin.includes(targetUnsub)) {
    admin = admin.replace(/unsubPhysicianBookings = onSnapshot\(collection\(db, 'physician_bookings'\)/g, targetUnsub);
}

// Just globally replace the state anchor manually if not present
if (!admin.includes('const [physicianBookings')) {
    admin = admin.replace(/const \[bookings, setBookings\] = useState<any\[\]>\(\[\]\);/g, "const [bookings, setBookings] = useState<any[]>([]);\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');");
}
fs.writeFileSync('src/components/AdminApp.tsx', admin);

// For the language context, just strip all lines matching `'...' : '...'` from the HAUSA_TRANSLATIONS that are duplicates, I'll just write a script to dedup by evaling
let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
let outLines = [];
let inHausa = false;
let seenKeys = new Set();
for(let line of lang.split('\\n')) {
  if (line.includes('const HAUSA_TRANSLATIONS')) inHausa = true;
  if (inHausa && line.includes('}')) inHausa = false;
  
  if (inHausa) {
      let m = line.match(/^\\s*'([^']+)'\\s*:/);
      if (m) {
          if (seenKeys.has(m[1])) continue;
          seenKeys.add(m[1]);
      }
  }
  outLines.push(line);
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', outLines.join('\\n'));
console.log("Fixed again v4");
