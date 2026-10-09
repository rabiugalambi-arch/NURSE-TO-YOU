const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

// Update AdminView type
content = content.replace(
  `type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications' | 'pharmacy';`,
  `type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications' | 'pharmacy' | 'physician_bookings';`
);

// Add NavItem
content = content.replace(
  `<NavItem icon={<Activity size={20}/>} label="Bookings" active={activeView === 'bookings'} onClick={() => { setActiveView('bookings'); setIsMobileMenuOpen(false); }} />`,
  `<NavItem icon={<Activity size={20}/>} label="Bookings" active={activeView === 'bookings'} onClick={() => { setActiveView('bookings'); setIsMobileMenuOpen(false); }} />\n          <NavItem icon={<Stethoscope size={20}/>} label="Physician Bookings" active={activeView === 'physician_bookings'} onClick={() => { setActiveView('physician_bookings'); setIsMobileMenuOpen(false); }} />`
);

// Add State for physician bookings
const anchor = `  const [bookings, setBookings] = useState<any[]>([]);`;
const newState = `  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);
  const [physicianFilter, setPhysicianFilter] = useState('All');`;
if(content.includes(anchor)) {
  content = content.replace(anchor, anchor + '\n' + newState);
}

// Add fetch
const fetchAnchor = `      const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {`;
const newFetch = `      const unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings'), (snap) => {
        const pb: any[] = [];
        snap.forEach(doc => pb.push({ id: doc.id, ...doc.data() }));
        pb.sort((a,b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0));
        setPhysicianBookings(pb);
      });`;
if(content.includes(fetchAnchor)) {
  content = content.replace(fetchAnchor, newFetch + '\n' + fetchAnchor);
}

// Add unsub to return
const unsubAnchor = `unsubBookings();`;
if(content.includes(unsubAnchor)) {
  content = content.replace(unsubAnchor, unsubAnchor + '\n        unsubPhysicianBookings();');
}

fs.writeFileSync('src/components/AdminApp.tsx', content);
console.log("AdminApp patched");
