import sys

new_content = """import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Mail, Lock, User as UserIcon, Phone, FileText } from 'lucide-react';

interface AuthFormsProps {
  view: 'patient' | 'provider' | 'admin';
  onBack: () => void;
}

const googleProvider = new GoogleAuthProvider();

export function AuthForms({ view, onBack }: AuthFormsProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Existing form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+234');
  
  // Provider specific
  const [professionalRole, setProfessionalRole] = useState('RN');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [services, setServices] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Google Onboarding State
  const [googleRegistration, setGoogleRegistration] = useState<any>(null);
  const [googleRole, setGoogleRole] = useState<'client' | 'provider' | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== confirmPassword) {
          setError("Passwords don't match");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;
        const role = view === 'patient' ? 'client' : view === 'provider' ? 'provider' : 'admin';

        await setDoc(doc(db, 'users', uid), {
          uid,
          role,
          fullName,
          email,
          phone,
          createdAt: Date.now(),
          accountStatus: 'active'
        });

        if (role === 'provider') {
          await setDoc(doc(db, 'providers', uid), {
            providerId: uid,
            name: fullName,
            professionalRole,
            licenseNumber,
            serviceArea,
            verified: false,
            applicationStatus: 'submitted',
            available: false,
            latitude: 0,
            longitude: 0,
            services: services.split(',').map(s => s.trim()).filter(s => s.length > 0),
            rating: 0,
            createdAt: Date.now()
          });
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already associated with another account. Please log in with that account or use a different email.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const cred = await signInWithPopup(auth, googleProvider);
      
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (!userDoc.exists()) {
        // New Google User
        setGoogleRegistration(cred.user);
      }
      // If it exists, App.tsx will automatically route them to the correct dashboard based on their existing role.
    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already associated with another account. Please sign in with your email and password.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClientSetup = async () => {
    try {
      setLoading(true);
      const uid = googleRegistration.uid;
      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'client',
        fullName: googleRegistration.displayName || '',
        email: googleRegistration.email || '',
        phone: googleRegistration.phoneNumber || phone,
        createdAt: Date.now(),
        accountStatus: 'active'
      });
      // App.tsx will take over routing
    } catch (err: any) {
      setError(err.message || 'Failed to complete setup');
      setLoading(false);
    }
  };

  const handleGoogleProviderSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const uid = googleRegistration.uid;
      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'provider',
        fullName: googleRegistration.displayName || '',
        email: googleRegistration.email || '',
        phone,
        createdAt: Date.now(),
        accountStatus: 'active'
      });

      await setDoc(doc(db, 'providers', uid), {
        providerId: uid,
        name: googleRegistration.displayName || '',
        professionalRole,
        licenseNumber,
        serviceArea,
        verified: false,
        applicationStatus: 'submitted',
        available: false,
        latitude: 0,
        longitude: 0,
        services: services.split(',').map(s => s.trim()).filter(s => s.length > 0),
        rating: 0,
        createdAt: Date.now()
      });
      // App.tsx will take over routing
    } catch (err: any) {
      setError(err.message || 'Failed to complete provider setup');
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/user-not-found') {
        setResetSent(true);
        setError('');
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many password reset attempts. Please wait and try again.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Unable to send the reset email. Please check your internet connection and try again.");
      } else {
        setError(err.message || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };

  const title = view === 'patient' ? 'Client' : view === 'provider' ? 'Provider' : 'Admin';

  if (googleRegistration) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Nurse To You</h2>
          
          {!googleRole ? (
            <>
              <p className="text-gray-500 mb-8">Please choose how you would like to continue</p>
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleClientSetup}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg flex items-center justify-between"
                >
                  <span>Continue as Client</span>
                  <span className="text-xl">→</span>
                </button>
                <button 
                  onClick={() => setGoogleRole('provider')}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-white text-blue-900 border-2 border-blue-100 rounded-2xl font-bold hover:border-blue-200 transition-all flex items-center justify-between"
                >
                  <span>Register as Provider</span>
                  <span className="text-xl">→</span>
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleGoogleProviderSetup} className="space-y-4 text-left mt-6">
              <p className="text-gray-500 mb-4 text-center">Complete your Provider Profile</p>
              {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-left">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>
                <select 
                  value={professionalRole}
                  onChange={e => setProfessionalRole(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                >
                  <option value="RN">Registered Nurse (RN)</option>
                  <option value="LPN">Licensed Practical Nurse (LPN)</option>
                  <option value="CNA">Certified Nursing Assistant (CNA)</option>
                  <option value="NP">Nurse Practitioner (NP)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Registration (License/ID)</label>
                <input 
                  type="text" 
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                  required
                  placeholder="e.g. N&MCN 12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services Qualified For</label>
                <input 
                  type="text" 
                  value={services}
                  onChange={e => setServices(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                  required
                  placeholder="e.g. Wound Care, IV Therapy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Area / City</label>
                <input 
                  type="text" 
                  value={serviceArea}
                  onChange={e => setServiceArea(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                  required
                  placeholder="e.g. Kano Metro"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg mt-6 flex justify-center items-center h-14"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 text-gray-400 hover:text-blue-900 z-10 p-2"
        >
          <ArrowLeft size={20} />
        </button>
        
        <div className="w-16 h-16 bg-blue-900 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg mt-2">
          {view === 'patient' && <UserIcon className="text-white w-8 h-8" />}
          {view === 'provider' && <FileText className="text-white w-8 h-8" />}
          {view === 'admin' && <Lock className="text-white w-8 h-8" />}
        </div>
        
        <h2 className="text-2xl font-bold text-blue-900 mb-2">
          {isLogin ? `${title} Login` : `Register as ${title}`}
        </h2>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-left">{error}</div>}
        {resetSent && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-left">Password reset email sent. Please check your Gmail inbox and spam folder.</div>}
        
        <form onSubmit={handleAuth} className="space-y-4 text-left">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                    required
                  />
                </div>
              </div>
              
              {view === 'provider' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>
                    <select 
                      value={professionalRole}
                      onChange={e => setProfessionalRole(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                    >
                      <option value="RN">Registered Nurse (RN)</option>
                      <option value="LPN">Licensed Practical Nurse (LPN)</option>
                      <option value="CNA">Certified Nursing Assistant (CNA)</option>
                      <option value="NP">Nurse Practitioner (NP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Registration (License/ID)</label>
                    <input 
                      type="text" 
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. N&MCN 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services Qualified For</label>
                    <input 
                      type="text" 
                      value={services}
                      onChange={e => setServices(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. Wound Care, IV Therapy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area / City</label>
                    <input 
                      type="text" 
                      value={serviceArea}
                      onChange={e => setServiceArea(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. Kano Metro"
                    />
                  </div>
                </>
              )}
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); setResetSent(false); }}
                className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                required
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              {isLogin && (
                <button type="button" onClick={handleResetPassword} className="text-sm text-blue-600 hover:underline">
                  Forgot?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); setResetSent(false); }}
                className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                required
                minLength={6}
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg mt-6 disabled:opacity-70 flex justify-center items-center h-14"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              isLogin ? 'Sign In' : 'Register'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 px-6 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex justify-center items-center gap-3 h-14"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        {view !== 'admin' && (
          <div className="mt-6 text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }} 
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
"""

with open('src/components/AuthForms.tsx', 'w') as f:
    f.write(new_content)
print("Updated AuthForms.tsx")
