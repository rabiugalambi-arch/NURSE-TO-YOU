const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

content = content.replace(
  `onClick={() => setStep('physician_categories')}`,
  `onClick={() => setStep('physician_booking_form')}`
);

// Oh wait, there are two onClick handlers on the banner (the div and the button inside).
content = content.replace(
  `onClick={(e) => { e.stopPropagation(); setStep('physician_categories'); }}`,
  `onClick={(e) => { e.stopPropagation(); setStep('physician_booking_form'); }}`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
