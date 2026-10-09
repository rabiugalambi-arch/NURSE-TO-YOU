const fs = require('fs');
let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');
if (!admin.includes('const [physicianBookings, setPhysicianBookings]')) {
    let anchor = `  const [bookings, setBookings] = useState<any[]>([]);`;
    admin = admin.replace(anchor, anchor + `\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');`);
}
fs.writeFileSync('src/components/AdminApp.tsx', admin);
console.log("Admin fixed state vars");
