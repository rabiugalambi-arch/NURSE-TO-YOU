const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add imports
content = content.replace(
  "import { AuthForms } from './components/AuthForms';",
  "import { AuthForms } from './components/AuthForms';\nimport heroImage from './assets/images/healthcare_illustration_1788340744531.jpg';\nimport { ArrowRight } from 'lucide-react';"
);

const oldSplash = `  // 1. Splash Screen - Select Role Intent
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
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
              >
                Client Login
              </button>
              <button 
                onClick={() => setView('provider')}
                className="w-full bg-teal-50 text-teal-600 font-bold py-4 rounded-2xl hover:bg-teal-100 transition-colors"
              >
                Provider Login
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }`;

const newSplash = `  // 1. Splash Screen - Select Role Intent
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
              
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">Nurse To You</h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-blue-100 mb-6 leading-tight">Professional Nursing Care at Your Doorstep</h2>
              <p className="text-blue-200 text-lg md:text-xl font-light mb-10 leading-relaxed">
                Quality healthcare services connecting you with trusted healthcare professionals wherever you are.
              </p>
              
              <div className="w-full max-w-sm mx-auto md:mx-0 bg-white rounded-[2rem] p-3 shadow-2xl hidden md:block border border-white/20 transform hover:scale-105 transition-transform duration-500">
                <img src={heroImage} alt="Professional Healthcare" className="w-full h-auto rounded-3xl" />
              </div>
            </div>
          </div>

          {/* Right Side: Login Options */}
          <div className="w-full md:w-7/12 bg-white flex flex-col justify-center items-center p-8 md:p-12 relative">
            <button 
              onClick={() => setView('admin')}
              className="absolute top-6 right-6 text-sm font-bold text-gray-400 hover:text-blue-900 transition-colors z-10 px-4 py-2 rounded-full hover:bg-slate-50"
            >
              Admin Login
            </button>
            
            {/* Mobile Image (shown only on small screens) */}
            <div className="w-full max-w-xs mx-auto bg-white rounded-3xl p-3 shadow-xl mb-10 md:hidden block border border-gray-100">
              <img src={heroImage} alt="Professional Healthcare" className="w-full h-auto rounded-2xl" />
            </div>

            <div className="w-full max-w-md text-center">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-3">Welcome Back</h3>
              <p className="text-gray-500 mb-10 text-lg">Please select your portal to continue</p>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setView('patient')}
                  className="w-full flex items-center justify-between gap-3 bg-blue-900 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5 group"
                >
                  <span className="text-lg">Client Login</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                
                <button 
                  onClick={() => setView('provider')}
                  className="w-full flex items-center justify-between gap-3 bg-teal-50 text-teal-800 font-bold py-4 px-6 rounded-2xl hover:bg-teal-100 transition-all border border-teal-100 hover:shadow-md hover:-translate-y-0.5 group"
                >
                  <span className="text-lg">Provider Login</span>
                  <div className="w-8 h-8 rounded-full bg-teal-200/50 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <ArrowRight className="w-4 h-4 text-teal-800" />
                  </div>
                </button>
              </div>
              
              <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm font-medium text-gray-500">Secure & Encrypted Platform</p>
              </div>
            </div>
          </div>

        </div>
      </ErrorBoundary>
    );
  }`;

// Use indexOf and string replacement to be exact and avoid regex issues
const startIndex = content.indexOf('  // 1. Splash Screen - Select Role Intent');
const endIndex = content.indexOf('  // 2. User is not logged in or hasn\'t finished profile creation');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newSplash + '\n\n' + content.substring(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log('App.tsx updated');
} else {
  console.log('Could not find splash block');
}
