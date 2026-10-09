import React, { useState } from 'react';
import { auth } from '../firebase';
import { EmailAuthProvider, linkWithCredential, fetchSignInMethodsForEmail } from 'firebase/auth';
import { Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export function AuthSettings() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const hasPassword = auth.currentUser?.providerData.some(p => p.providerId === 'password');

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!auth.currentUser) {
      setError("You must be logged in to update settings.");
      return;
    }

    setLoading(true);
    try {
      // First, try to fetch sign in methods to prevent duplicates early
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          setError("This email is already associated with another account. Please log in with that account or use a different email.");
          setLoading(false);
          return;
        }
      } catch (fetchErr: any) {
        // If email enumeration protection is enabled, this will fail.
        // We'll just rely on the linkWithCredential error in that case.
      }

      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(auth.currentUser, credential);
      setSuccess(true);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use' || err.code === 'auth/credential-already-in-use') {
        setError("This email is already associated with another account. Please log in with that account or use a different email.");
      } else {
        setError(err.message || "Failed to link email/password");
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasPassword) {
    return (
      <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-gray-900 mb-1">Email Authentication Active</h3>
        <p className="text-sm text-gray-500">Your account is already secured with an email and password.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Lock className="w-5 h-5 text-blue-900" />
        Add Email Login
      </h3>
      <p className="text-sm text-gray-500 mb-6">Set up an email and password to log in to this account on any device.</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-xl flex items-start gap-2">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>Email and password successfully added to your account!</span>
        </div>
      )}

      <form onSubmit={handleLinkAccount} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-900 text-sm"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Create Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-900 text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-900 text-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-70 mt-2"
        >
          {loading ? 'Saving...' : 'Save Authentication Details'}
        </button>
      </form>
    </div>
  );
}
