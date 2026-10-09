const fs = require('fs');
let content = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

const newTranslations = `
    'Physician Care': 'Kula da Lafiya daga Likita',
    'Book Physician': 'Yi Booking na Likita',
    'Fixed rate': 'Tsabtataccen Farashi',
    'Service Fee': 'Kudin Aiki',
    'Full Name': 'Cikakken Suna',
    'Phone Number': 'Lambar Waya',
    'Email Address': 'Adireshin Imel',
    'Current Address': 'Adireshin Gida na Yanzu',
    'Preferred Date': 'Ranar da Aka Zaba',
    'Preferred Time': 'Lokacin da Aka Zaba',
    'Reason for booking': 'Dalilin Booking',
    'Additional notes (Optional)': 'Karin bayani (Zabi)',
    'Continue to Review': 'Ci gaba zuwa Dubawa',
    'Review & Pay': 'Duba & Biyan Kudi',
    'Booking Summary': 'Takaitaccen Booking',
    'Service': 'Sabis',
    'Client Name': 'Sunan Abokin Ciniki',
    'Phone': 'Waya',
    'Email': 'Imel',
    'Address': 'Adireshi',
    'Date': 'Rana',
    'Time': 'Lokaci',
    'Reason': 'Dalili',
    'Pay ₦15,000': 'Biyan ₦15,000',
    'Physician Booking Submitted Successfully': 'An Karbi Booking na Likita Cikin Nasara',
    'Amount Paid': 'Kudin da Aka Biya',
    'Payment Status': 'Yanayin Biyan Kudi',
    'Booking Status': 'Yanayin Booking',
    'Pending Admin Processing': 'Ana Jiran Tsarin Gudanarwa',
    'Contacting Client': 'Ana Tuntubar Abokin Ciniki',
    'Physician Arranged': 'An Tsara Likita',
    'Completed': 'An Kammala',
    'Cancelled': 'An Soke',
    'Our admin team will contact you shortly via phone or email to arrange your physician service.': 'Kungiyar gudanarwarmu za su tuntube ka nan ba da jimawa ba ta waya ko imel don tsara sabis na likitanka.',
    'View My Booking': 'Duba Booking Dina',
    'Return to Home': 'Koma Shafi na Farko',
    'Fixed standard physician consultation fee': 'Kudin shawarwari na likita',
    'Please describe your symptoms...': 'Da fatan za a bayyana alamunka...',
`;

content = content.replace(
  `'Price varies': 'Farashi ya danganta',`,
  `'Price varies': 'Farashi ya danganta',\n${newTranslations}`
);

fs.writeFileSync('src/contexts/LanguageContext.tsx', content);
console.log("Translations patched");
