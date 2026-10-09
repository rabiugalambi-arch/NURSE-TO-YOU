const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const anchor = `{step === 'physician_categories' && (`;

const newUI = `
        {step === 'physician_booking_form' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Book Physician', 'Book Physician')} onBack={() => setStep('home')} />
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('Physician Care', 'Physician Care')}</h2>
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-blue-900 font-bold">{t('Service Fee', 'Service Fee')}</p>
                    <p className="text-blue-700 text-sm">{t('Fixed rate', 'Fixed rate')}</p>
                  </div>
                  <div className="text-xl font-black text-blue-900">₦15,000</div>
                </div>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); setStep('physician_payment'); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Full Name')}</label>
                  <input required type="text" value={physicianForm.name} onChange={e => setPhysicianForm({...physicianForm, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Phone Number')}</label>
                  <input required type="tel" value={physicianForm.phone} onChange={e => setPhysicianForm({...physicianForm, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Email Address')}</label>
                  <input required type="email" value={physicianForm.email} onChange={e => setPhysicianForm({...physicianForm, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Current Address')}</label>
                  <input required type="text" value={physicianForm.address} onChange={e => setPhysicianForm({...physicianForm, address: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  {!location && (
                    <button type="button" onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}));
                        }
                    }} className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Get Current Location
                    </button>
                  )}
                  {location && <p className="text-green-600 text-xs font-bold mt-2 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Location saved</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('Preferred Date')}</label>
                    <input required type="date" value={physicianForm.date} onChange={e => setPhysicianForm({...physicianForm, date: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('Preferred Time')}</label>
                    <input required type="time" value={physicianForm.time} onChange={e => setPhysicianForm({...physicianForm, time: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Reason for booking')}</label>
                  <textarea required value={physicianForm.reason} onChange={e => setPhysicianForm({...physicianForm, reason: e.target.value})} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" placeholder={t('Please describe your symptoms or reason for consulting a physician', 'Please describe your symptoms...')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('Additional notes (Optional)')}</label>
                  <textarea value={physicianForm.notes} onChange={e => setPhysicianForm({...physicianForm, notes: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-blue-900" />
                </div>
                
                <div className="pt-4 pb-12">
                  <button type="submit" className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-colors">
                    {t('Continue to Review', 'Continue to Review')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {step === 'physician_payment' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title={t('Review & Pay', 'Review & Pay')} onBack={() => {
              if (physicianPaymentStatus !== 'processing') setStep('physician_booking_form');
            }} />
            <div className="flex-1 overflow-y-auto p-6 pb-32">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('Booking Summary')}</h2>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 font-bold">{t('Service')}</p>
                  <p className="font-medium text-gray-900">{t('Physician Care', 'Physician Care')}</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Client Name')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Phone')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Email')}</p>
                    <p className="font-medium text-gray-900 truncate">{physicianForm.email}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Address')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Date')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold">{t('Time')}</p>
                    <p className="font-medium text-gray-900">{physicianForm.time}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs text-gray-500 font-bold">{t('Reason')}</p>
                  <p className="font-medium text-gray-900">{physicianForm.reason}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-bold">{t('Service Fee')}</span>
                  <span className="text-blue-900 font-black text-xl">₦15,000</span>
                </div>
                <p className="text-xs text-blue-700">{t('Fixed standard physician consultation fee')}</p>
              </div>

              <form onSubmit={confirmPhysicianBooking} className="relative">
                {physicianPaymentStatus === 'processing' && (
                  <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-900 rounded-full animate-spin mb-2"></div>
                    <p className="font-bold text-blue-900 text-sm">Processing Payment...</p>
                  </div>
                )}
                {physicianPaymentStatus === 'failed' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-bold text-center">
                    Payment failed. Please try again.
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={physicianPaymentStatus === 'processing' || physicianPaymentStatus === 'success'}
                  className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {t('Pay ₦15,000', 'Pay ₦15,000')} <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-4"><ShieldCheck className="w-3 h-3"/> Secured by Paystack</p>
              </form>
            </div>
          </div>
        )}

        {step === 'physician_success' && (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 text-center animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center shadow-lg z-10">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-ping opacity-30"></div>
            </div>
            
            <h2 className="text-2xl font-bold text-blue-900 mb-2">{t('Physician Booking Submitted Successfully', 'Physician Booking Submitted Successfully')}</h2>
            
            <div className="bg-white w-full rounded-2xl p-5 shadow-sm border border-gray-100 my-6">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">{t('Amount Paid')}</span>
                <span className="font-bold text-gray-900">₦15,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500 text-sm">{t('Payment Status')}</span>
                <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded text-xs">PAID</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">{t('Booking Status')}</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">{t('Pending Admin Processing', 'Pending Admin Processing')}</span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-8">
              {t('Our admin team will contact you shortly via phone or email to arrange your physician service.', 'Our admin team will contact you shortly via phone or email to arrange your physician service.')}
            </p>
            
            <div className="space-y-3 w-full max-w-xs">
              <button 
                onClick={() => setStep('bookings')}
                className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-xl shadow hover:bg-blue-800 transition-colors"
              >
                {t('View My Booking', 'View My Booking')}
              </button>
              <button 
                onClick={() => setStep('home')}
                className="w-full bg-white text-blue-900 font-bold py-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {t('Return to Home')}
              </button>
            </div>
          </div>
        )}

`;

if(content.includes(anchor) && !content.includes(`step === 'physician_booking_form'`)) {
  content = content.replace(anchor, newUI + anchor);
  fs.writeFileSync('src/components/PatientApp.tsx', content);
  console.log("UI injected");
} else {
  console.log("Anchor not found or already injected");
}
