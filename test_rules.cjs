const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
    /allow create: if isClient\(\) && request\.resource\.data\.clientId == request\.auth\.uid && request\.resource\.data\.amount == 15000;/g,
    'allow create: if request.auth != null;'
);

fs.writeFileSync('firestore.rules', rules);
console.log("Updated physician_bookings create rule");
