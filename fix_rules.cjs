const fs = require('fs');

let rules = fs.readFileSync('firestore.rules', 'utf8');

if (!rules.includes('match /admin_notifications/{notificationId}')) {
    rules = rules.replace(
        /match \/\{document=\*\*\} \{/,
        `match /admin_notifications/{notificationId} {
      allow create: if request.auth != null;
      allow read, update, delete: if isAdmin();
    }
    match /{document=**} {`
    )
}

fs.writeFileSync('firestore.rules', rules);
console.log("Rules fixed locally");
