const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const oldPharmacyBanner = `{/* Pharmacy Promo Banner */}
              <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100 flex justify-between items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep('pharmacy')}>
                <div>
                  <h3 className="text-teal-900 font-bold text-lg mb-1">Pharmacy Store</h3>
                  <p className="text-teal-700 text-xs">Order medicines to your door</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>`;

const newPharmacyBanner = `{/* Pharmacy Promo Banner */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setStep('pharmacy')}>
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">Pharmacy Store</h2>
                  <p className="text-teal-100 text-sm mb-6 leading-relaxed">Order medicines to your door</p>
                  <button onClick={(e) => { e.stopPropagation(); setStep('pharmacy'); }} className="bg-white text-teal-900 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-teal-50 w-max">
                    Order Now <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-teal-900 rounded-tl-full opacity-30 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-300 rounded-full opacity-20 z-0"></div>
              </div>`;

content = content.replace(oldPharmacyBanner, newPharmacyBanner);
fs.writeFileSync('src/components/PatientApp.tsx', content);
