const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

content = content.replace(
  `{b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                      <div className="px-5 pb-3">
                        {activeTrackingBookingId === b.id ? (`,
  `{b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.bookingType !== 'physician' && (
                      <div className="px-5 pb-3">
                        {activeTrackingBookingId === b.id ? (`
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
