const fs = require('fs');

let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const newTranslations = `
    'Search for a service...': 'Nemo sabis...',
    'No services found. Try another search.': 'Ba a sami sabis ba. Gwada wani bincike.',
    'Book Now': 'Yi Booking Yanzu',
    'Price varies': 'Farashi ya danganta',
`;

content = content.replace(
  `'Search for services (e.g., Malaria Test)': 'Nemi sabis (misali, Gwajin Zazzabin Cizon Sauro)',`,
  `'Search for services (e.g., Malaria Test)': 'Nemi sabis (misali, Gwajin Zazzabin Cizon Sauro)',\n${newTranslations}`
);

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log("Patched language context");
