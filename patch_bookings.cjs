const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const originalBookingFetch = `    const q = query(
      collection(db, 'bookings'),
      where('patientId', '==', patientId)
    );
const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      b.sort((a, b) => b.createdAt - a.createdAt);
      setClientBookings(b);`;

const newBookingFetch = `    const q = query(
      collection(db, 'bookings'),
      where('patientId', '==', patientId)
    );
const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      b.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt));
      setClientBookings(b);`;

content = content.replace(originalBookingFetch, newBookingFetch);

// Wait, the clientBookings type is Booking[]
content = content.replace(`const [clientBookings, setClientBookings] = useState<Booking[]>([]);`, `const [clientBookings, setClientBookings] = useState<any[]>([]);`);

fs.writeFileSync('src/components/PatientApp.tsx', content);
