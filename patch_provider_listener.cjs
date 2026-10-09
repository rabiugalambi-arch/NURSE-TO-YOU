const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

const replacement = `
    const unsubBookings = onSnapshot(q, (snapshot) => {
      const reqs: Booking[] = [];
      snapshot.forEach((d) => reqs.push({ ...d.data(), id: d.id } as Booking));
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(reqs);

      snapshot.docChanges().forEach((change) => {
        const booking = change.doc.data() as Booking;
        const bookingId = change.doc.id;
        
        if (change.type === 'added') {
          // If a new booking is added and is requested
          if (booking.status === 'REQUESTED') {
            const timeDiff = Date.now() - booking.createdAt;
            // Only notify if it's recently created (within last hour) to avoid spam on initial load
            if (timeDiff < 60 * 60 * 1000) {
              triggerNotification(
                \`\${bookingId}-NEW\`, 
                'New Booking Received', 
                \`Client: \${booking.clientName}\\nService: \${booking.service}\\nDate: \${booking.date} \${booking.time}\`, 
                'info'
              );
            }
          }
        } else if (change.type === 'modified') {
          if (booking.status === 'CANCELLED') {
            triggerNotification(\`\${bookingId}-CANCELLED\`, 'Booking Cancelled', \`The booking with \${booking.clientName} has been cancelled.\`, 'warning');
          }
        }
      });
    }, (err) => console.warn('Bookings snapshot error:', err.message));`;

content = content.replace(
  `    const unsubBookings = onSnapshot(q, (snapshot) => {
      const reqs: Booking[] = [];
      snapshot.forEach((d) => reqs.push({ ...d.data(), id: d.id } as Booking));
      // Sort by newest first
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(reqs);
    }, (err) => console.warn('Bookings snapshot error:', err.message));`,
  replacement.trim()
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
