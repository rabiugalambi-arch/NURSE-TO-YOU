import sys

content = open('src/components/ProviderApp.tsx').read()

# Replace updateBookingStatus
old_status = '''  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };'''

new_status = '''  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
      
      // If completed or cancelled, free up the provider
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        await updateDoc(doc(db, 'providers', providerId), {
          isBusy: false,
          currentBookingId: null
        });
      }
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };'''

content = content.replace(old_status, new_status)

open('src/components/ProviderApp.tsx', 'w').write(content)
print("Updated ProviderApp")
