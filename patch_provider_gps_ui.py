import sys

content = open('src/components/ProviderApp.tsx').read()

old_ui = """                <p className="text-xs text-gray-500 font-medium">
                  {providerData?.lastLocationUpdate ? (
                    <>Synced at {new Date(providerData.lastLocationUpdate).toLocaleTimeString()}</>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3"/> Location sync required</span>
                  )}
                </p>"""

new_ui = """                <div className="mt-2 text-sm font-medium text-blue-900">
                  {providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> GPS: Active ✓</div>
                      <div className="text-xs text-gray-500 font-normal">Location updated: {new Date(providerData.lastLocationUpdate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                      {providerData.locationAccuracy && <div className="text-xs text-gray-500 font-normal">Accuracy: approximately {Math.round(providerData.locationAccuracy)} meters</div>}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-4 h-4"/> GPS: Not detected</div>
                  )}
                </div>"""

if old_ui in content:
    content = content.replace(old_ui, new_ui)
    print("Updated GPS UI display")
else:
    print("WARNING: GPS UI display not found")

open('src/components/ProviderApp.tsx', 'w').write(content)
