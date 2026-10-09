import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# 1. Add MenstrualTracker import
content = content.replace(
    "import { PharmacyClientApp } from './pharmacy/PharmacyClientApp';",
    "import { PharmacyClientApp } from './pharmacy/PharmacyClientApp';\nimport { MenstrualTracker } from './MenstrualTracker';"
)

# 2. Update Step type
content = content.replace(
    "'pharmacy' | 'bookings' | 'physician_categories' | 'physician_list' | 'physician_profile' | 'physician_booking_form' | 'physician_payment' | 'physician_success';",
    "'pharmacy' | 'bookings' | 'physician_categories' | 'physician_list' | 'physician_profile' | 'physician_booking_form' | 'physician_payment' | 'physician_success' | 'menstrual_tracker';"
)

# 3. Add promo card to home screen
promo_card = '''              {/* Menstrual & Fertility Tracker Banner */}
              <div className="bg-pink-100 rounded-3xl p-6 text-pink-900 relative overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow mb-6 border border-pink-200" onClick={() => setStep('menstrual_tracker')}>
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">{t('Menstrual & Fertility Tracker')}</h2>
                  <p className="text-pink-700 text-sm mb-6 leading-relaxed font-medium">{t('Track your cycle and view estimated fertile days.')}</p>
                  <button onClick={(e) => { e.stopPropagation(); setStep('menstrual_tracker'); }} className="bg-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-pink-700 shadow-sm">
                    {t('Open Tracker')} <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-pink-200 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-pink-300 rounded-full opacity-30 z-0 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6 text-pink-600" />
                </div>
              </div>

              {/* Book a Physician Promo Banner */}'''

content = content.replace(
    "{/* Book a Physician Promo Banner */}",
    promo_card
)

# 4. Add the component rendering
render_block = '''        {step === 'menstrual_tracker' && (
          <MenstrualTracker patientId={patientId} onBack={() => setStep('home')} />
        )}
        
        {step === 'pharmacy' && ('''

content = content.replace(
    "{step === 'pharmacy' && (",
    render_block
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
