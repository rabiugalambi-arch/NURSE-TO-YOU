const fs = require('fs');

let lang = fs.readFileSync('src/contexts/LanguageContext.tsx', 'utf8');

if (!lang.includes('interface LanguageContextType')) {
    lang = lang.replace(
        /export function LanguageProvider/g,
        `
interface LanguageContextType {
  language: 'en' | 'ha';
  setLanguage: (lang: 'en' | 'ha') => void;
  t: (key: string, _arg2?: any) => string;
}

export function LanguageProvider`
    )
} else {
    lang = lang.replace(
        /t: \(key: string\) => string;/g,
        `t: (key: string, _arg2?: any) => string;`
    )
}
fs.writeFileSync('src/contexts/LanguageContext.tsx', lang);
console.log("Cleaned up final 3");
