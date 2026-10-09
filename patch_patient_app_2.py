import sys

content = open('src/components/PatientApp.tsx').read()

old_block = """              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No suitable provider is currently available in your area.</h3>
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
                    </div>
                  </div>
                ) : (
                  providers.map(p => (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative">"""

new_block = """              <div className="space-y-4">
                {providers.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center border border-gray-100 shadow-sm mt-8">
                    <ActivitySquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 leading-tight mb-2">No provider is currently available in Kano State.</h3>
                    <div className="flex flex-col gap-3 mt-4">
                      <button 
                        onClick={() => setStep('home')}
                        className="px-6 py-2 bg-blue-900 text-white rounded-full font-medium shadow-sm hover:bg-blue-800 transition-colors"
                      >
                        Try Another Time
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {providers[0].distanceKm > 10 && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-orange-800 text-sm mb-4">
                        No provider is currently nearby, but these verified providers are available elsewhere in Kano State.
                      </div>
                    )}
                    {providers.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm relative">"""

content = content.replace(old_block, new_block)

open('src/components/PatientApp.tsx', 'w').write(content)
