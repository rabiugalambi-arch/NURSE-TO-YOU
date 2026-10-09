import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Replace distance calculation and location handling in booking
booking_old = '''        const distanceKm = calculateDistance(
          location.lat, location.lng,
          pData.latitude, pData.longitude
        );

        const newBookingRef = doc(collection(db, 'bookings'));
        
        t.set(newBookingRef, {
          bookingId: bNumber,
          patientId: patientId,
          providerId: selectedProvider.id || selectedProvider.providerId,
          service: selectedService.name,
          patientLatitude: location.lat,
          patientLongitude: location.lng,
          date: physicianDate || new Date().toISOString().split('T')[0],
          time: physicianTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedService.price,
          status: 'REQUESTED',
          paymentStatus: paymentMethod === 'test' ? 'paid_test' : 'paid',
          paymentMode: paymentMethod === 'test' ? 'test' : 'real',
          transactionReference: paymentMethod === 'test' ? 'TEST_' + Date.now() : null,
          bookingType: selectedService.name.includes('Physician') ? 'physician' : 'nurse',
          consultationType: selectedService.name.includes('Physician') ? consultationType : null,
          specialty: selectedProvider.specialty || null,
          createdAt: Date.now(),
          clientName: clientName || 'Client',
          clientPhone: clientPhone || '',
          providerName: pData.fullName || 'Provider',
          distance: distanceKm,
          estimatedArrival: Math.round(distanceKm * 5)
        });'''

booking_new = '''        let distanceKm = null;
        if (location && location.lat && location.lng && pData.latitude && pData.longitude) {
          distanceKm = calculateDistance(
            location.lat, location.lng,
            pData.latitude, pData.longitude
          );
        }

        const newBookingRef = doc(collection(db, 'bookings'));
        
        t.set(newBookingRef, {
          bookingId: bNumber,
          patientId: patientId,
          providerId: selectedProvider.id || selectedProvider.providerId,
          service: selectedService.name,
          patientLatitude: location ? location.lat : null,
          patientLongitude: location ? location.lng : null,
          patientAddress: address || null,
          date: physicianDate || new Date().toISOString().split('T')[0],
          time: physicianTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: selectedService.price,
          status: 'REQUESTED',
          paymentStatus: paymentMethod === 'test' ? 'paid_test' : 'paid',
          paymentMode: paymentMethod === 'test' ? 'test' : 'real',
          transactionReference: paymentMethod === 'test' ? 'TEST_' + Date.now() : null,
          bookingType: selectedService.name.includes('Physician') ? 'physician' : 'nurse',
          consultationType: selectedService.name.includes('Physician') ? consultationType : null,
          specialty: selectedProvider.specialty || null,
          createdAt: Date.now(),
          clientName: clientName || 'Client',
          clientPhone: clientPhone || '',
          providerName: pData.fullName || 'Provider',
          distance: distanceKm,
          estimatedArrival: distanceKm !== null ? Math.round(distanceKm * 5) : 30 // Fallback arrival time
        });'''
content = content.replace(booking_old, booking_new)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
