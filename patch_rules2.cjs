const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
  /allow read: if isAdmin\(\) \|\| \n\s*\(isClient\(\) && resource\.data\.patientId == request\.auth\.uid\) \|\|\n\s*\(isProvider\(\) && resource\.data\.providerId == request\.auth\.uid\);/,
  "allow read: if (request.auth != null && resource.data.patientId == request.auth.uid) || (request.auth != null && resource.data.providerId == request.auth.uid) || isAdmin();"
);

rules = rules.replace(
  /allow update: if isAdmin\(\) \|\| \n\s*\(isClient\(\) && resource\.data\.patientId == request\.auth\.uid\) \|\|\n\s*\(isProvider\(\) && resource\.data\.providerId == request\.auth\.uid\);/,
  "allow update: if (request.auth != null && resource.data.patientId == request.auth.uid) || (request.auth != null && resource.data.providerId == request.auth.uid) || isAdmin();"
);

rules = rules.replace(
  /allow read: if isAdmin\(\) \|\| \(isClient\(\) && resource\.data\.clientId == request\.auth\.uid\);/,
  "allow read: if (request.auth != null && resource.data.clientId == request.auth.uid) || isAdmin();"
);

fs.writeFileSync('firestore.rules', rules);
