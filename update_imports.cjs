const fs = require('fs');

['src/components/PatientApp.tsx', 'src/components/ProviderApp.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    `import { calculateDistance`,
    `import { triggerNotification } from '../lib/notifications';\nimport { calculateDistance`
  );
  fs.writeFileSync(file, content);
});
