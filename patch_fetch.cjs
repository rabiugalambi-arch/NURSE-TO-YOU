const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const originalFetch = `    const q = query(
      collection(db, 'bookings'),
      where('patientId', '==', patientId)
    );
const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      b.sort((a, b) => (b.createdAt?.toMillis ? b.createdAt.toMillis() : b.createdAt) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : a.createdAt));
      setClientBookings(b);`;

const newFetch = `    let normalBookings: any[] = [];
    let physicianBookings: any[] = [];

    const updateBookings = () => {
      const b = [...normalBookings, ...physicianBookings];
      b.sort((x, y) => (y.createdAt?.toMillis ? y.createdAt.toMillis() : y.createdAt) - (x.createdAt?.toMillis ? x.createdAt.toMillis() : x.createdAt));
      setClientBookings(b);
    };

    const q = query(
      collection(db, 'bookings'),
      where('patientId', '==', patientId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      normalBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateBookings();`;

content = content.replace(originalFetch, newFetch);

const originalUnsubReturn = `    return () => {
      unsubServices();
      unsubCategories();
      unsubscribe();
    };`;

const newUnsubReturn = `    const unsubPhysician = onSnapshot(query(collection(db, 'physician_bookings'), where('clientId', '==', patientId)), (snap) => {
      physicianBookings = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          isPhysicianBooking: true,
          status: data.bookingStatus,
          service: 'Physician Care',
          providerName: 'Physician',
          date: data.preferredDate,
          time: data.preferredTime
        };
      });
      updateBookings();
    });

    return () => {
      unsubServices();
      unsubCategories();
      unsubscribe();
      unsubPhysician();
    };`;

content = content.replace(originalUnsubReturn, newUnsubReturn);

fs.writeFileSync('src/components/PatientApp.tsx', content);
