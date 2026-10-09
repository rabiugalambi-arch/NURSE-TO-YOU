/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { PatientApp } from './components/PatientApp';
import { ProviderApp } from './components/ProviderApp';
import { AdminApp } from './components/AdminApp';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [view, setView] = useState<'patient' | 'provider' | 'admin' | null>(null);

  useEffect(() => {
    // Seed initial providers if they don't exist
    // seedDatabase().catch(e => console.log('Seeding omitted'));
  }, []);

  if (!view) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
            <button 
              onClick={() => setView('admin')}
              className="absolute top-6 right-6 text-xs font-bold text-gray-400 hover:text-blue-900 z-10"
            >
              Admin Portal
            </button>
            <div className="absolute top-0 left-0 w-32 h-32 bg-teal-400 rounded-full blur-3xl opacity-10 -ml-10 -mt-10"></div>
            
            <div className="w-20 h-20 bg-blue-900 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg relative z-10">
              <span className="text-white font-bold text-3xl">+</span>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-2 relative z-10">Nurse To You</h1>
            <p className="text-gray-500 mb-10 text-sm relative z-10">Select your role to continue</p>
            
            <div className="space-y-4 relative z-10">
              <button 
                onClick={() => setView('patient')}
                className="w-full py-4 px-6 bg-blue-900 text-white rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg flex items-center justify-between"
              >
                <span>I need a Nurse</span>
                <span className="text-xl">→</span>
              </button>
              <button 
                onClick={() => setView('provider')}
                className="w-full py-4 px-6 bg-white text-blue-900 border-2 border-blue-100 rounded-2xl font-bold hover:border-blue-200 transition-all flex items-center justify-between"
              >
                <span>I am a Provider</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 p-0 sm:p-4 font-sans">
        <div className="absolute top-4 left-4 z-50 hidden sm:block">
          <button 
            onClick={() => setView(null)}
            className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-blue-900 hover:bg-gray-50"
          >
            ← Switch Role
          </button>
        </div>
        {view === 'patient' && <PatientApp />}
        {view === 'provider' && <ProviderApp />}
        {view === 'admin' && <AdminApp />}
      </div>
    </ErrorBoundary>
  );
}
