const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /match \/serviceCategories\/\{document=\*\*\} \{([\s\S]*?)\}/,
  "match /serviceCategories/{document=**} { allow read, write: if true; }"
);

rules = rules.replace(
  /match \/services\/\{document=\*\*\} \{([\s\S]*?)\}/,
  "match /services/{document=**} { allow read, write: if true; }"
);

fs.writeFileSync('firestore.rules', rules);
