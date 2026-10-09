import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { PatientApp } from './components/PatientApp';
import { useLanguage } from './contexts/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ProviderApp } from './components/ProviderApp';
import { AdminApp } from './components/AdminApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LogOut, ArrowLeft } from 'lucide-react';
import { AuthForms } from './components/AuthForms';
import heroImage from './assets/images/healthcare_illustration_1788340744531.jpg';
import { ArrowRight } from 'lucide-react';

export default function App() {
  const { t } = useLanguage();
  const [view, setView] = useState<'patient' | 'provider' | 'admin' | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'client' | 'provider' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUserDoc: any;
    
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setLoading(true);
        try {
          // Check admin first
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          if (adminDoc.exists()) {
            setRole('admin');
            setLoading(false);
            return;
          }
          
          // Listen to users collection (solves race condition on registration)
          unsubUserDoc = onSnapshot(doc(db, 'users', u.uid), async (docSnap) => {
            if (docSnap.exists() && docSnap.data().role) {
              const userData = docSnap.data();
              setRole(userData.role);
              setLoading(false);
            } else {
              // Might be in the middle of registration, or an existing provider without a users document.
              // Safe Data Migration Check:
              try {
                const providerDoc = await getDoc(doc(db, 'providers', u.uid));
                if (providerDoc.exists()) {
                   // It's a provider, repair the users doc
                   const { setDoc } = await import('firebase/firestore');
                   await setDoc(doc(db, 'users', u.uid), {
                      uid: u.uid,
                      role: 'provider',
                      fullName: providerDoc.data().name || '',
                      email: u.email || '',
                      phone: u.phoneNumber || '',
                      createdAt: providerDoc.data().createdAt || Date.now(),
                      accountStatus: 'active'
                   }, { merge: true });
                   setRole('provider');
                   setLoading(false);
                   return;
                }
              } catch (e) {
                 console.warn("Migration check error:", e);
              }
              
              // Give it a moment in case it's mid-registration
              setTimeout(() => {
                 setLoading(false);
              }, 2000);
            }
          }, (err) => {
            console.warn('Error fetching user role:', err);
            setLoading(false);
          });
          
        } catch (e: any) {
          console.warn('Error in auth state:', e);
          setLoading(false);
        }
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
        if (unsubUserDoc) unsubUserDoc();
      }
    });
    
    return () => {
      unsubAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Splash Screen - Select Role Intent
  if (!view) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
          
          {/* Left Side: Visual & Branding */}
          <div className="w-full md:w-5/12 bg-blue-900 text-white flex flex-col justify-center items-center p-8 md:p-12 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-blue-800 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-400 to-transparent"></div>
            
            <div className="relative z-10 w-full max-w-lg text-center md:text-left flex flex-col h-full justify-center">
              <div className="w-16 h-16 bg-white/10 rounded-3xl mb-8 flex items-center justify-center shadow-lg backdrop-blur-sm mx-auto md:mx-0 border border-white/20">
                <span className="text-white font-bold text-3xl">+</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">{t('Nurse To You')}</h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-100 mb-6 leading-tight">{t('Professional Nursing Care at Your Doorstep')}</h2>
              <p className="text-blue-200 text-lg md:text-xl font-light mb-10 leading-relaxed">
                {t('Quality healthcare services connecting you with trusted healthcare professionals wherever you are.')}
              </p>
              
              <div className="w-full max-w-sm mx-auto md:mx-0 bg-white rounded-[2rem] p-3 shadow-2xl hidden md:block border border-white/20 transform hover:scale-105 transition-transform duration-500">
                <img src={heroImage} alt="Professional Healthcare" className="w-full h-auto rounded-3xl" />
              </div>
            </div>
          </div>

          {/* Right Side: Login Options */}
          <div className="w-full md:w-7/12 bg-white flex flex-col justify-center items-center p-8 md:p-12 relative">
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
              <LanguageSwitcher />
              <button 
                onClick={() => setView('admin')}
                className="text-sm font-bold text-gray-400 hover:text-blue-900 transition-colors px-4 py-2 rounded-full hover:bg-slate-50"
              >
                Admin Login
              </button>
            </div>
            
            {/* Mobile Image (shown only on small screens) */}
            <div className="w-full max-w-xs mx-auto bg-white rounded-3xl p-3 shadow-xl mb-10 md:hidden block border border-gray-100">
              <img src={heroImage} alt="Professional Healthcare" className="w-full h-auto rounded-2xl" />
            </div>

            <div className="w-full max-w-md text-center">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">{t('Welcome Back')}</h3>
              <p className="text-gray-500 mb-10 text-lg">{t('Please select your portal to continue')}</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setView('patient')}
                  className="w-full flex items-center justify-between gap-3 bg-blue-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 group"
                >
                  <span className="text-lg">{t('Client Login')}</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                
                <button 
                  onClick={() => setView('provider')}
                  className="w-full flex items-center justify-between gap-3 bg-teal-50 text-teal-800 font-bold py-4 px-6 rounded-2xl hover:bg-teal-100 transition-all border border-teal-100 hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <span className="text-lg">{t('Provider Login')}</span>
                  <div className="w-8 h-8 rounded-full bg-teal-200/50 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <ArrowRight className="w-4 h-4 text-teal-800" />
                  </div>
                </button>
              </div>
              
              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium text-gray-500">{t('Secure & Encrypted Platform')}</p>
              </div>
            </div>
          </div>

        </div>
      </ErrorBoundary>
    );
  }

  // 2. User is not logged in or hasn't finished profile creation
  if (!user || !role) {
    return (
      <AuthForms view={view} onBack={() => {
        if (user) signOut(auth);
        setView(null);
      }} existingUser={user} />
    );
  }

  // 3. User is logged in but role doesn't match selected view
  const assignedRole = view === 'patient' ? 'client' : view === 'provider' ? 'provider' : 'admin';
  if (role !== assignedRole) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm mb-6">
            You are signed in as a <span className="font-bold capitalize">{role || 'unknown role'}</span>, 
            but you are trying to access the <span className="font-bold capitalize">{view}</span> portal.
          </p>
          <div className="space-y-3">
            {(role === 'client' || role === 'provider' || role === 'admin') && (
              <button 
                onClick={() => setView(role === 'client' ? 'patient' : role)}
                className="w-full py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800"
              >
                Switch to {role} Portal
              </button>
            )}
            <button 
              onClick={() => { signOut(auth); setView(null); }}
              className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Render the correct App
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 p-0 sm:p-4 font-sans relative">
{/* Home and Logout buttons moved inside the apps */}
        
        {view === 'admin' && <AdminApp />}
        {view === 'patient' && <PatientApp patientId={user.uid} userName={user.displayName || 'Client'} onHome={() => setView(null)} onLogout={() => { signOut(auth); setView(null); }} />}
        {view === 'provider' && <ProviderApp providerId={user.uid} />}
      </div>
    </ErrorBoundary>
  );
}
