import sys

content = open('src/components/PatientApp.tsx').read()

old_import = """import { ArrowLeft, Search, CheckCircle, Clock, MapPin, AlertCircle, Phone, User as UserIcon, Calendar, ActivitySquare, Shield, CreditCard, ChevronRight, Menu, LogOut, Home, UserCircle, Bell, Star, FileText, Settings, Key, HelpCircle, Activity, Baby, HeartPulse, Syringe, FlaskConical, Stethoscope } from 'lucide-react';"""
new_import = """import { ArrowLeft, Search, CheckCircle, Clock, MapPin, AlertCircle, Phone, User as UserIcon, Calendar, ActivitySquare, Shield, CreditCard, ChevronRight, Menu, LogOut, Home, UserCircle, Bell, Star, FileText, Settings, Key, HelpCircle, Activity, Baby, HeartPulse, Syringe, FlaskConical, Stethoscope, Store } from 'lucide-react';
import { PharmacyClientApp } from './pharmacy/PharmacyClientApp';"""
content = content.replace(old_import, new_import)

old_type = """type Step = 'splash' | 'login' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports' | 'auth_settings';"""
new_type = """type Step = 'splash' | 'login' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports' | 'auth_settings' | 'pharmacy';"""
content = content.replace(old_type, new_type)

old_nav = """      <button onClick={() => setStep('profile')} className={cn("flex flex-col items-center gap-1", step === 'booking_summary' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'booking_summary' ? "bg-teal-50" : "")}>
          <ActivitySquare className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Bookings</span>
      </button>"""
new_nav = """      <button onClick={() => setStep('profile')} className={cn("flex flex-col items-center gap-1", step === 'booking_summary' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'booking_summary' ? "bg-teal-50" : "")}>
          <ActivitySquare className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Bookings</span>
      </button>
      <button onClick={() => setStep('pharmacy')} className={cn("flex flex-col items-center gap-1", step === 'pharmacy' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'pharmacy' ? "bg-teal-50" : "")}>
          <Store className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Pharmacy</span>
      </button>"""
content = content.replace(old_nav, new_nav)

old_hero = """                {/* Decorative shapes instead of image for now */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-800 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-400 rounded-full opacity-20 z-0"></div>
              </div>

              {bookingNumber && ("""
new_hero = """                {/* Decorative shapes instead of image for now */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-800 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-400 rounded-full opacity-20 z-0"></div>
              </div>
              
              {/* Pharmacy Promo Banner */}
              <div className="bg-teal-50 rounded-3xl p-6 border border-teal-100 flex justify-between items-center shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStep('pharmacy')}>
                <div>
                  <h3 className="text-teal-900 font-bold text-lg mb-1">Pharmacy Store</h3>
                  <p className="text-teal-700 text-xs">Order medicines to your door</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-teal-600">
                  <Store className="w-6 h-6" />
                </div>
              </div>

              {bookingNumber && ("""
content = content.replace(old_hero, new_hero)

# Inject the Pharmacy step right before the BottomNav
old_bottom_nav_render = """        {/* Bottom Navigation */}
        {['home', 'booking_summary', 'reports', 'profile'].includes(step) && <BottomNav />}
      </div>
    </div>
  );
}"""
new_bottom_nav_render = """        {step === 'pharmacy' && (
          <div className="absolute inset-0 z-50 bg-white">
            <PharmacyClientApp patientId={patientId} onBack={() => setStep('home')} />
          </div>
        )}

        {/* Bottom Navigation */}
        {['home', 'booking_summary', 'reports', 'profile'].includes(step) && <BottomNav />}
      </div>
    </div>
  );
}"""
content = content.replace(old_bottom_nav_render, new_bottom_nav_render)

open('src/components/PatientApp.tsx', 'w').write(content)
