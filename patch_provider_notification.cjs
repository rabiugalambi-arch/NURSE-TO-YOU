const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

content = content.replace(
  `import { triggerNotification } from '../lib/notifications';`,
  `import { triggerNotification, requestNotificationPermission } from '../lib/notifications';`
);

const oldNotification = `              triggerNotification(
                \`\${bookingId}-NEW\`, 
                'New Booking Received', 
                \`Client: \${booking.clientName}\\nService: \${booking.service}\\nDate: \${booking.date} \${booking.time}\`, 
                'info'
              );`;

const newNotification = `              triggerNotification(
                \`\${bookingId}-NEW\`, 
                'New Booking Received', 
                \`Client: \${booking.clientName}\\nService: \${booking.service}\\nDate: \${booking.date} \${booking.time}\`, 
                'new-booking',
                () => setTab('requests')
              );`;

content = content.replace(oldNotification, newNotification);

// Let's add a permission banner if notification permission is default.
// The component is "ProviderApp". We can add it at the top of the 'requests' tab.
// Let's find where the 'requests' tab is rendered.
