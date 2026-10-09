const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `import { PatientApp } from './components/PatientApp';`,
  `import { PatientApp } from './components/PatientApp';\nimport { useLanguage } from './contexts/LanguageContext';\nimport { LanguageSwitcher } from './components/LanguageSwitcher';`
);

content = content.replace(
  `export default function App() {`,
  `export default function App() {\n  const { t } = useLanguage();`
);

// Translating splash screen
content = content.replace(
  `<h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Nurse To You</h1>`,
  `<h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{t('Nurse To You')}</h1>`
);

content = content.replace(
  `<h2 className="text-2xl md:text-3xl font-semibold text-blue-100 mb-6 leading-tight">Professional Nursing Care at Your Doorstep</h2>`,
  `<h2 className="text-2xl md:text-3xl font-semibold text-blue-100 mb-6 leading-tight">{t('Professional Nursing Care at Your Doorstep')}</h2>`
);

content = content.replace(
  `<p className="text-blue-200 text-lg md:text-xl font-light mb-10 leading-relaxed">\n                Quality healthcare services connecting you with trusted healthcare professionals wherever you are.\n              </p>`,
  `<p className="text-blue-200 text-lg md:text-xl font-light mb-10 leading-relaxed">\n                {t('Quality healthcare services connecting you with trusted healthcare professionals wherever you are.')}\n              </p>`
);

// Language switcher
content = content.replace(
  `<button \n              onClick={() => setView('admin')}\n              className="absolute top-6 right-6 text-sm font-bold text-gray-400 hover:text-blue-900 transition-colors z-10 px-4 py-2 rounded-full hover:bg-slate-50"\n            >\n              Admin Login\n            </button>`,
  `<div className="absolute top-6 right-6 flex items-center gap-4 z-10">\n              <LanguageSwitcher />\n              <button \n                onClick={() => setView('admin')}\n                className="text-sm font-bold text-gray-400 hover:text-blue-900 transition-colors px-4 py-2 rounded-full hover:bg-slate-50"\n              >\n                Admin Login\n              </button>\n            </div>`
);

content = content.replace(
  `<h3 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome Back</h3>`,
  `<h3 className="text-3xl font-extrabold text-gray-900 mb-3">{t('Welcome Back')}</h3>`
);

content = content.replace(
  `<p className="text-gray-500 mb-10 text-lg">Please select your portal to continue</p>`,
  `<p className="text-gray-500 mb-10 text-lg">{t('Please select your portal to continue')}</p>`
);

content = content.replace(
  `<span className="text-lg">Client Login</span>`,
  `<span className="text-lg">{t('Client Login')}</span>`
);

content = content.replace(
  `<span className="text-lg">Provider Login</span>`,
  `<span className="text-lg">{t('Provider Login')}</span>`
);

content = content.replace(
  `<p className="text-sm font-medium text-gray-500">Secure & Encrypted Platform</p>`,
  `<p className="text-sm font-medium text-gray-500">{t('Secure & Encrypted Platform')}</p>`
);

fs.writeFileSync('src/App.tsx', content);
console.log("Patched App.tsx");
