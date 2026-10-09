const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

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
  'AMBULANCE SERVICE': '🚑',
};
`;

content = content.replace(
  /const CATEGORY_ICONS: Record<string, string> = \{[\s\S]*?\};/,
  emojiCode.trim()
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Patched icons!");
