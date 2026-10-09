import sys

content = open('src/components/ProviderApp.tsx').read()

old_mock_selection = '''        <div className=\"bg-white p-8 rounded-3xl shadow-xl w-full border border-gray-100 relative z-10\">
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
                    <User className=\"w-5 h-5 text-blue-900\"/>
                  </div>
                  <div>
                    <div className=\"font-bold text-gray-900\">{p.name}</div>
                    <div className=\"text-sm text-blue-600 font-medium\">{p.professionalRole}</div>
                  </div>
                </div>
                <Navigation className=\"w-5 h-5 text-gray-400\"/>
              </button>
            ))}
          </div>
        </div>'''
content = content.replace(old_mock_selection, '')

# Also remove the logout button since it's now handled in App.tsx
old_logout = '''        <button 
          onClick={() => setProviderId('')}
          className="p-2 text-blue-200 hover:text-white transition-colors bg-white/5 rounded-full"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>'''
content = content.replace(old_logout, '')

open('src/components/ProviderApp.tsx', 'w').write(content)
print('Done!')
