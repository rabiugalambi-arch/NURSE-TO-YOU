import sys

content = open('src/components/ProviderApp.tsx').read()

# Replace signature
content = content.replace('export function ProviderApp() {', 'export function ProviderApp({ providerId }: { providerId: string }) {')

# Remove providerId state
content = content.replace('  const [providerId, setProviderId] = useState<string>(\'\');\n', '')

# Remove manual provider selection
old_selection = '''  if (!providerId) {
    return (
      <div className=\"max-w-md mx-auto min-h-screen bg-blue-900 flex flex-col justify-center items-center p-6 sm:h-[850px] sm:my-10 sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in duration-500 relative\">
        <div className=\"bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100 relative z-10\">
          <div className=\"flex justify-center mb-6\">
            <div className=\"bg-blue-100 p-4 rounded-full shadow-inner\">
              <ActivitySquare className=\"w-10 h-10 text-blue-900\" />
            </div>
          </div>
          <h2 className=\"text-2xl font-bold text-center text-blue-900 mb-2\">Provider Portal</h2>
          <p className=\"text-center text-sm text-gray-500 mb-8\">Test Mode - Select a demo account</p>
          
          <div className=\"space-y-4\">
            {mockProvidersList.map(p => (
              <button
                key={p.id || p.providerId}
                onClick={() => setProviderId(p.id || p.providerId)}
                className=\"w-full text-left p-4 rounded-2xl border border-gray-200 hover:border-blue-900 focus:ring-2 focus:ring-blue-900 transition-all flex items-center justify-between shadow-sm bg-slate-50\"
              >
                <div className=\"flex items-center gap-3\">
                  <div className=\"w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100\">
                    <User size={20} className=\"text-blue-900\" />
                  </div>
                  <div>
                    <div className=\"font-bold text-gray-900\">{p.name}</div>
                    <div className=\"text-sm text-blue-600 font-medium\">{p.professionalRole}</div>
                  </div>
                </div>
                <Navigation size={20} className=\"text-gray-400\" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }'''
content = content.replace(old_selection, '')

# Handle missing provider data beautifully
old_data_check = '''  if (!providerData) {
    return <div className=\"flex h-screen items-center justify-center\">Loading...</div>;
  }'''
new_data_check = '''  if (!providerData) {
    return <div className=\"flex h-screen items-center justify-center bg-gray-50 text-gray-500\">Loading your provider profile...</div>;
  }
  if (!providerData.verified) {
    return (
      <div className=\"max-w-md mx-auto min-h-screen bg-orange-50 flex flex-col justify-center items-center p-6 sm:h-[850px] sm:my-10 sm:rounded-[2.5rem] shadow-2xl relative\">
        <AlertTriangle className=\"w-16 h-16 text-orange-500 mb-4\" />
        <h2 className=\"text-2xl font-bold text-center text-orange-900 mb-2\">Verification Pending</h2>
        <p className=\"text-center text-sm text-orange-700\">Your account is waiting for administrator approval. You cannot receive booking requests until your identity and credentials are verified.</p>
      </div>
    );
  }'''
content = content.replace(old_data_check, new_data_check)

open('src/components/ProviderApp.tsx', 'w').write(content)
print('Done!')
