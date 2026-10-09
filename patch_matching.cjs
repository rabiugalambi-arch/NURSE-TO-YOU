const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// The matching query currently ignores services array. Let's fix that based on the user's requirement.
// The user says "Where appropriate, show providers who are qualified/approved for the selected service. Do NOT allow an unapproved or unqualified provider to appear as available for a regulated service."
content = content.replace(
  /\/\/ Bypassing strict service filtering for testing to ensure providers show up\n\s*\/\/ where\('services', 'array-contains', selectedService.name\),/,
  `// Require the provider to offer the selected service (they configure this in their app)\n        where('services', 'array-contains', selectedService.name),`
);

// In case the `selectedService` might be null here
content = content.replace(
  `where('services', 'array-contains', selectedService.name),`,
  `where('services', 'array-contains', selectedService?.name || ''),`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log('Patched Matching logic');
