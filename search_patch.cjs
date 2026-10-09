const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// Add `useMemo` to imports if not there
if (!content.includes('useMemo')) {
  content = content.replace(
    `import React, { useState, useEffect }`,
    `import React, { useState, useEffect, useMemo }`
  );
}

// Extract the fallback array string
const match = content.match(/\{\(allServices\.length > 0 \? allServices : (\[.*?\])\)\.filter/);
const fallbackServicesStr = match ? match[1] : '[]';

const keywordsObj = `
const FALLBACK_SERVICES_LIST = ${fallbackServicesStr};

const SERVICE_SEARCH_KEYWORDS: Record<string, string[]> = {
  'Malaria Testing': ['malaria', 'zazzabin cizon sauro', 'zazzabi', 'typhoid'],
  'Injection': ['injection', 'allura', 'allurar magani'],
  'Intravenous Therapy': ['intravenous', 'iv', 'drip', 'ruwa', 'karin ruwa'],
  'Vital Signs Tracking': ['vital signs', 'bp', 'blood pressure', 'hauwan jini', 'jinni', 'zazzabi', 'zazzabin jiki', 'heart rate'],
  'Blood Glucose Monitoring': ['blood glucose', 'sugar', 'sukari', 'ciwon sukari', 'diabetes'],
  'Pregnancy Test': ['pregnancy', 'ciki', 'juna biyu', 'gwajin ciki'],
  'Antenatal Care': ['antenatal', 'awu', 'juna biyu'],
  'Delivery Care': ['delivery', 'haihuwa'],
  'Dressing Procedures': ['dressing', 'wanke ciwo', 'ciwo', 'rauni', 'kula da ciwo', 'jinni'],
  'Suture and Staple Removal': ['suture', 'zare', 'cire zare', 'dinki'],
  'Oxygen Therapy': ['oxygen', 'iska', 'numfashi'],
  'Nebulizer Treatment': ['nebulizer', 'asima', 'numfashi', 'asthma'],
  'Asthmatic Care': ['asthma', 'asima', 'numfashi'],
  'Catheterization and Catheter Care': ['catheter', 'fitsari', 'robar fitsari'],
  'Urine Testing': ['urine', 'fitsari', 'gwajin fitsari'],
  'Urinalysis': ['urinalysis', 'fitsari', 'gwajin fitsari'],
  'Mobilization': ['mobilization', 'motsa jiki'],
  'Full Blood Count': ['fbc', 'jini', 'gwajin jini'],
  'Instant Ultrasound': ['ultrasound', 'scan', 'hoton ciki'],
  'Instant X-Ray': ['x-ray', 'xray', 'hoto', 'hoton kashi']
};

export function PatientApp`;

content = content.replace('export function PatientApp', keywordsObj);

const originalState = `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('splash');`;

const patchedState = `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName?: string, onHome?: () => void, onLogout?: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('splash');
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const listToSearch = allServices.length > 0 ? allServices : FALLBACK_SERVICES_LIST;

    return listToSearch.filter(service => {
      if (service.active === false) return false;

      const enName = service.name.toLowerCase();
      const haName = t(service.name).toLowerCase();
      const catEn = service.categoryId.toLowerCase();
      const catHa = t(service.categoryId).toLowerCase();

      if (enName.includes(q) || haName.includes(q) || catEn.includes(q) || catHa.includes(q)) return true;

      const keywords = SERVICE_SEARCH_KEYWORDS[service.name] || [];
      if (keywords.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))) return true;

      return false;
    });
  }, [searchQuery, allServices, t]);`;

content = content.replace(originalState, patchedState);

// Now patch the Home step search input
const originalInput = `<input 
                  type="text" 
                  placeholder={t('Search for services (e.g., Malaria Test)')} 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-900 text-sm shadow-sm"
                  onClick={() => setStep('all_services')}
                />`;

const searchUi = `
              <div className="relative z-10">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('Search for a service...', 'Search for a service...')} 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-10 outline-none focus:border-blue-900 text-sm shadow-sm"
                />
                {searchQuery.trim().length > 0 && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                )}
                
                {/* Search Results Dropdown */}
                {searchQuery.trim().length > 0 && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-[60vh] overflow-y-auto z-50">
                    {searchResults.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {searchResults.map(service => (
                          <div 
                            key={service.id} 
                            onClick={() => {
                              setSelectedService(service);
                              setSelectedCategory({ id: service.categoryId, name: service.categoryId, active: true });
                              setSearchQuery('');
                              setStep('service_details');
                            }}
                            className="p-3 bg-gray-50 hover:bg-blue-50 rounded-xl cursor-pointer transition-colors flex flex-col gap-2 border border-transparent hover:border-blue-100"
                          >
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">{t(service.name)}</h4>
                              <p className="text-xs text-blue-600 font-medium">{t(service.categoryId)}</p>
                            </div>
                            <p className="text-gray-500 text-xs line-clamp-1">{t(service.description)}</p>
                            <div className="flex justify-between items-center mt-1">
                              {service.price ? (
                                <span className="font-bold text-teal-600 text-sm">₦{service.price.toLocaleString()}</span>
                              ) : (
                                <span className="text-xs text-gray-400">{t('Price varies')}</span>
                              )}
                              <button className="bg-blue-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                {t('Book Now', 'Book Now')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-medium">{t('No services found. Try another search.', 'No services found. Try another search.')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
`;

// Wait, the div wrapping the input is `<div className="relative">` in the code, let's replace that entirely.
const originalInputWrapper = `<div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder={t('Search for services (e.g., Malaria Test)')} 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-900 text-sm shadow-sm"
                  onClick={() => setStep('all_services')}
                />
              </div>`;

content = content.replace(originalInputWrapper, searchUi.trim());

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Patched PatientApp with search");
