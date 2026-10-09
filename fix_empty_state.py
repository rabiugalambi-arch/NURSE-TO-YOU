import sys
content = open('src/components/PatientApp.tsx').read()

old_state = '''                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900">No Providers Found</h3>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your location or selecting a different service.</p>
                  </div>
                ) : ('''

new_state = '''                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No verified and available provider is currently available near your location.</h3>
                    <button 
                      onClick={() => setStep('home')}
                      className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-full font-medium shadow-sm hover:bg-blue-800 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                ) : ('''

if "No verified and available provider" not in content:
    content = content.replace(old_state, new_state)
    open('src/components/PatientApp.tsx', 'w').write(content)
    print("Replaced empty state.")
else:
    print("Already updated.")
