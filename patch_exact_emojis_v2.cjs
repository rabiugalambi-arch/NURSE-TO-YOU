const fs = require('fs');

const emojiCode = `
const CATEGORY_ICONS: Record<string, string> = {
  'Medication & Therapy': '💉',
  'Wound Care': '🩹',
  'Respiratory Care': '🫁',
  'Health Monitoring': '❤️',
  'Urinary Care': '🚻',
  'Gastro Care': '🩺',
  'Physical Care': '🧑‍🦽',
  'Diagnostic Services': '🔬',
  'Laboratory Services': '🧪',
  'Pregnancy & Maternity': '🤰',
  'Family Planning': '👨‍👩‍👧',
  'Health Education': '📚',
  'Oral Health': '🦷',
  'Eye Care': '👁️',
  'ENT Care': '👂',
  'Skin Care': '🧴',
  'Orthopedic Care': '🦴',
  'Mental Health': '🧠',
  'Pediatric Care': '👶',
  'Physician Care': '👨‍⚕️',
  'Specialist Care': '🏥',
  'Ambulance Service': '🚑',
  'Pharmacy Services': '💊',
};
`;

let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// Replace the existing CATEGORY_ICONS block
content = content.replace(
  /const CATEGORY_ICONS: Record<string, string> = \{[\s\S]*?\};/,
  emojiCode.trim()
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Patched emojis v2 successfully");
