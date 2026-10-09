const fs = require('fs');

function patchPatientAppSwitcher() {
  let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');
  
  if (!content.includes('LanguageSwitcher')) {
    content = content.replace(
      `import { useLanguage } from '../contexts/LanguageContext';`,
      `import { useLanguage } from '../contexts/LanguageContext';\nimport { LanguageSwitcher } from './LanguageSwitcher';`
    );
    
    // Add to Home header
    content = content.replace(
      `<button className="relative p-2 text-blue-900 bg-white rounded-full shadow-sm border border-gray-100">\n                <Bell className="w-5 h-5" />`,
      `<LanguageSwitcher className="mr-3" />\n              <button className="relative p-2 text-blue-900 bg-white rounded-full shadow-sm border border-gray-100">\n                <Bell className="w-5 h-5" />`
    );
    fs.writeFileSync('src/components/PatientApp.tsx', content);
  }
}

function patchProviderAppSwitcher() {
  let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');
  
  if (!content.includes('LanguageSwitcher')) {
    content = content.replace(
      `import { useLanguage } from '../contexts/LanguageContext';`,
      `import { useLanguage } from '../contexts/LanguageContext';\nimport { LanguageSwitcher } from './LanguageSwitcher';`
    );
    
    // Add to Provider Profile or Dashboard header
    // Search for the top div with Notification bell
    content = content.replace(
      `<button className="relative p-2 bg-white rounded-full shadow-sm text-blue-900">\n            <Bell className="w-6 h-6" />`,
      `<LanguageSwitcher className="mr-3" />\n          <button className="relative p-2 bg-white rounded-full shadow-sm text-blue-900">\n            <Bell className="w-6 h-6" />`
    );
    fs.writeFileSync('src/components/ProviderApp.tsx', content);
  }
}

patchPatientAppSwitcher();
patchProviderAppSwitcher();
console.log("Patched switchers");
