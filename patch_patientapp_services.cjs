const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// Replace the old SERVICES array. We'll fetch from Firestore instead.
content = content.replace(
  /const SERVICES = \[([\s\S]*?)\];/,
  `// Services will be fetched from Firestore dynamically`
);

// Add states for categories and services
content = content.replace(
  `const [step, setStep] = useState<Step>('splash');`,
  `const [step, setStep] = useState<Step>('splash');
  const [categories, setCategories] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);`
);

// Add the useEffect for fetching categories and services
content = content.replace(
  `  useEffect(() => {
    if (!patientId) return;`,
  `  useEffect(() => {
    if (!patientId) return;

    const unsubCategories = onSnapshot(collection(db, 'serviceCategories'), (snap) => {
      const c: any[] = [];
      snap.forEach(d => c.push({ id: d.id, ...d.data() }));
      setCategories(c.filter(cat => cat.active));
    }, (err) => console.error('Categories error:', err));

    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      const s: any[] = [];
      snap.forEach(d => s.push({ id: d.id, ...d.data() }));
      setAllServices(s.filter(srv => srv.active));
    }, (err) => console.error('Services error:', err));
`
);

// Add unsubscribes
content = content.replace(
  `return () => unsubscribe();`,
  `return () => { unsubscribe(); unsubCategories(); unsubServices(); };`
);

// We need to replace the step === 'all_services' block
const oldAllServicesBlock = `        {step === 'all_services' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('home')} />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">All Healthcare<br/>Services</h2>
              <p className="text-gray-500 text-sm mb-6">Select a service to book a trusted provider.</p>
              
              <div className="space-y-4">
                {SERVICES.map(service => {
                  const Icon = service.icon;
                  return (
                    <button 
                      key={service.id}
                      onClick={() => { setSelectedService(service); setStep('service_details'); }}
                      className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left flex gap-4 hover:border-blue-200 shadow-sm transition-all"
                    >
                      <div className="w-12 h-12 shrink-0 bg-slate-50 rounded-xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base mb-1">{service.name}</h3>
                        <p className="text-gray-500 text-xs mb-3 leading-relaxed">{service.desc}</p>
                        <p className="text-blue-900 text-xs font-bold flex items-center gap-1">
                          <ActivitySquare className="w-3 h-3"/> Starts from {service.displayPrice}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}`;

const newAllServicesBlock = `        {step === 'all_services' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('home')} />
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Services</h2>
              <p className="text-gray-500 text-sm mb-6">Select a category to view available services.</p>
              
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { 
                      if (cat.name === 'Pharmacy Services') {
                        setStep('pharmacy');
                      } else if (cat.name === 'Physician Care' || cat.name === 'Specialist Care') {
                        setStep('physician_categories');
                      } else {
                        setSelectedCategory(cat); 
                        setStep('category_services'); 
                      }
                    }}
                    className="bg-white border border-gray-100 rounded-2xl p-4 text-left flex flex-col gap-3 hover:border-blue-200 shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 shrink-0 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
                       <ActivitySquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{cat.name}</h3>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'category_services' && selectedCategory && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={selectedCategory.name} onBack={() => setStep('all_services')} />
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h2>
                <p className="text-gray-500 text-sm">Select a specific service to proceed.</p>
              </div>

              {selectedCategory.name === 'Ambulance Service' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-red-900 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5"/> Emergency Notice
                  </h3>
                  <p className="text-red-700 text-sm leading-relaxed">
                    If this is a life-threatening emergency, please contact local emergency medical services immediately. This app does not replace urgent emergency response.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {allServices.filter(s => s.categoryId === selectedCategory.name).map(service => (
                  <button 
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep('service_details'); }}
                    className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-left flex gap-4 hover:border-blue-200 shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-xl flex items-center justify-center">
                      <ActivitySquare className="w-6 h-6 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{service.name}</h3>
                      <p className="text-gray-500 text-xs mb-3 leading-relaxed">{service.description}</p>
                      <p className="text-blue-900 text-xs font-bold flex items-center gap-1">
                         Starts from ₦{service.price?.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
                {allServices.filter(s => s.categoryId === selectedCategory.name).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No services available in this category yet.</p>
                )}
              </div>
            </div>
          </div>
        )}`;

content = content.replace(oldAllServicesBlock, newAllServicesBlock);

// Also need to add category_services to Step type
content = content.replace(
  `type Step = 'splash' | 'login'`,
  `type Step = 'splash' | 'login' | 'category_services'`
);

// We should also replace the hardcoded "Home Nursing" from the Home step (step === 'home') with dynamically finding it, or just routing to all_services
content = content.replace(
  `onClick={() => { setSelectedService(SERVICES.find(s => s.name === 'Home Nursing') || SERVICES[0]); setStep('service_details'); }}`,
  `onClick={() => setStep('all_services')}`
);

// Fix the "service.displayPrice" references in 'service_details' and 'matching' since dynamic services use 'price' (number)
content = content.replace(
  `{selectedService.displayPrice}`,
  `₦{selectedService.price?.toLocaleString()}`
);
content = content.replace(
  `{selectedService?.displayPrice}`,
  `₦{selectedService?.price?.toLocaleString()}`
);

// In service_details, make sure we show the service description (which is now 'description', not 'desc')
content = content.replace(
  `{selectedService.desc}`,
  `{selectedService.description || selectedService.desc}`
);
// And the duration is not standard anymore, let's remove or conditionally render
content = content.replace(
  `<Clock className="w-4 h-4 mr-1.5 opacity-70"/> {selectedService.duration}`,
  `<Clock className="w-4 h-4 mr-1.5 opacity-70"/> Estimated`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log('Patched PatientApp');
