const fs = require('fs');

const emojiCode = `
const CATEGORY_ICONS: Record<string, string> = {
  'MEDICATION': '💉',
  'WOUND CARE': '🩹',
  'RESPIRATORY CARE': '🫁',
  'HEALTH MONITORING': '❤️',
  'URINARY CARE': '🚻',
  'GASTRO CARE': '🩺',
  'PHYSICAL CARE': '🧑‍🦽',
  'DIAGNOSTIC CARE': '🔬',
  'OTHER LABORATORY SERVICES': '🧪',
  'PREGNANCY CARE': '🤰',
  'FAMILY PLANNING SERVICES': '👨‍👩‍👧',
  'GENERAL HEALTH EDUCATION': '📚',
  'ORAL HEALTH': '🦷',
  'EYE CARE': '👁️',
  'EAR, NOSE AND THROAT (ENT) CARE': '👂',
  'SKIN CARE': '🧴',
  'ORTHOPEDIC CARE': '🦴',
  'MENTAL HEALTH': '🧠',
  'PEDIATRIC / KIDS HEALTH': '👶',
  'PHYSICIAN CARE': '👨‍⚕️',
  'AMBULANCE SERVICE': '🚑',
  // Leaving these as they might be used elsewhere
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
console.log("Patched emojis successfully");
