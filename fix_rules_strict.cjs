const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
    /match \/physician_bookings\/\{bookingId\} \{\s*allow create: if request\.auth != null;/,
    `match /physician_bookings/{bookingId} {
      allow create: if request.auth != null && request.resource.data.clientId == request.auth.uid && request.resource.data.amount == 15000;`
);

fs.writeFileSync('firestore.rules', rules);
console.log("Strict rules restored for physician_bookings");
