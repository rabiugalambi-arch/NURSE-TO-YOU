const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const newTranslations = `
    'Physician Care': 'Kula da Likita',
    'Book Physician': 'Yi Booking din Likita',
    'Service Fee': 'Kudin Sabis',
    'Fixed rate': 'Kafaffen farashi',
    'Full Name': 'Cikakken Suna',
    'Email Address': 'Adireshin Imel',
    'Current Address': 'Adireshin Yanzu',
    'Preferred Date': 'Ranar Da Aka Zaba',
    'Preferred Time': 'Lokacin Da Aka Zaba',
    'Reason for booking': 'Dalilin neman sabis',
    'Additional notes (Optional)': 'Karin bayani (Idan akwai)',
    'Continue to Review': 'Ci Gaba Don Dubawa',
    'Review & Pay': 'Duba kuma Biya',
    'Booking Summary': 'Takaitaccen Booking',
    'Service': 'Sabis',
    'Client Name': 'Sunan Abokin Ciniki',
    'Phone': 'Lambar Waya',
    'Email': 'Imel',
    'Address': 'Adireshi',
    'Date': 'Rana',
    'Reason': 'Dalili',
    'Fixed standard physician consultation fee': 'Kafaffen kudin ganin likita',
    'Pay ₦15,000': 'Biya ₦15,000',
    'Physician Booking Submitted Successfully': 'An Tura Booking din Likita Cikin Nasara',
    'Amount Paid': 'Kudin Da Aka Biya',
    'Payment Status': 'Matsayin Biyan Kudi',
    'Booking Status': 'Matsayin Booking',
    'Pending Admin Processing': 'Ana Jiran Gudanarwar Admin',
    'Our admin team will contact you shortly via phone or email to arrange your physician service.': 'Tawagar admin za su tuntube ka nan ba da jimawa ba ta waya ko imel don shirya maka sabis din likita.',
    'View My Booking': 'Duba Booking Dina',
    'Return to Home': 'Koma Gida',
`;

content = content.replace(
  `'Price varies': 'Farashi ya danganta',`,
  `'Price varies': 'Farashi ya danganta',\n${newTranslations}`
);

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log("Patched language context for physician");
