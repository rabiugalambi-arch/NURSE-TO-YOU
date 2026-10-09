const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes('serviceCategories')) {
  rules = rules.replace(
    /match \/services\/\{document=\*\*\} \{([\s\S]*?)\}/,
    "match /services/{document=**} {$1}\n    \n    match /serviceCategories/{document=**} {\n      allow read: if request.auth != null;\n      allow write: if isAdmin();\n    }"
  );
  fs.writeFileSync('firestore.rules', rules);
  console.log('Patched rules');
}
