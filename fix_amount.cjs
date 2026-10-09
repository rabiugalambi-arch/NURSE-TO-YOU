const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
    /allow create: if isClient\(\);/g,
    'allow create: if isClient() && request.resource.data.clientId == request.auth.uid && request.resource.data.amount == 15000;'
);

fs.writeFileSync('firestore.rules', rules);
console.log("Restored amount check in firestore.rules");
