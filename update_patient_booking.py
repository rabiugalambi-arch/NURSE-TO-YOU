import sys

content = open('src/components/PatientApp.tsx').read()

# Make sure runTransaction is imported
if 'runTransaction' not in content:
    content = content.replace("import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';", "import { collection, query, where, getDocs, addDoc, runTransaction, doc } from 'firebase/firestore';")

# Replace confirmBooking
old_confirm = '''  const confirmBooking = async () => {
    if (!selectedProvider || !selectedService || !location || !patientId) return;
    
    try {
      const bNumber = '#NTY-' + Math.floor(10000 + Math.random() * 90000);
      setMockBookingNumber(bNumber);
      
      await addDoc(collection(db, 'bookings'), {
        bookingId: bNumber,
        patientId: patientId,
        providerId: selectedProvider.id || selectedProvider.providerId,
        service: selectedService.name,
        patientLatitude: location.lat,
        patientLongitude: location.lng,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: selectedService.price,
        status: 'REQUESTED',
        createdAt: Date.now()
      });
      
      setStep('success');
    } catch (err: any) {
      console.error("Error booking", err?.message || err);
      alert("Failed to create booking.");
    }
  };'''

new_confirm = '''  const confirmBooking = async () => {
    if (!selectedProvider || !selectedService || !location || !patientId) return;
    
    try {
      const bNumber = '#NTY-' + Math.floor(10000 + Math.random() * 90000);
      setMockBookingNumber(bNumber);
      
      await runTransaction(db, async (t) => {
        const providerRef = doc(db, 'providers', selectedProvider.id || selectedProvider.providerId);
        const pSnap = await t.get(providerRef);
        
        if (!pSnap.exists()) {
          throw new Error("Provider not found");
        }
        
        const pData = pSnap.data();
        
        if (!pData.verified) {
            throw new Error("Provider is pending verification.");
        }
        if (!pData.available) {
            throw new Error("Provider is currently offline.");
        }
        if (pData.isBusy) {
            throw new Error("Provider is currently busy with another client. Please select another provider.");
        }
        if (!pData.services.includes(selectedService.name)) {
            throw new Error("Provider is not qualified for this service.");
        }

        const newBookingRef = doc(collection(db, 'bookings'));
        
        t.set(newBookingRef, {
          bookingId: bNumber,
          patientId: patientId,
          providerId: selectedProvider.id || selectedProvider.providerId,
          service: selectedService.name,
          patientLatitude: location.lat,
          patientLongitude: location.lng,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedService.price,
          status: 'REQUESTED',
          createdAt: Date.now()
        });

        t.update(providerRef, {
          isBusy: true,
          currentBookingId: newBookingRef.id
        });
      });
      
      setStep('success');
    } catch (err: any) {
      console.error("Error booking", err?.message || err);
      alert(err.message || "Failed to create booking. The provider may have just been booked by someone else.");
    }
  };'''

content = content.replace(old_confirm, new_confirm)

# Update provider fetching to filter out busy providers
old_find = '''        if (distanceKm <= (p.serviceArea || 50000) && p.verified) {
          matched.push({ ...p, distanceKm });
        }'''
new_find = '''        if (distanceKm <= (p.serviceArea || 50000) && p.verified && !p.isBusy) {
          matched.push({ ...p, distanceKm });
        }'''
content = content.replace(old_find, new_find)

open('src/components/PatientApp.tsx', 'w').write(content)
print("Updated PatientApp")
