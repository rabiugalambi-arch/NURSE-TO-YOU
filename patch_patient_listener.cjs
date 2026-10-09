const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const replacement = `
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      b.sort((a, b) => b.createdAt - a.createdAt);
      setClientBookings(b);

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const booking = change.doc.data() as Booking;
          const bookingId = change.doc.id;
          
          if (booking.status === 'ACCEPTED') {
            triggerNotification(\`\${bookingId}-ACCEPTED\`, 'Booking Confirmed', 'Your booking has been confirmed.', 'success');
          } else if (booking.status === 'CANCELLED' || booking.status === 'DECLINED') {
            triggerNotification(\`\${bookingId}-\${booking.status}\`, 'Booking Status Update', \`Your booking has been \${booking.status.toLowerCase()}.\`, 'warning');
          } else if (booking.status === 'ARRIVED') {
            triggerNotification(\`\${bookingId}-ARRIVED\`, 'Provider Arrived', 'Your provider has arrived.', 'info');
          } else if (booking.status === 'COMPLETED') {
            triggerNotification(\`\${bookingId}-COMPLETED\`, 'Booking Completed', 'Your booking has been completed.', 'success');
          }
        }
      });
    });`;

content = content.replace(
  `    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      b.sort((a, b) => b.createdAt - a.createdAt);
      setClientBookings(b);
    });`,
  replacement.trim()
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
