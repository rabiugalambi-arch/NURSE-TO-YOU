const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const anchor = `const [address, setAddress] = useState('');`;

const newState = `
  const [physicianForm, setPhysicianForm] = useState({
    name: userName || '',
    phone: '',
    email: '',
    address: address || '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  const [physicianPaymentStatus, setPhysicianPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');

  const confirmPhysicianBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhysicianPaymentStatus('processing');
    
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        const bNumber = '#PHY-' + Math.floor(10000 + Math.random() * 90000);
        setBookingNumber(bNumber);
        
        await runTransaction(db, async (trans) => {
          const bookingRef = doc(collection(db, 'physician_bookings'));
          trans.set(bookingRef, {
            bookingId: bNumber,
            clientId: patientId,
            clientName: physicianForm.name,
            clientPhone: physicianForm.phone,
            clientEmail: physicianForm.email,
            clientAddress: physicianForm.address,
            clientLocation: location,
            serviceType: 'Physician Care',
            amount: 15000,
            currency: 'NGN',
            paymentStatus: 'paid',
            bookingStatus: 'pending_admin_processing',
            preferredDate: physicianForm.date,
            preferredTime: physicianForm.time,
            reason: physicianForm.reason,
            notes: physicianForm.notes,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            paymentReference: 'TXN_' + Date.now() + Math.floor(Math.random()*1000)
          });
          
          // Create admin notification
          const notifRef = doc(collection(db, 'admin_notifications'));
          trans.set(notifRef, {
            type: 'new_physician_booking',
            title: 'NEW PHYSICIAN BOOKING — ₦15,000 PAID',
            message: \`Client \${physicianForm.name} booked a physician for \${physicianForm.date} at \${physicianForm.time}.\`,
            bookingId: bNumber,
            amount: 15000,
            clientId: patientId,
            createdAt: serverTimestamp(),
            read: false,
            link: \`/admin/physician_bookings/\${bookingRef.id}\`
          });
        });
        
        setPhysicianPaymentStatus('success');
        setTimeout(() => {
          setStep('physician_success');
          setPhysicianPaymentStatus('idle');
        }, 1500);
      } catch (err) {
        console.error('Error processing physician booking:', err);
        setPhysicianPaymentStatus('failed');
      }
    }, 2000);
  };
`;

if(content.includes(anchor) && !content.includes('physicianPaymentStatus')) {
  content = content.replace(anchor, anchor + '\n' + newState);
  fs.writeFileSync('src/components/PatientApp.tsx', content);
  console.log("State injected");
} else {
  console.log("Anchor not found or already injected");
}
