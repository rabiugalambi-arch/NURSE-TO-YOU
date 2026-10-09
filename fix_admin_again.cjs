const fs = require('fs');

let admin = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

// Add state variables
if (!admin.includes('const [physicianBookings, setPhysicianBookings]')) {
    admin = admin.replace(
        /const \[bookings, setBookings\] = useState<Booking\[\]>\(\[\]\);/,
        `const [bookings, setBookings] = useState<Booking[]>([]);\n  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);\n  const [physicianFilter, setPhysicianFilter] = useState('All');`
    );
}

// Add variable declaration
if (!admin.includes('let unsubPhysicianBookings: any;')) {
    admin = admin.replace(
        /let unsubApps: any;/,
        `let unsubApps: any;\n    let unsubPhysicianBookings: any;`
    );
}

// Add the subscription logic
if (!admin.includes('unsubPhysicianBookings = onSnapshot(collection(db, \'physician_bookings\')')) {
    admin = admin.replace(
        /unsubApps = onSnapshot\(collection\(db, 'providerApplications'\), \(snap\) => \{/g,
        `unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setPhysicianBookings(data);
            }, (err) => console.warn('Physician bookings snapshot error:', err.message));
            unsubApps = onSnapshot(collection(db, 'providerApplications'), (snap) => {`
    );
}

// The error for `unsubPhysicianBookings` was `Cannot find name 'unsubPhysicianBookings'`, but wait:
// Let's make sure it handles checking if unsubPhysicianBookings exists in the else block.
admin = admin.replace(/unsubPhysicianBookings\(\);/g, `if (unsubPhysicianBookings) unsubPhysicianBookings();`);


fs.writeFileSync('src/components/AdminApp.tsx', admin);
console.log("AdminApp fixed");
