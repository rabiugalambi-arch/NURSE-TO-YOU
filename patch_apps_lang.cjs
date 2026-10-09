const fs = require('fs');

function patchPatientApp() {
  let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

  // Inject useLanguage
  if (!content.includes('useLanguage')) {
    content = content.replace(
      `import React, { useState, useEffect } from 'react';`,
      `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../contexts/LanguageContext';`
    );
  }

  // Inject const { t } = useLanguage(); inside PatientApp
  if (!content.includes('const { t } = useLanguage();')) {
    content = content.replace(
      `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {\n  const [step, setStep] = useState<Step>('splash');`,
      `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {\n  const { t } = useLanguage();\n  const [step, setStep] = useState<Step>('splash');`
    );
  }

  // Bottom Navigation
  content = content.replace(/<span className="text-\[11px\] font-medium">Home<\/span>/g, `<span className="text-[11px] font-medium">{t('Home')}</span>`);
  content = content.replace(/<span className="text-\[11px\] font-medium">Bookings<\/span>/g, `<span className="text-[11px] font-medium">{t('Bookings')}</span>`);
  content = content.replace(/<span className="text-\[11px\] font-medium">Pharmacy<\/span>/g, `<span className="text-[11px] font-medium">{t('Pharmacy Store')}</span>`);
  content = content.replace(/<span className="text-\[11px\] font-medium">Reports<\/span>/g, `<span className="text-[11px] font-medium">{t('Reports', 'Reports')}</span>`);
  content = content.replace(/<span className="text-\[11px\] font-medium">Profile<\/span>/g, `<span className="text-[11px] font-medium">{t('Profile', 'Profile')}</span>`);

  // Home Step
  content = content.replace(/<p className="text-gray-500 text-sm">Hello, \{userName\?\./g, `<p className="text-gray-500 text-sm">{t('Hello')}, {userName?.`);
  content = content.replace(/placeholder="Search for services \(e\.g\., Malaria Test\)"/g, `placeholder={t('Search for services (e.g., Malaria Test)')}`);
  
  content = content.replace(/<h2 className="text-2xl font-bold mb-2">Need a Nurse\?<\/h2>/g, `<h2 className="text-2xl font-bold mb-2">{t('Need a Nurse?')}</h2>`);
  content = content.replace(/<p className="text-blue-200 text-sm mb-6 leading-relaxed">Book verified professionals to your location instantly\.<\/p>/g, `<p className="text-blue-200 text-sm mb-6 leading-relaxed">{t('Book verified professionals to your location instantly.')}</p>`);
  content = content.replace(/Book a Nurse <ArrowLeft/g, `{t('Book a Nurse')} <ArrowLeft`);

  content = content.replace(/<h2 className="text-2xl font-bold mb-2">Book a Physician<\/h2>/g, `<h2 className="text-2xl font-bold mb-2">{t('Book a Physician')}</h2>`);
  content = content.replace(/<p className="text-purple-200 text-sm mb-6 leading-relaxed">Consult with specialist doctors online or in-person\.<\/p>/g, `<p className="text-purple-200 text-sm mb-6 leading-relaxed">{t('Consult with specialist doctors online or in-person.')}</p>`);
  content = content.replace(/Find a Doctor <ArrowLeft/g, `{t('Find a Doctor')} <ArrowLeft`);

  content = content.replace(/<h2 className="text-2xl font-bold mb-2">Pharmacy Store<\/h2>/g, `<h2 className="text-2xl font-bold mb-2">{t('Pharmacy Store')}</h2>`);
  content = content.replace(/<p className="text-teal-100 text-sm mb-6 leading-relaxed">Order medicines to your door<\/p>/g, `<p className="text-teal-100 text-sm mb-6 leading-relaxed">{t('Order medicines to your door')}</p>`);
  content = content.replace(/Order Now <ArrowLeft/g, `{t('Order Now')} <ArrowLeft`);

  content = content.replace(/<h3 className="text-gray-900 font-semibold mb-3">Upcoming Booking<\/h3>/g, `<h3 className="text-gray-900 font-semibold mb-3">{t('Upcoming Booking')}</h3>`);
  content = content.replace(/\{selectedProvider\?\.name \|\| 'Assigned Provider'\}/g, `{selectedProvider?.name || t('Assigned Provider')}`);
  content = content.replace(/\{selectedService\?\.name \|\| 'Healthcare Service'\}/g, `{selectedService?.name || t('Healthcare Service')}`);
  content = content.replace(/>REQUESTED<\/span>/g, `>{t('REQUESTED')}</span>`);
  content = content.replace(/>Just now<\/div>/g, `>{t('Just now')}</div>`);
  content = content.replace(/>Pending ETA<\/div>/g, `>{t('Pending ETA')}</div>`);
  content = content.replace(/📞 Call Provider/g, `📞 {t('Call Provider')}`);

  // all_services step
  content = content.replace(/<h2 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Services<\/h2>/g, `<h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Healthcare Services')}</h2>`);
  content = content.replace(/<p className="text-gray-500 text-sm mb-6">Select a category to view available services\.<\/p>/g, `<p className="text-gray-500 text-sm mb-6">{t('Select a category to view available services.')}</p>`);
  
  // Important: Translate category names
  content = content.replace(/<h3 className="font-bold text-gray-900 text-sm leading-tight">\{cat\.name\}<\/h3>/g, `<h3 className="font-bold text-gray-900 text-sm leading-tight">{t(cat.name)}</h3>`);

  // Emergency Notice
  content = content.replace(/<h4 className="font-bold">Emergency Notice<\/h4>/g, `<h4 className="font-bold">{t('Emergency Notice')}</h4>`);
  content = content.replace(/If this is a life-threatening emergency, please contact your local emergency services immediately\. This app does not replace emergency response\./g, `{t('If this is a life-threatening emergency, please contact your local emergency services immediately. This app does not replace emergency response.')}`);

  // Service Details
  content = content.replace(/Estimated Price/g, `{t('Estimated Price')}`);
  content = content.replace(/Required Qualifications/g, `{t('Required Qualifications')}`);
  content = content.replace(/Book This Service/g, `{t('Book This Service')}`);

  // TopNav usage
  // We can't easily catch all TopNav but we can try to translate static titles
  content = content.replace(/title="Nurse To You"/g, `title={t('Nurse To You')}`);
  content = content.replace(/title="Set Your Location"/g, `title={t('Set Your Location')}`);

  fs.writeFileSync('src/components/PatientApp.tsx', content);
}

function patchProviderApp() {
  let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');
  
  // Inject useLanguage
  if (!content.includes('useLanguage')) {
    content = content.replace(
      `import React, { useState, useEffect } from 'react';`,
      `import React, { useState, useEffect } from 'react';\nimport { useLanguage } from '../contexts/LanguageContext';`
    );
  }

  // Inject const { t } = useLanguage(); inside ProviderApp
  if (!content.includes('const { t } = useLanguage();')) {
    content = content.replace(
      `export function ProviderApp({ providerId }: { providerId: string }) {\n  const [step, setStep] = useState<'dashboard' | 'history' | 'profile'>('dashboard');`,
      `export function ProviderApp({ providerId }: { providerId: string }) {\n  const { t } = useLanguage();\n  const [step, setStep] = useState<'dashboard' | 'history' | 'profile'>('dashboard');`
    );
  }

  // Provider App translations
  content = content.replace(/<h1 className="text-2xl font-bold text-blue-900">Provider Dashboard<\/h1>/g, `<h1 className="text-2xl font-bold text-blue-900">{t('Provider Dashboard')}</h1>`);
  content = content.replace(/<h2 className="text-xl font-bold text-gray-900">Active Requests<\/h2>/g, `<h2 className="text-xl font-bold text-gray-900">{t('Active Requests')}</h2>`);
  content = content.replace(/<h2 className="text-xl font-bold text-gray-900">Completed Bookings<\/h2>/g, `<h2 className="text-xl font-bold text-gray-900">{t('Completed Bookings')}</h2>`);
  content = content.replace(/<p className="text-gray-500 text-center py-8">No active requests at the moment\.<\/p>/g, `<p className="text-gray-500 text-center py-8">{t('No active requests at the moment.')}</p>`);
  content = content.replace(/<p className="text-gray-500 text-center py-8">No completed bookings yet\.<\/p>/g, `<p className="text-gray-500 text-center py-8">{t('No completed bookings yet.')}</p>`);

  content = content.replace(/<span className="font-medium text-gray-700">Client:<\/span>/g, `<span className="font-medium text-gray-700">{t('Client')}:</span>`);
  content = content.replace(/<span className="font-medium text-gray-700">Location:<\/span>/g, `<span className="font-medium text-gray-700">{t('Location')}:</span>`);
  content = content.replace(/<span className="font-medium text-gray-700">Time:<\/span>/g, `<span className="font-medium text-gray-700">{t('Time')}:</span>`);
  content = content.replace(/<span className="font-medium text-gray-700">Service:<\/span>/g, `<span className="font-medium text-gray-700">{t('Service')}:</span>`);
  content = content.replace(/<span className="font-medium text-gray-700">Status:<\/span>/g, `<span className="font-medium text-gray-700">{t('Status')}:</span>`);

  content = content.replace(/>Accept<\/button>/g, `>{t('Accept')}</button>`);
  content = content.replace(/>Decline<\/button>/g, `>{t('Decline')}</button>`);
  content = content.replace(/>Mark as Completed<\/button>/g, `>{t('Mark as Completed')}</button>`);

  content = content.replace(/<h1 className="text-2xl font-bold text-blue-900">My Profile<\/h1>/g, `<h1 className="text-2xl font-bold text-blue-900">{t('My Profile')}</h1>`);
  
  content = content.replace(/<span className="text-xs font-medium mt-1">Dashboard<\/span>/g, `<span className="text-xs font-medium mt-1">{t('Home')}</span>`);
  content = content.replace(/<span className="text-xs font-medium mt-1">History<\/span>/g, `<span className="text-xs font-medium mt-1">{t('Completed Bookings')}</span>`);
  content = content.replace(/<span className="text-xs font-medium mt-1">Profile<\/span>/g, `<span className="text-xs font-medium mt-1">{t('Profile', 'Profile')}</span>`);

  fs.writeFileSync('src/components/ProviderApp.tsx', content);
}

patchPatientApp();
patchProviderApp();
console.log("Patched PatientApp and ProviderApp strings");
