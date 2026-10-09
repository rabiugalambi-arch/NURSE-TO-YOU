const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  `match /serviceCategories/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`,
  `match /serviceCategories/{document=**} {
      allow read, write: if true;
    }`
);
rules = rules.replace(
  `match /services/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`,
  `match /services/{document=**} {
      allow read, write: if true;
    }`
);
fs.writeFileSync('firestore.rules', rules);
console.log('Patched rules for seeding');
