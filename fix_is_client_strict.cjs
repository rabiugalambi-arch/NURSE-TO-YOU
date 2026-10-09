const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
    /function isClient\(\) \{\s*return request\.auth != null;\s*\}/,
    `function isClient() {
      return request.auth != null && (
        isAdmin() ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'client')
      );
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log("Strict rules restored for isClient");
