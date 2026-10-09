import sys

content = open('src/components/PatientApp.tsx').read()

# Replace signature
content = content.replace('export function PatientApp() {', 'export function PatientApp({ patientId, userName }: { patientId: string, userName?: string }) {')

# Remove mock user state
content = content.replace('  const [user, setUser] = useState<{ name: string; phone: string } | null>(null);', '')
content = content.replace('  const [loginPhone, setLoginPhone] = useState(\'+234\');\n  const [loginName, setLoginName] = useState(\'\');\n  const [loginPin, setLoginPin] = useState(\'\');\n', '')

# Remove handleLogin
handle_login = '''  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginName && loginPhone) {
      setUser({ name: loginName, phone: loginPhone });
      setStep('home');
    }
  };'''
content = content.replace(handle_login, '')

# Change splash timeout
content = content.replace('const timer = setTimeout(() => setStep(\'login\'), 2500);', 'const timer = setTimeout(() => setStep(\'home\'), 2500);')

# Replace patientId in Bookings
content = content.replace('patientId: user.phone,', 'patientId: patientId,')
content = content.replace('patientId: user?.phone,', 'patientId: patientId,')
content = content.replace('user?.name', 'userName')
content = content.replace('user?.phone', 'patientId')

# Remove login step
login_step = '''        {step === 'login' && (
          <div className=\"bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 max-w-sm w-full mx-auto relative z-10\">
            <div className=\"flex justify-center mb-6\">
              <div className=\"w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center shadow-lg\">
                <span className=\"text-white font-bold text-2xl\">+</span>
              </div>
            </div>
            <h2 className=\"text-2xl font-bold text-center text-blue-900 mb-2\">Welcome</h2>
            <p className=\"text-gray-500 text-sm mb-8 text-center\">Create an account or login to continue.</p>
            
            <form onSubmit={handleLogin} className=\"w-full space-y-5\">
              <div className=\"flex bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all\">
                <div className=\"flex items-center gap-2 px-4 border-r border-gray-200 bg-white\">
                  <span className=\"text-lg\">🇳🇬</span>
                  <span className=\"font-medium text-gray-700\">+234</span>
                </div>
                <input 
                  type=\"tel\" 
                  placeholder=\"Phone Number\" 
                  className=\"w-full p-4 bg-transparent outline-none text-gray-900\"
                  value={loginPhone.replace('+234', '')}
                  onChange={e => setLoginPhone('+234' + e.target.value)}
                  required
                />
              </div>
              
              <div className=\"bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all\">
                <input 
                  type=\"text\" 
                  placeholder=\"Full Name\" 
                  className=\"w-full p-4 bg-transparent outline-none text-gray-900\"
                  value={loginName}
                  onChange={e => setLoginName(e.target.value)}
                  required
                />
              </div>

              <div className=\"bg-slate-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 transition-all\">
                <input 
                  type=\"password\" 
                  placeholder=\"4-Digit PIN (Test)\" 
                  className=\"w-full p-4 bg-transparent outline-none text-gray-900\"
                  maxLength={4}
                  value={loginPin}
                  onChange={e => setLoginPin(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type=\"submit\" 
                className=\"w-full py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg\"
              >
                Continue
              </button>
            </form>
            
            <div className=\"mt-8 text-center\">
              <p className=\"text-sm text-gray-500\">
                Already have an account? <a href=\"#\" className=\"text-blue-900 font-bold hover:underline\">Login</a>
              </p>
            </div>
          </div>
        )}'''
content = content.replace(login_step, '')

open('src/components/PatientApp.tsx', 'w').write(content)
print('Done!')
