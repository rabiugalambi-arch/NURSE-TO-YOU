import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { 
  MapPin, Navigation, CheckCircle, Search, Clock, Star, Map as MapIcon, 
  ChevronRight, ArrowLeft, HeartPulse, Activity, Baby, Stethoscope, 
  Syringe, FlaskConical, Home, UserCircle, FileText, ActivitySquare,
  Eye, LocateFixed, Calendar, ShieldCheck, Download, Bell, MoreVertical
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { Provider, Booking } from '../types';
import { calculateDistance, cn } from '../lib/utils';

// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

type Step = 'splash' | 'login' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports';

const SERVICES = [
  { id: 1, name: 'Health Check', icon: ActivitySquare, desc: 'Comprehensive vitals and general wellness assessment at your home.', price: 5000, displayPrice: '₦5,000', duration: '45 mins' },
  { id: 2, name: 'Malaria Test', icon: Activity, desc: 'Rapid diagnostic testing with immediate results by verified nurse.', price: 3500, displayPrice: '₦3,500', duration: '30 mins' },
  { id: 3, name: 'Pregnancy Test', icon: Baby, desc: 'Discreet and accurate pregnancy testing in the comfort of your home.', price: 2000, displayPrice: '₦2,000', duration: '15 mins' },
  { id: 4, name: 'Family Planning', icon: HeartPulse, desc: 'Consultation and administration of contraceptives by certified professionals.', price: 8000, displayPrice: '₦8,000', duration: '60 mins' },
  { id: 5, name: 'Wound Care', icon: Syringe, desc: 'Professional dressing and management of post-surgical or trauma wounds.', price: 6500, displayPrice: '₦6,500', duration: '45 mins' },
  { id: 6, name: 'Home Nursing', icon: Home, desc: 'Extended hourly care and monitoring for elderly or recovering patients.', price: 15000, displayPrice: '₦15,000 / shift', duration: '8 hours' },
  { id: 7, name: 'Laboratory Sample Collection', icon: FlaskConical, desc: 'Safe and sterile collection of blood or urine samples for lab testing.', price: 4000, displayPrice: '₦4,000', duration: '20 mins' },
  { id: 8, name: 'Maternal and Child Support', icon: Stethoscope, desc: 'Post-natal care guidance and newborn wellness checks by midwives.', price: 10000, displayPrice: '₦10,000', duration: '60 mins' },
];

export function PatientApp() {
  const [step, setStep] = useState<Step>('splash');
  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);
  
  // Login form state
  const [loginPhone, setLoginPhone] = useState('+234');
  const [loginName, setLoginName] = useState('');
  const [loginPin, setLoginPin] = useState('');
  
  // App state
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [providers, setProviders] = useState<(Provider & { distanceKm: number })[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [mockBookingNumber, setMockBookingNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Splash screen auto-advance
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => setStep('login'), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName && loginPhone) {
      setUser({ name: loginName, phone: loginPhone });
      setStep('home');
    }
  };

  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setAddress('Kano, Nigeria (Mocked)');
      setLocation({ lat: 11.9964, lng: 8.5167 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Detected GPS Location');
        setLocating(false);
      },
      (error) => {
        console.error(error?.message || error?.code || "Unknown error", error);
        setLocation({ lat: 11.9964, lng: 8.5167 }); // Fallback to Kano
        setAddress('Kano, Nigeria (Fallback)');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const findProviders = async () => {
    if (!selectedService || !location) return;
    setStep('matching');
    
    try {
      const providersRef = collection(db, 'providers');
      const q = query(
        providersRef, 
        where('services', 'array-contains', selectedService.name),
        where('available', '==', true)
      );
      
      const snap = await getDocs(q);
      const matched: (Provider & { distanceKm: number })[] = [];
      
      snap.forEach(doc => {
        const p = doc.data() as Provider;
        const distanceKm = calculateDistance(
          location.lat, location.lng,
          p.latitude, p.longitude
        );
        if (distanceKm <= (p.serviceArea || 50000) && p.verified) {
          matched.push({ ...p, distanceKm });
        }
      });
      
      matched.sort((a, b) => a.distanceKm - b.distanceKm);
      setProviders(matched);
      
      setTimeout(() => {
        setStep('results');
      }, 3000);
      
    } catch (error: any) {
      console.error("Error finding providers", error?.message || error);
      setProviders([]);
      setStep('results');
    }
  };

  const confirmBooking = async () => {
    if (!selectedProvider || !selectedService || !location || !user) return;
    
    try {
      const bNumber = '#NTY-' + Math.floor(10000 + Math.random() * 90000);
      setMockBookingNumber(bNumber);
      
      await addDoc(collection(db, 'bookings'), {
        bookingId: bNumber,
        patientId: user.phone,
        providerId: selectedProvider.id || selectedProvider.providerId,
        service: selectedService.name,
        patientLatitude: location.lat,
        patientLongitude: location.lng,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: selectedService.price,
        status: 'REQUESTED',
        createdAt: Date.now()
      });
      
      setStep('success');
    } catch (err: any) {
      console.error("Error booking", err?.message || err);
      alert("Failed to create booking.");
    }
  };

  const TopNav = ({ title, onBack, actionIcon }: { title: string, onBack?: () => void, actionIcon?: React.ReactNode }) => (
    <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
      <div className="flex items-center gap-4">
        {onBack && (
          <button onClick={onBack} className="text-blue-900 hover:bg-gray-50 p-1 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-bold text-blue-900">{title}</h1>
      </div>
      {actionIcon ? actionIcon : <button className="text-blue-900"><Bell className="w-6 h-6" /></button>}
    </div>
  );

  const BottomNav = () => (
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-3 px-6 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <button onClick={() => setStep('home')} className={cn("flex flex-col items-center gap-1", step === 'home' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'home' ? "bg-teal-50" : "")}>
          <Home className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Home</span>
      </button>
      <button onClick={() => setStep('profile')} className={cn("flex flex-col items-center gap-1", step === 'booking_summary' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'booking_summary' ? "bg-teal-50" : "")}>
          <ActivitySquare className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Bookings</span>
      </button>
      <button onClick={() => setStep('reports')} className={cn("flex flex-col items-center gap-1", step === 'reports' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'reports' ? "bg-teal-50" : "")}>
          <FileText className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Reports</span>
      </button>
      <button onClick={() => setStep('profile')} className={cn("flex flex-col items-center gap-1", step === 'profile' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", step === 'profile' ? "bg-teal-50" : "")}>
          <UserCircle className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Profile</span>
      </button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen sm:h-[850px] sm:my-10 bg-slate-50 sm:rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden relative flex flex-col font-sans">
      <div className="flex-1 overflow-y-auto relative bg-slate-50 pb-20 scrollbar-hide">
        
        {step === 'splash' && (
          <div className="flex flex-col items-center justify-center h-full bg-blue-900 text-white p-8 text-center animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <HeartPulse className="w-12 h-12 text-blue-900" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Nurse To You</h1>
            <p className="text-blue-200">Professional Healthcare, Anywhere.</p>
          </div>
        )}

        {step === 'login' && (
          <div className="flex flex-col h-full bg-slate-50 p-6 animate-in slide-in-from-bottom-4 duration-500 justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mb-6 text-white shadow-md">
                <ActivitySquare className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2 text-center">Welcome to Nurse To You</h2>
              <p className="text-gray-500 text-sm mb-8 text-center">Create an account or login to continue.</p>
              
              <form onSubmit={handleLogin} className="w-full space-y-5">
                <div className="flex bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all">
                  <div className="flex items-center gap-2 px-4 border-r border-gray-200 bg-white">
                    <span className="text-lg">🇳🇬</span>
                    <span className="font-medium text-gray-700">+234</span>
                  </div>
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="w-full p-4 bg-transparent outline-none text-gray-900"
                    value={loginPhone.replace('+234', '')}
                    onChange={e => setLoginPhone('+234' + e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full p-4 bg-transparent outline-none text-gray-900"
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-slate-50 border border-gray-200 rounded-xl overflow-hidden flex items-center pr-4 focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all">
                  <input 
                    type="password" 
                    placeholder="Password / PIN" 
                    className="w-full p-4 bg-transparent outline-none text-gray-900"
                    value={loginPin}
                    onChange={e => setLoginPin(e.target.value)}
                    required
                  />
                  <Eye className="w-5 h-5 text-gray-400 cursor-pointer" />
                </div>
                
                <button type="submit" className="w-full bg-blue-900 text-white font-semibold p-4 rounded-xl hover:bg-blue-800 shadow-lg flex items-center justify-center gap-2 mt-4">
                  Verify Identity <ArrowLeft className="w-5 h-5 rotate-180" />
                </button>
              </form>

              <div className="mt-8 flex items-center w-full gap-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-sm text-gray-400">or</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>
              
              <button className="mt-6 text-blue-900 font-semibold text-sm">
                Already have an account? Login
              </button>

              <div className="mt-8 pt-6 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-gray-400 text-xs">
                <ShieldCheck className="w-4 h-4" /> Secure Medical Platform
              </div>
            </div>
          </div>
        )}

        {step === 'home' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
              <div>
                <p className="text-gray-500 text-sm">Hello, {user?.name?.split(' ')[0]}</p>
                <p className="text-blue-900 font-bold flex items-center gap-1 text-sm"><MapPin className="w-4 h-4"/> Kano State</p>
              </div>
              <button className="relative p-2 text-blue-900 bg-white rounded-full shadow-sm border border-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search for services (e.g., Malaria Test)" 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-900 text-sm shadow-sm"
                  onClick={() => setStep('all_services')}
                />
              </div>

              <div className="bg-blue-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-bold mb-2">Need a Nurse?</h2>
                  <p className="text-blue-200 text-sm mb-6 leading-relaxed">Book verified professionals to your location instantly.</p>
                  <button onClick={() => setStep('all_services')} className="bg-white text-blue-900 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-50">
                    Book a Nurse <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
                {/* Decorative shapes instead of image for now */}
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-800 rounded-tl-full opacity-50 z-0"></div>
                <div className="absolute right-4 top-4 w-12 h-12 bg-teal-400 rounded-full opacity-20 z-0"></div>
              </div>

              {mockBookingNumber && (
                <div>
                  <h3 className="text-gray-900 font-semibold mb-3">Upcoming Booking</h3>
                  <div className="bg-white border-l-4 border-teal-400 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCircle className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 flex items-center gap-1">Nurse Amina <CheckCircle className="w-3 h-3 text-teal-500"/></h4>
                          <p className="text-gray-500 text-xs">Malaria Testing & Care</p>
                        </div>
                      </div>
                      <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">ON THE WAY</span>
                    </div>
                    <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400"/> 10:30 AM
                      </div>
                      <div className="w-px h-4 bg-gray-200"></div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                        <Navigation className="w-4 h-4"/> Est. 15m away
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-900 font-semibold">Popular Services</h3>
                  <button onClick={() => setStep('all_services')} className="text-blue-900 text-sm font-medium">See All</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {SERVICES.slice(0, 4).map(service => {
                    const Icon = service.icon;
                    return (
                      <button 
                        key={service.name}
                        onClick={() => { setSelectedService(service); setStep('service_details'); }}
                        className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-blue-200 hover:shadow-md transition-all shadow-sm flex flex-col"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Icon className="w-6 h-6 text-blue-900" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{service.name}</h4>
                        <p className="text-gray-500 text-xs">{service.desc.substring(0, 25)}...</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'all_services' && (
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
        )}

        {step === 'service_details' && selectedService && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('all_services')} />
            
            {/* Hero Image Mock */}
            <div className="w-full h-48 bg-blue-900 relative flex items-end p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
              <div className="relative z-20 w-full">
                <h2 className="text-white text-3xl font-bold mb-2">{selectedService.name}</h2>
                <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                  <ShieldCheck className="w-4 h-4"/> Verified Service
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-gray-700 text-sm leading-relaxed">{selectedService.desc}</p>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <ActivitySquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Estimated Price</p>
                  <p className="text-blue-900 font-bold text-xl">{selectedService.displayPrice}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Estimated Duration</p>
                  <p className="text-blue-900 font-bold text-xl">{selectedService.duration}</p>
                </div>
              </div>
              
              <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 flex gap-3">
                <ActivitySquare className="w-5 h-5 text-teal-600 shrink-0" />
                <p className="text-teal-900 text-sm leading-relaxed">This service is provided only by appropriately qualified and authorized healthcare professionals.</p>
              </div>
            </div>
            
            <div className="mt-auto p-6 bg-slate-50 border-t border-gray-200">
              <button 
                onClick={() => setStep('location')}
                className="w-full bg-blue-900 text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-blue-800"
              >
                <ActivitySquare className="w-5 h-5"/> Book This Service
              </button>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300 relative">
            <TopNav title="Set Your Location" onBack={() => setStep('service_details')} />
            
            <div className="flex-1 relative z-0">
              <MapContainer 
                center={[11.9964, 8.5167]} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {location && (
                  <Marker position={[location.lat, location.lng]}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}
              </MapContainer>
              
              <button 
                onClick={handleUseCurrentLocation}
                className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center text-blue-900 z-[400] border border-gray-100 hover:bg-gray-50"
              >
                <LocateFixed className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-slate-50 border-t border-gray-200 p-6 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
              <button 
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full bg-white border border-teal-500 text-teal-600 font-semibold py-3.5 rounded-xl mb-4 flex items-center justify-center gap-2 hover:bg-teal-50 transition-colors"
              >
                <LocateFixed className="w-5 h-5" /> 
                {locating ? 'Locating...' : 'Use My Current Location'}
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="h-px bg-gray-300 flex-1"></div>
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">OR</span>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>
              
              <div className="bg-white border border-gray-300 rounded-xl overflow-hidden mb-6 p-3">
                <span className="text-xs font-bold text-gray-900 block mb-1">Enter address manually</span>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 15 Zoo Road, Kano"
                  className="w-full outline-none text-gray-600 text-sm bg-transparent"
                />
              </div>
              
              <button 
                onClick={findProviders}
                disabled={!location && !address}
                className="w-full bg-blue-900 text-white font-semibold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:shadow-none hover:bg-blue-800 transition-colors"
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}

        {step === 'matching' && (
          <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 text-center animate-in zoom-in duration-300">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Nurse To You</h2>
            <p className="text-gray-600 font-medium mb-12">Automated Matching</p>
            
            <div className="relative w-64 h-64 mb-12">
              <div className="absolute inset-0 border-[1px] border-teal-200 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-4 border-[1px] border-teal-300 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute inset-12 border-[1px] border-teal-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 bg-teal-50 rounded-full flex items-center justify-center shadow-inner">
                <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white shadow-xl z-10 relative">
                  <ActivitySquare className="w-8 h-8" />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-blue-900 mb-6">Searching for providers...</h3>
            
            <div className="flex gap-3 mb-8">
              <span className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                <MapPin className="w-4 h-4"/> Kano Central
              </span>
              <span className="bg-teal-200 border border-teal-300 text-teal-900 text-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 font-medium">
                <ActivitySquare className="w-4 h-4"/> {selectedService?.name}
              </span>
            </div>
            
            <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Verifying Criteria</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-900" />
                    <span className="font-semibold text-gray-900 text-sm">Professional Credentials</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-teal-600" />
                    <span className="font-semibold text-gray-900 text-sm">Real-time Availability</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <LocateFixed className="w-5 h-5 text-red-800" />
                    <span className="font-semibold text-gray-900 text-sm">Proximity</span>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>
            </div>
            
            <button onClick={() => setStep('home')} className="mt-8 text-red-600 font-bold text-sm">Cancel Search</button>
          </div>
        )}

        {step === 'results' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('location')} />
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Available Nurses for {selectedService?.name}</h2>
              <p className="text-gray-500 text-sm flex items-center gap-1 mb-6">
                <MapPin className="w-4 h-4"/> Showing qualified providers nearby in Kano
              </p>
              
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                <button className="bg-teal-200 text-teal-900 font-semibold px-4 py-2 rounded-full text-sm shrink-0 flex items-center gap-1 border border-teal-300">
                  <CheckCircle className="w-4 h-4"/> Qualified Only
                </button>
                <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full text-sm shrink-0">Nearest</button>
                <button className="bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-full text-sm shrink-0">Top Rated</button>
              </div>
              
              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900">No Providers Found</h3>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your location or selecting a different service.</p>
                  </div>
                ) : (
                  providers.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative">
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex shrink-0 items-center justify-center relative overflow-hidden">
                          <UserCircle className="w-12 h-12 text-blue-900 mt-2" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            {p.name}
                            {p.verified && <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">{p.professionalRole}</p>
                          <div className="flex gap-4 text-xs font-medium text-gray-700">
                            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500"/> {p.rating.toFixed(1)} Rating</span>
                            <span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-gray-400"/> {p.distanceKm.toFixed(1)}km away</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400"/> {p.estimatedArrival}m arrival</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-50">
                        <button 
                          onClick={() => { setSelectedProvider(p); setStep('provider_profile'); }}
                          className="flex-1 bg-white border border-teal-500 text-teal-600 font-bold py-2.5 rounded-xl text-sm hover:bg-teal-50 transition-colors"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => { setSelectedProvider(p); setStep('booking_summary'); }}
                          className="flex-1 bg-blue-900 text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:bg-blue-800 transition-colors"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'provider_profile' && selectedProvider && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('results')} />
            
            <div className="p-6 pb-24">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                  <UserCircle className="w-20 h-20 text-blue-900 mt-4" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedProvider.name}</h2>
                <p className="text-gray-600 text-sm mb-3">{selectedProvider.professionalRole}</p>
                {selectedProvider.verified && (
                  <span className="bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-max">
                    <ShieldCheck className="w-4 h-4"/> Verified
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mb-2">
                    <ActivitySquare className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">8 Years</h3>
                  <p className="text-xs text-gray-600 font-medium leading-tight">Experience in<br/>community health</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 fill-orange-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{selectedProvider.rating.toFixed(1)} <span className="text-xs text-gray-500">/ 5.0</span></h3>
                  <p className="text-xs text-gray-600 font-medium leading-tight">(124 reviews)</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ActivitySquare className="text-blue-900 w-5 h-5"/> Qualified Services</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedProvider.services.map(s => (
                    <span key={s} className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-teal-600"/> {s}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Clock className="text-blue-900 w-5 h-5"/> Availability</h3>
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Monday - Friday</h4>
                    <p className="text-gray-600 text-sm">8:00 AM - 6:00 PM</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-200 text-teal-800 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 w-full p-6 bg-slate-50 border-t border-gray-200 z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => setStep('booking_summary')}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-5 h-5"/> Book Now
              </button>
            </div>
          </div>
        )}

        {step === 'booking_summary' && selectedProvider && selectedService && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" onBack={() => setStep('provider_profile')} />
            
            <div className="p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Booking Summary</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">Please review your appointment details before confirming.</p>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
                <div className="flex items-start gap-4 mb-6 border-b border-gray-100 pb-5">
                  <div className="w-14 h-14 bg-blue-900 rounded-xl text-white flex items-center justify-center shrink-0">
                    <ActivitySquare className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{selectedService.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <UserCircle className="w-4 h-4"/> {selectedProvider.name}
                      {selectedProvider.verified && <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Verified</span>}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex gap-4">
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Date</p>
                      <p className="text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Time</p>
                      <p className="text-gray-700">10:00 AM</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs mb-1">Location</p>
                      <p className="text-gray-700">{address || 'Kano City'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 shadow-sm mb-8">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg"><ActivitySquare className="w-5 h-5"/> Payment Breakdown</h3>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                  <span>Service Price</span>
                  <span>{selectedService.displayPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 mb-4 border-b border-gray-200 pb-4">
                  <span>Booking Fee</span>
                  <span>₦500</span>
                </div>
                <div className="flex justify-between items-center font-bold text-xl text-blue-900">
                  <span>Total</span>
                  <span>₦{(selectedService.price + 500).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setStep('payment')}
                  className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 transition-colors"
                >
                  Confirm Booking
                </button>
                <button 
                  onClick={() => setStep('results')}
                  className="w-full bg-white text-teal-600 border border-teal-500 font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <BottomNav />
          </div>
        )}

        {step === 'payment' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Payment" onBack={() => setStep('booking_summary')} />
            
            <div className="p-6">
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
                <p className="text-gray-600 text-sm mb-2">Total Amount Due</p>
                <h2 className="text-4xl font-bold text-blue-900 mb-3">₦{(selectedService?.price || 0) + 500}</h2>
                <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-teal-200">
                  <ShieldCheck className="w-3 h-3"/> Verified Service
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
              
              <div className="space-y-3 mb-6">
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'card' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-blue-900" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Bank Card</p>
                      <p className="text-xs text-gray-500">Visa, Mastercard, Verve</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'card' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'transfer' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <div className="flex items-center gap-4">
                    <Home className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Bank Transfer</p>
                      <p className="text-xs text-gray-500">Transfer to a dedicated account</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'transfer' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'transfer' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'ussd' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('ussd')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">USSD</p>
                      <p className="text-xs text-gray-500">Pay using your bank's USSD code</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'ussd' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'ussd' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Secured by Paystack</p>
              </div>
              
              <button 
                onClick={confirmBooking}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                Pay Now <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50 p-8 text-center animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center mb-6 relative">
              <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute inset-0 border-2 border-teal-200 rounded-full animate-ping opacity-30"></div>
            </div>
            
            <h2 className="text-3xl font-bold text-blue-900 mb-2">Booking Confirmed!</h2>
            <p className="text-gray-700 font-medium mb-8">Booking ID: <span className="font-bold">{mockBookingNumber}</span></p>
            
            <div className="w-full bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-8 text-left">
              <div className="flex gap-4 mb-5 border-b border-gray-100 pb-5">
                <div className="w-14 h-14 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <UserCircle className="w-10 h-10 text-blue-900 mt-2" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {selectedProvider?.name}
                    <span className="bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">Verified</span>
                  </h3>
                  <p className="text-gray-600 text-sm flex items-center gap-1"><ActivitySquare className="w-4 h-4"/> {selectedProvider?.professionalRole}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-0.5">Scheduled for</p>
                    <p className="text-sm text-gray-700 font-medium">Today, 2:30 PM</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 mb-0.5">Location</p>
                    <p className="text-sm text-gray-700 font-medium">Home Visit ({address || 'Kano City'})</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <button 
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <LocateFixed className="w-5 h-5" /> Track Provider
              </button>
              <button 
                onClick={() => setStep('home')}
                className="w-full bg-white text-teal-700 border border-teal-600 font-bold py-4 rounded-xl hover:bg-teal-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {step === 'profile' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Nurse To You" />
            <div className="p-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-6 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden shadow-inner">
                    <UserCircle className="w-20 h-20 text-blue-900 mt-4" />
                  </div>
                  <div className="absolute bottom-4 right-0 w-8 h-8 bg-blue-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <ActivitySquare className="w-4 h-4" /> {/* Edit icon proxy */}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name}</h2>
                <p className="text-gray-500 text-sm mb-3">Patient ID: #N2Y-8492</p>
                <span className="bg-teal-300 text-teal-900 text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1 w-max border border-teal-400 shadow-sm">
                  <ShieldCheck className="w-4 h-4"/> Verified
                </span>
              </div>
              
              <div className="space-y-4 mb-8">
                <button className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Personal Information</h4>
                      <p className="text-xs text-gray-500">Update your details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setStep('home')} className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Bookings</h4>
                      <p className="text-xs text-gray-500">View appointment history</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
                <button onClick={() => setStep('reports')} className="w-full bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-900">
                      <ActivitySquare className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm mb-1">Reports</h4>
                      <p className="text-xs text-gray-500">Medical documents & summaries</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'reports' && (
          <div className="flex flex-col h-full bg-slate-50 animate-in slide-in-from-right-4 duration-300">
            <TopNav title="Visit Summary" onBack={() => setStep('home')} />
            <div className="p-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-4 flex gap-4 items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                  <UserCircle className="w-12 h-12 text-blue-900 mt-2" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2 mb-1">
                    Nurse Amina
                    <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>
                  </h3>
                  <p className="text-gray-600 text-sm">Attending Provider</p>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-4">
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Rendered</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-900 rounded-xl flex items-center justify-center">
                      <ActivitySquare className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Malaria Test</span>
                  </div>
                </div>
                <div className="w-full h-px bg-gray-100 mb-6"></div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Results</p>
                  <span className="bg-teal-100 text-teal-900 font-bold text-lg px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-teal-200">
                    <FlaskConical className="w-5 h-5 text-teal-700"/> Negative
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3"><ActivitySquare className="w-4 h-4"/> Clinical Notes</h4>
                  <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl text-gray-700 text-sm leading-relaxed">
                    Patient advised to rest and stay hydrated.
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3"><ActivitySquare className="w-4 h-4"/> Recommendation</h4>
                  <div className="bg-slate-50 border border-gray-100 p-4 rounded-xl text-gray-700 text-sm leading-relaxed">
                    Follow up if symptoms persist.
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors">
                <Download className="w-5 h-5" /> Download PDF Report
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
