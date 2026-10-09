const fs = require('fs');
let content = fs.readFileSync('firestore.rules', 'utf8');

const injection = `
    match /physician_bookings/{bookingId} {
      allow create: if isClient() && request.resource.data.clientId == request.auth.uid && request.resource.data.amount == 15000;
      allow read: if (request.auth != null && resource.data.clientId == request.auth.uid) || isAdmin();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
`;

content = content.replace(`match /pharmacyOrders/{orderId} {`, injection + '\n    match /pharmacyOrders/{orderId} {');
fs.writeFileSync('firestore.rules', content);
console.log("Firestore rules patched");
