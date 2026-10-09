const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

// Add a local tracking variable near the top (outside component)
content = content.replace(
  `import { cn } from '../lib/utils';
import { triggerNotification } from '../lib/notifications';`,
  `import { cn } from '../lib/utils';
import { triggerNotification } from '../lib/notifications';\n\nconst locallyCancelledBookings = new Set<string>();`
);

// Update updateBookingStatus
content = content.replace(
  `  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });`,
  `  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    if (status === 'CANCELLED') {
      locallyCancelledBookings.add(bookingId);
    }
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });`
);

// Update onSnapshot
content = content.replace(
  `        } else if (change.type === 'modified') {
          if (booking.status === 'CANCELLED') {
            triggerNotification(\`\${bookingId}-CANCELLED\`, 'Booking Cancelled', \`The booking with \${booking.clientName} has been cancelled.\`, 'warning');
          }
        }`,
  `        } else if (change.type === 'modified') {
          if (booking.status === 'CANCELLED') {
            // Only notify provider if they didn't just cancel it themselves
            if (!locallyCancelledBookings.has(bookingId)) {
              triggerNotification(\`\${bookingId}-CANCELLED\`, 'Booking Cancelled', \`The booking with \${booking.clientName} has been cancelled by the client.\`, 'warning');
            }
          }
        }`
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
