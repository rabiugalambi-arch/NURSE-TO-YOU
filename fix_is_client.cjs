const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

rules = rules.replace(
    /function isClient\(\) \{[\s\S]*?\}/,
    `function isClient() {
      return request.auth != null;
    }`
);

fs.writeFileSync('firestore.rules', rules);
console.log("Fixed isClient in firestore.rules");
