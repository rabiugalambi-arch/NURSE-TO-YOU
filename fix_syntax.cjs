const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// The file currently literally has:
// {(categories.length > 0 ? categories : ${JSON.stringify(FALLBACK_CATEGORIES)}).map
// We need to replace it with:
// {(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map

content = content.replace(
  /\{\(categories\.length > 0 \? categories : \$\{JSON\.stringify\(FALLBACK_CATEGORIES\)\}\)\.map/g,
  `{(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map`
);

content = content.replace(
  /\{\(allServices\.length > 0 \? allServices : \$\{JSON\.stringify\(FALLBACK_SERVICES\)\}\)\.filter/g,
  `{(allServices.length > 0 ? allServices : FALLBACK_SERVICES).filter`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Fixed syntax");
