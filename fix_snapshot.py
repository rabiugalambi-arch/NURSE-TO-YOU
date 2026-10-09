import sys

# AdminApp
admin = open('src/components/AdminApp.tsx').read()
admin = admin.replace(
'''            unsubProviders = onSnapshot(collection(db, 'providers'), (snap) => {
              const data: Provider[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Provider));
              setProviders(data);
            });''',
'''            unsubProviders = onSnapshot(collection(db, 'providers'), (snap) => {
              const data: Provider[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Provider));
              setProviders(data);
            }, (err) => console.warn('Provider snapshot error (likely auth change):', err.message));'''
)
admin = admin.replace(
'''            unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
              const data: Booking[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Booking));
              setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
            });''',
'''            unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
              const data: Booking[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Booking));
              setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
            }, (err) => console.warn('Bookings snapshot error (likely auth change):', err.message));'''
)
admin = admin.replace(
'''            unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setServices(data);
            });''',
'''            unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setServices(data);
            }, (err) => console.warn('Services snapshot error (likely auth change):', err.message));'''
)
open('src/components/AdminApp.tsx', 'w').write(admin)

# ProviderApp
provider = open('src/components/ProviderApp.tsx').read()
provider = provider.replace(
'''    const unsubProvider = onSnapshot(doc(db, 'providers', providerId), (docSnap) => {
      if (docSnap.exists()) {
        setProviderData({ ...docSnap.data(), id: docSnap.id } as Provider);
      }
    });''',
'''    const unsubProvider = onSnapshot(doc(db, 'providers', providerId), (docSnap) => {
      if (docSnap.exists()) {
        setProviderData({ ...docSnap.data(), id: docSnap.id } as Provider);
      }
    }, (err) => console.warn('Provider snapshot error:', err.message));'''
)
provider = provider.replace(
'''    const unsubBookings = onSnapshot(q, (snapshot) => {
      const reqs: Booking[] = [];
      snapshot.forEach((d) => reqs.push({ ...d.data(), id: d.id } as Booking));
      // Sort by newest first
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(reqs);
    });''',
'''    const unsubBookings = onSnapshot(q, (snapshot) => {
      const reqs: Booking[] = [];
      snapshot.forEach((d) => reqs.push({ ...d.data(), id: d.id } as Booking));
      // Sort by newest first
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(reqs);
    }, (err) => console.warn('Bookings snapshot error:', err.message));'''
)
open('src/components/ProviderApp.tsx', 'w').write(provider)

print("Done")
