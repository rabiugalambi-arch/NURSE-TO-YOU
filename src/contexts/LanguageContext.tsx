
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ha';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, _arg2?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const HAUSA_TRANSLATIONS: Record<string, string> = {
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
  'Pending': 'Ana jira',
  'Menstrual & Fertility Tracker': 'Bibiyar Al\'ada da Lokacin Haihuwa',
  'Track your cycle and view estimated fertile days.': 'Bibi al\'adarki kuma duba kwanakin samun juna biyu na kiyasi.',
  'Open Tracker': 'Bude Mai Bibiya',
  'Estimated fertile window': 'Kiyasin lokacin samun juna biyu',
  'Estimated ovulation': 'Kiyasin kwayar halittar mace',
  'Expected period': 'Al\'adar da ake tsammani',
  'Lower estimated fertility days': 'Kwanakin da kiyasin samun juna biyu ke kasa',
  'Cycle and fertility dates shown here are estimates. Menstrual cycles and ovulation can vary. These predictions should not be used as a guarantee of preventing pregnancy.': 'Kwanakin al\'ada da samun juna biyu da aka nuna a nan kiyasi ne. Al\'ada da tsarin kwayar halitta na iya canzawa. Kada a yi amfani da wadannan kiyasi a matsayin tabbacin hana daukar ciki.',
  'If you need contraception or have concerns about your menstrual cycle, speak with a qualified healthcare professional.': 'Idan kina bukatar tsarin iyali ko kina da damuwa game da al\'adarki, yi magana da kwararren ma\'aikacin lafiya.',
  'Your cycle appears variable, so fertility estimates may be less reliable.': 'Al\'adarki na canzawa, don haka kiyasin samun juna biyu na iya zama ba abin dogaro ba sosai.',
  'First day of last menstrual period': 'Ranar farko ta al\'adarki ta karshe',
  'Average menstrual cycle length (days)': 'Tsawon lokacin al\'ada (kwanaki)',
  'Average period duration (days)': 'Kwanakin da al\'ada ke dauka',
  'Log Period': 'Rubuta Al\'ada',
  'Cycle History': 'Tarihin Al\'ada',
  'Save': 'Ajiye',
  'Edit': 'Gyara',
  'Delete': 'Goge',
  'Period Started': 'Al\'ada ta fara',
  'Period Ended': 'Al\'ada ta kare',
  'Today': 'Yau',
  'Cycle Day': 'Ranar Al\'ada',
  'Current estimate:': 'Kiyasin yanzu:',
  'Estimated next period:': 'Kiyasin al\'ada ta gaba:',
  'These dates are estimates. Ovulation can vary from cycle to cycle, so calendar predictions cannot guarantee that a day is safe from pregnancy.': 'Wadannan kwanakin kiyasi ne. Tsarin kwayar halitta na iya canzawa daga wannan al\'ada zuwa waccan, don haka kiyasin kalanda ba zai iya bada tabbacin cewa babu matsalar daukar ciki a wannan ranar ba.',
  'Calculate Results': 'Lissafa Sakamako',
  'Estimated Ovulation Date': 'Kiyasin Ranar Fitar Kwayar Halitta',
  'Estimated Fertile Window': 'Kiyasin Lokacin Samun Juna Biyu',
  'Next Expected Period': 'Al\'ada ta Gaba da Ake Tsammani',
  'Expected Period End Date': 'Ranar da Ake Tsammanin Al\'ada zata Kare',
  'Days Until Next Period': 'Kwanaki zuwa Al\'ada ta Gaba',
  'Cycle Phase': 'Matakin Tsarin Al\'ada',
  'Estimated Cycle Length': 'Kiyasin Tsawon Tsarin Al\'ada',
  'Previous period start date (optional)': 'Ranar al\'ada ta baya (na zabi)',
  'Average duration of menstrual bleeding (days)': 'Kwanakin zubar jinin al\'ada (kwanaki)',
  'Save to Cycle History': 'Ajiye a Tarihin Al\'ada',
  'Cycle Calendar': 'Kalandar Tsarin Al\'ada',
  'Privacy & Disclaimers': 'Bayanin Sirri & Gargadi',
  'Menstrual Phase': 'Matakin Al\'ada',
  'Follicular Phase': 'Matakin Follikula',
  'Ovulatory Phase': 'Matakin Fitar Kwayar Halitta',
  'Luteal Phase': 'Matakin Luteal',
  'Late / Period Expected': 'Al\'ada ta Wuce Lokaci / Ake Tsammani',
};
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, _arg2?: any) => {
    if (language === 'en') return key;
    return HAUSA_TRANSLATIONS[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
