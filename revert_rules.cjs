const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  `match /serviceCategories/{document=**} {
      allow read, write: if true;
    }`,
  `match /serviceCategories/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`
);
rules = rules.replace(
  `match /services/{document=**} {
      allow read, write: if true;
    }`,
  `match /services/{document=**} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }`
);
fs.writeFileSync('firestore.rules', rules);
console.log('Reverted rules');
