import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

replacement = '''        t.update(providerRef, {
          isBusy: true,
          currentBookingId: newBookingRef.id
        });
        
        // Create admin notification
        const notifRef = doc(collection(db, 'admin_notifications'));
        t.set(notifRef, {
          type: 'new_nurse_booking',
          title: `NEW ${selectedService.name.toUpperCase()} BOOKING`,
          message: `Client ${clientName || 'Client'} booked ${selectedService.name} with ${pData.name || 'Healthcare Provider'}.`,
          bookingId: bNumber,
          amount: selectedService.price,
          clientId: patientId,
          createdAt: serverTimestamp(),
          read: false,
          link: `/admin/bookings/${newBookingRef.id}`
        });'''

content = re.sub(
    r't\.update\(providerRef, \{\s*isBusy: true,\s*currentBookingId: newBookingRef\.id\s*\}\);',
    replacement,
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
