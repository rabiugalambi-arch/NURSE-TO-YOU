import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  Check, X, Navigation, MapPin, Activity, User, LogOut, Clock, 
  AlertTriangle, LocateFixed, ActivitySquare, Home, Wallet, ShieldCheck, Calendar, UserCircle,
  AlertCircle
} from 'lucide-react';
import { ProviderApplication } from './ProviderApplication';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../firebase';
import { Provider, Booking } from '../types';
import { AuthSettings } from './AuthSettings';
import { Lock, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { triggerNotification } from '../lib/notifications';

const locallyCancelledBookings = new Set<string>();

const NotificationBanner = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    (typeof Notification !== 'undefined') ? Notification.permission : 'default'
  );

  if (permission !== 'default') return null;
  if (!('Notification' in window)) return null;

  const handleEnable = () => {
    Notification.requestPermission().then((p) => setPermission(p));
  };

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div>
        <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-blue-600"/> Enable Booking Notifications</h3>
        <p className="text-sm opacity-90">To receive background alerts for new bookings when you are not actively viewing the app, please enable browser notifications.</p>
      </div>
      <button 
        onClick={handleEnable}
        className="shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
      >
        Enable
      </button>
    </div>
  );
};


// Fix for default marker icons in react-leaflet
if (typeof window !== 'undefined' && L && L.Icon && L.Icon.Default) {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}



export function ProviderApp({ providerId }: { providerId: string }) {
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{message: string, type: 'success'|'error'|'info'} | null>(null);
  const [tab, setTab] = useState<'requests' | 'earnings' | 'profile' | 'auth_settings'>('requests');
  const [activeTrackingBookingId, setActiveTrackingBookingId] = useState<string | null>(null);

  // Live location tracking for active booking
  useEffect(() => {
    let watchId: number;
    
    if (activeTrackingBookingId && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            await updateDoc(doc(db, 'bookings', activeTrackingBookingId), {
              providerLatitude: position.coords.latitude,
              providerLongitude: position.coords.longitude,
              lastLocationUpdate: Date.now(),
              isTrackingActive: true
            });
          } catch (error) {
            console.warn("Failed to update booking location:", error);
          }
        },
        (error) => {
          console.warn("Geolocation watch error:", error);
          setLocationStatus({ message: "GPS signal lost or permission denied.", type: 'error' });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (activeTrackingBookingId) {
        // When stopping tracking, optionally set isTrackingActive to false
        updateDoc(doc(db, 'bookings', activeTrackingBookingId), {
          isTrackingActive: false
        }).catch(e => console.warn(e));
      }
    };
  }, [activeTrackingBookingId]);

  // Auto-update GPS location every 30 seconds if available or busy AND location is enabled
  useEffect(() => {
    let intervalId: any;
    if (providerData && (providerData.available || providerData.isBusy) && providerData.locationEnabled) {
      intervalId = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await updateDoc(doc(db, 'providers', providerId), {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  locationAccuracy: position.coords.accuracy,
                  lastLocationUpdate: Date.now()
                });
              } catch (e) {
                // Silent fail for auto-updates
              }
            },
            () => {}, // Silent error
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }, 30000);
    }
    return () => clearInterval(intervalId);
  }, [providerData?.available, providerData?.isBusy, providerId]);


  useEffect(() => {
    if (!providerId) return;

    // Listen to provider data (for available status)
    const unsubProvider = onSnapshot(doc(db, 'providers', providerId), (docSnap) => {
      if (docSnap.exists()) {
        setProviderData({ ...docSnap.data(), id: docSnap.id } as Provider);
      }
    }, (err) => console.warn('Provider snapshot error:', err.message));

    // Listen to bookings assigned to this provider
    const q = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId)
    );
