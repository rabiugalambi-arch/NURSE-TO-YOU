import sys

content = open('src/components/PatientApp.tsx').read()
old_empty = """                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No verified and available provider is currently available within 10 km of your location.</h3>
                    <button 
                      onClick={() => setStep('home')}
                      className="mt-4 px-6 py-2 bg-blue-900 text-white rounded-full font-medium shadow-sm hover:bg-blue-800 transition-colors"
                    >
                      Retry
                    </button>"""

new_empty = """                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No suitable provider is currently available in your area.</h3>
                    <div className="flex flex-col gap-3 mt-4">
                      <button 
                        onClick={() => setStep('home')}
                        className="px-6 py-2 bg-blue-900 text-white rounded-full font-medium shadow-sm hover:bg-blue-800 transition-colors"
                      >
                        Try Another Time
                      </button>
                      <button 
                        onClick={() => setStep('location')}
                        className="px-6 py-2 bg-white text-blue-900 border border-blue-900 rounded-full font-medium shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Change Location
                      </button>
                    </div>"""

if old_empty in content:
    content = content.replace(old_empty, new_empty)
    print("Patched empty state")
else:
    print("Could not find empty state text")

open('src/components/PatientApp.tsx', 'w').write(content)
