const fs = require('fs');
let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

// If the exported members are gone, they were probably wiped by the regex string processing.
// Let's just fix it by ensuring we export LanguageProvider and useLanguage
if (!lang.includes('export function LanguageProvider')) {
    lang += `
import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ha';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
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
`;
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', lang);
console.log("Exported contexts");
