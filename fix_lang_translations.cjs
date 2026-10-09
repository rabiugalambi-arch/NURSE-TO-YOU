const fs = require('fs');

const translations = `const HAUSA_TRANSLATIONS: Record<string, string> = {
  'Book Physician': 'Yi Ajiyar Likita',
  'Search for services (e.g. malaria test)...': 'Nemi ayyuka...',
  'Physician Care': 'Kula da Likita',
  'Get a qualified physician to visit you at home': 'Samu kwararren likita ya ziyarce ka a gida',
  'Consultation Fee': 'Kudin Dubawa',
  '₦15,000': '₦15,000',
  'Home care and assessment': 'Kula da kuma bincike a gida',
  'Prescription and basic treatment': 'Rubutun magani da karamin magani',
  'Referral to specialist if needed': 'Turawa zuwa kwararre idan da bukata',
  'Continue': 'Ci Gaba',
  'Physician Booking': 'Ajiyar Likita',
  'Personal Information': 'Bayanan Sirri',
  'Full Name': 'Cikakken Suna',
  'Phone Number': 'Lambar Waya',
  'Email (optional)': 'Imel (zabi ne)',
  'Service Address': 'Adireshin Sabis',
  'Where should the physician visit?': 'A ina likita zai zo?',
  'Schedule': 'Tsarin Lokaci',
  'Preferred Date': 'Ranar da ake so',
  'Preferred Time': 'Lokacin da ake so',
  'Any Time': 'Kowane Lokaci',
  'Morning (8AM - 12PM)': 'Safe (8AM - 12PM)',
  'Afternoon (12PM - 4PM)': 'Yamma (12PM - 4PM)',
  'Evening (4PM - 7PM)': 'Yamma (4PM - 7PM)',
  'Reason for Visit': 'Dalilin Ziyara',
  'Briefly describe your symptoms or reason for booking': 'Yi bayanin dalilin kiran likita a takaice',
  'Additional Notes (optional)': 'Karin Bayani (zabi ne)',
  'Review & Pay': 'Bincika & Biya',
  'By proceeding, you agree to our terms of service.': 'Ta ci gaba, ka yarda da sharuddanmu.',
  'Pay ₦15,000': 'Biya ₦15,000',
  'Price varies': 'Farashi ya danganta',
  'Book Service': 'Yi Ajiyar Sabis',
  'Pay & Book': 'Biya & Yi Ajiya',
  'Cash on Delivery': 'Biya a Hannu',
  'Cancel': 'Soke',
  'Completed': 'An kammala',
  'Pending': 'Ana jira'
};`;

let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
lang = lang.replace(/const HAUSA_TRANSLATIONS: Record<string, string> = \{\};/, translations);

fs.writeFileSync('src/contexts/LanguageContext.tsx', lang);
console.log("Translations restored");