const unsubBookings = onSnapshot(q, (snapshot) => {
      const reqs: Booking[] = [];
      snapshot.forEach((d) => reqs.push({ ...d.data(), id: d.id } as Booking));
      reqs.sort((a, b) => b.createdAt - a.createdAt);
      setBookings(reqs);

      snapshot.docChanges().forEach((change) => {
        const booking = change.doc.data() as Booking;
        const bookingId = change.doc.id;
        
        if (change.type === 'added') {
          // If a new booking is added and is requested
          if (booking.status === 'REQUESTED') {
            const timeDiff = Date.now() - booking.createdAt;
            // Only notify if it's recently created (within last hour) to avoid spam on initial load
            if (timeDiff < 60 * 60 * 1000) {
              triggerNotification(
                `${bookingId}-NEW`, 
                'New Booking Received', 
                `Client: ${booking.clientName}\nService: ${booking.service}\nDate: ${booking.date} ${booking.time}`, 
                'info'
              );
            }
          }
        } else if (change.type === 'modified') {
          if (booking.status === 'CANCELLED') {
            // Only notify provider if they didn't just cancel it themselves
            if (!locallyCancelledBookings.has(bookingId)) {
              triggerNotification(`${bookingId}-CANCELLED`, 'Booking Cancelled', `The booking with ${booking.clientName} has been cancelled by the client.`, 'warning');
            }
          }
        }
      });
    }, (err) => console.warn('Bookings snapshot error:', err.message));

    return () => {
      unsubProvider();
      unsubBookings();
    };
  }, [providerId]);

  const toggleAvailability = async () => {
    if (!providerData) return;
    const newStatus = !providerData.available;
    
    try {
      if (newStatus) {
        // Provider is turning ON availability - fetch location first
        setIsUpdatingLocation(true);
        setLocationStatus({ message: 'Detecting location...', type: 'info' });
        
        if (!navigator.geolocation) {
          // Fallback if no geolocation support
          await updateDoc(doc(db, 'providers', providerId), { available: true });
          setLocationStatus({ message: 'Geolocation not supported, but you are now available.', type: 'error' });
          setIsUpdatingLocation(false);
          setTimeout(() => setLocationStatus(null), 3000);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              await updateDoc(doc(db, 'providers', providerId), {
                available: true,
                latitude,
                longitude,
                locationAccuracy: accuracy,
                lastLocationUpdate: Date.now()
              });
              setLocationStatus({ message: 'Location detected ✓', type: 'success' });
              setTimeout(() => setLocationStatus(null), 3000);
            } catch (e: any) {
              setLocationStatus({ message: 'Error updating location', type: 'error' });
              console.warn(e?.message || e);
            } finally {
              setIsUpdatingLocation(false);
            }
          },
          (error) => {
            console.warn("[Provider GPS] Availability location error:", error?.message || error?.code);
            // Allow turning on duty even if live GPS fails or is denied
            updateDoc(doc(db, 'providers', providerId), { available: true })
              .then(() => {
                setLocationStatus({ message: 'Duty ON (Coverage: Kano State)', type: 'info' });
                setTimeout(() => setLocationStatus(null), 3000);
              })
              .catch((err) => {
                console.warn(err);
                setLocationStatus({ message: 'Error setting availability', type: 'error' });
              })
              .finally(() => {
                setIsUpdatingLocation(false);
              });
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        // Turning OFF availability
        await updateDoc(doc(db, 'providers', providerId), {
          available: false
        });
      }
    } catch (e: any) {
      console.warn(e?.message || e);
    }
  };

  const updateLocation = () => {
    setIsUpdatingLocation(true);
    setLocationStatus({ message: 'Detecting location...', type: 'info' });
    console.log("[Provider GPS] Requesting location permission...");
    
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setLocationStatus({ message: msg, type: 'error' });
      console.warn("[Provider GPS]", msg);
      setIsUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`[Provider GPS] Success: lat=${latitude}, lng=${longitude}, acc=${accuracy}`);
          await updateDoc(doc(db, 'providers', providerId), {
            latitude,
            longitude,
            locationAccuracy: accuracy,
            locationUpdatedAt: Date.now(),
            lastLocationUpdate: Date.now(),
            locationEnabled: true
          });
          console.log("[Provider GPS] Firestore update successful.");
          setLocationStatus({ message: 'Location detected ✓', type: 'success' });
          setTimeout(() => setLocationStatus(null), 3000);
        } catch (error: any) {
          console.error("[Provider GPS] Error updating Firestore:", error?.message || error);
          setLocationStatus({ message: 'Unable to detect location. Please turn on device Location/GPS and try again.', type: 'error' });
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (error) => {
        let msg = 'Unable to detect location. Please check your network and GPS settings.';
        if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow location access in your browser/device settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location services unavailable. Please turn on GPS.';
        } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please try again.';
        }
        console.warn("[Provider GPS] Error:", msg, error);
        setLocationStatus({ message: msg, type: 'error' });
        setIsUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    if (status === 'CANCELLED') {
      locallyCancelledBookings.add(bookingId);
    }
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { status });
      
      // If completed or cancelled, free up the provider
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        if (activeTrackingBookingId === bookingId) {
          setActiveTrackingBookingId(null);
        }
        await updateDoc(doc(db, 'providers', providerId), {
          isBusy: false,
          currentBookingId: null
        });
      }
    } catch (e: any) {
      console.warn(e?.message || e);
    }
  };

  

  const BottomNav = () => (
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-3 px-6 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] mt-auto">
      <button onClick={() => setTab('requests')} className={cn("flex flex-col items-center gap-1", tab === 'requests' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", tab === 'requests' ? "bg-teal-50" : "")}>
          <ActivitySquare className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Requests</span>
      </button>
      <button onClick={() => setTab('earnings')} className={cn("flex flex-col items-center gap-1", tab === 'earnings' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", tab === 'earnings' ? "bg-teal-50" : "")}>
          <Wallet className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Earnings</span>
      </button>
      <button onClick={() => setTab('profile')} className={cn("flex flex-col items-center gap-1", tab === 'profile' ? "text-teal-400" : "text-gray-500 hover:text-blue-900")}>
        <div className={cn("p-1.5 rounded-xl", tab === 'profile' ? "bg-teal-50" : "")}>
          <User className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-medium">Profile</span>
      </button>
    </div>
  );

  const isApproved = Boolean(
    providerData?.applicationStatus === 'approved' || 
    providerData?.verified === true || 
    (providerData as any)?.isApproved === true || 
    (providerData as any)?.approved === true ||
    (providerData as any)?.status === 'approved'
  );

  if (!isApproved) {
    return <ProviderApplication providerData={providerData} providerId={providerId} />;
  }

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative sm:h-[850px] sm:my-10 sm:rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden font-sans">
      <header className="bg-blue-900 px-6 py-5 flex items-center justify-between sticky top-0 z-10 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
              {providerData?.name}
              {providerData?.verified && <ShieldCheck className="w-4 h-4 text-teal-400" />}
            </h1>
            <p className="text-xs text-blue-200 font-medium">{providerData?.professionalRole}</p>
          </div>
        </div>

      </header>
      
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {tab === 'requests' && (
          <div className="p-6 pb-12 animate-in fade-in">
            <NotificationBanner />
            <div className="bg-white border border-gray-100 rounded-3xl p-5 mb-8 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Duty Status
                    <span className={cn("w-2.5 h-2.5 rounded-full", providerData?.available ? "bg-teal-500 animate-pulse" : "bg-gray-400")}></span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Accepting new patient requests</p>
                </div>
                <button 
                  onClick={toggleAvailability}
                  className={cn(
                    "relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out shadow-sm",
                    providerData?.available ? "bg-teal-500" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      providerData?.available ? "translate-x-6" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
              
              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                    <MapPin className="w-4 h-4"/> Current Location
                  </div>
                  <button
                    onClick={updateLocation}
                    disabled={isUpdatingLocation}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
                      isUpdatingLocation 
                        ? "bg-gray-200 text-gray-500" 
                        : "bg-blue-900 text-white hover:bg-blue-800 active:scale-95"
                    )}
                  >
                    <LocateFixed className={cn("w-3.5 h-3.5", isUpdatingLocation && "animate-pulse")} />
                    {isUpdatingLocation ? 'Locating...' : 'Enable Location'}
                  </button>
                </div>
                
                <div className="mt-2 text-sm font-medium text-blue-900">
                  {providerData?.locationEnabled || providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> Location: Active</div>
                      <div className="text-xs text-gray-500 font-normal">Last updated: {new Date(providerData.locationUpdatedAt || providerData.lastLocationUpdate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location: Not available</div>
                  )}
                </div>
                {locationStatus && (
                  <p className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded bg-white w-max",
                    locationStatus.type === 'error' && "text-red-600 border border-red-100",
                    locationStatus.type === 'success' && "text-teal-600 border border-teal-100",
                    locationStatus.type === 'info' && "text-blue-600 border border-blue-100"
                  )}>
                    {locationStatus.message}
                  </p>
                )}
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mb-4 text-xl px-1">Active Queue</h3>
            
            {bookings.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <ActivitySquare className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="font-bold text-gray-900">No Pending Requests</h4>
                <p className="text-sm text-gray-500 mt-2 max-w-[200px] mx-auto leading-relaxed">Stay online to receive incoming patient requests in your area.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm relative">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1",
                          b.status === 'REQUESTED' ? "bg-orange-100 text-orange-700 border border-orange-200" :
                          b.status === 'ACCEPTED' ? "bg-blue-100 text-blue-700 border border-blue-200" :
                          b.status === 'IN_PROGRESS' ? "bg-purple-100 text-purple-700 border border-purple-200" :
                          b.status === 'COMPLETED' ? "bg-teal-100 text-teal-700 border border-teal-200" :
                          "bg-gray-100 text-gray-700 border border-gray-200"
                        )}>
                          {b.status === 'REQUESTED' && <Clock className="w-3 h-3"/>}
                          {b.status === 'COMPLETED' && <Check className="w-3 h-3"/>}
                          {b.status}
                        </span>
                        <div className="text-lg font-bold text-blue-900">₦{b.price.toLocaleString()}</div>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 text-xl mb-1 flex items-center gap-2">
                        {b.service}
                        {b.bookingType === 'physician' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{b.consultationType || 'Consultation'}</span>}
                      </h4>
                      <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500 font-medium">
                        <p>ID: {b.bookingId || b.id.substring(0,8).toUpperCase()}</p>
                        {b.bookingType === 'physician' && (
                          <p className="flex items-center gap-1 text-blue-900">
                            <Calendar className="w-3 h-3"/> {b.date || 'TBD'} • <Clock className="w-3 h-3"/> {b.time || 'TBD'}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <UserCircle className="w-5 h-5 text-blue-900 shrink-0" />
                            <span className="font-semibold text-gray-900 text-sm">{b.clientName || 'Client'}</span>
                          </div>
                          {b.clientPhone && (
                            <p className="text-xs text-gray-500 font-medium ml-7">Contact: {b.clientPhone}</p>
                          )}
                        </div>
                        {b.clientPhone && b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                          <a 
                            href={`tel:${b.clientPhone}`}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-teal-600 text-white font-bold rounded-lg shadow-sm hover:bg-teal-700 transition-colors text-sm"
                          >
                            📞 Call Client
                          </a>
                        )}
                      </div>
                    </div>

                    {b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && b.bookingType !== 'physician' && (
                      <div className="bg-slate-50 p-5 border-t border-b border-gray-100">
                        <div className="flex items-start gap-3 mb-4">
                          <MapPin className="w-5 h-5 text-blue-900 shrink-0" />
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">Patient Location</span>
                            <span className="text-xs text-gray-500 font-medium mt-0.5 block">
                              {b.patientLatitude !== undefined && b.patientLongitude !== undefined 
                                ? `${b.patientLatitude.toFixed(4)}, ${b.patientLongitude.toFixed(4)}` 
                                : 'Location unavailable'}
                            </span>
                          </div>
                        </div>
                        
                        {b.patientLatitude !== undefined && b.patientLongitude !== undefined && (
                          <div className="space-y-3">
                            <div className="h-32 w-full rounded-2xl overflow-hidden border border-gray-200 z-0 relative shadow-inner">
                              <MapContainer center={[b.patientLatitude, b.patientLongitude]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
                                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                <Marker position={[b.patientLatitude, b.patientLongitude]}>
                                  <Popup>Patient</Popup>
                                </Marker>
                              </MapContainer>
                            </div>
                            
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${b.patientLatitude},${b.patientLongitude}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-blue-200 text-blue-900 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                            >
                              <Navigation className="w-4 h-4" /> Open Maps Navigation
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && b.bookingType !== 'physician' && (
                      <div className="px-5 pb-3">
                        {activeTrackingBookingId === b.id ? (
                          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-teal-700">
                              <MapPin className="w-5 h-5 animate-pulse" />
                              <span className="font-bold text-sm">Live Location Sharing Active</span>
                            </div>
                            <button
                              onClick={() => setActiveTrackingBookingId(null)}
                              className="w-full bg-white text-teal-700 border border-teal-200 font-bold py-2.5 rounded-lg hover:bg-teal-50 transition-colors text-sm"
                            >
                              Stop Sharing Location
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm("Share your live GPS location with the patient for this booking?")) {
                                setActiveTrackingBookingId(b.id);
                              }
                            }}
                            className="w-full bg-blue-50 text-blue-700 border border-blue-200 font-bold py-3 rounded-xl hover:bg-blue-100 transition-colors text-sm flex items-center justify-center gap-2"
                          >
                            <LocateFixed className="w-4 h-4" /> Share My Live Location
                          </button>
                        )}
                      </div>
                    )}

                    <div className="p-4 bg-white flex gap-3">
                      {b.status === 'REQUESTED' && (
                        <>
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'CANCELLED')}
                            className="w-14 h-14 flex items-center justify-center bg-white text-red-500 border border-red-200 rounded-2xl hover:bg-red-50 transition-colors shrink-0 shadow-sm"
                          >
                            <X className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => updateBookingStatus(b.id, 'ACCEPTED')}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-900 text-white font-bold rounded-2xl hover:bg-blue-800 transition-colors shadow-lg"
                          >
                            <Check className="w-5 h-5" /> Accept Request
                          </button>
                        </>
                      )}
                      
                      {b.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'ON_THE_WAY')}
                          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                        >
                          En Route to Patient
                        </button>
                      )}
                      
                      {b.status === 'ON_THE_WAY' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'ARRIVED')}
                          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                          Mark as Arrived
                        </button>
                      )}

                      {b.status === 'ARRIVED' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                        >
                          <ActivitySquare className="w-5 h-5"/> Start Service
                        </button>
                      )}

                      {b.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'COMPLETED')}
                          className="w-full bg-teal-500 text-white font-bold py-4 rounded-2xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5"/> Complete Service
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {tab === 'earnings' && (
          <div className="p-6 animate-in fade-in">
            <h2 className="font-bold text-gray-900 text-2xl mb-6">Earnings Dashboard</h2>
            <div className="bg-blue-900 rounded-3xl p-6 text-white mb-6 shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-200 text-sm font-medium mb-1">Available Balance</p>
                <h3 className="text-4xl font-bold mb-6">₦42,500</h3>
                <button className="w-full bg-white text-blue-900 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Withdraw to Bank
                </button>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-800 rounded-tl-full opacity-50 z-0"></div>
            </div>
            
            <h4 className="font-bold text-gray-900 mb-4">Recent Transactions</h4>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Service Completion</p>
                      <p className="text-xs text-gray-500">Today, 2:30 PM</p>
                    </div>
                  </div>
                  <span className="font-bold text-teal-600">+₦8,000</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div className="p-6 animate-in fade-in">
            <h2 className="font-bold text-gray-900 text-2xl mb-6">Provider Settings</h2>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-blue-900" />
              </div>
              <h3 className="font-bold text-gray-900 text-xl">{providerData?.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{providerData?.professionalRole}</p>
              <div className="bg-teal-50 text-teal-700 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 border border-teal-100">
                <ShieldCheck className="w-4 h-4"/> ID Verified
              </div>
            </div>
            
            <div className="space-y-3">
              <button className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <span className="font-bold text-gray-700 text-sm">Professional Details</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <span className="font-bold text-gray-700 text-sm">Service Areas & Pricing</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <span className="font-bold text-gray-700 text-sm">Support & Help</span>
                <span className="text-gray-400">→</span>
              </button>
              <button onClick={() => setTab('auth_settings')} className="w-full bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:border-blue-200 transition-all">
                <span className="font-bold text-gray-700 text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> Account & Security</span>
                <span className="text-gray-400">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}
