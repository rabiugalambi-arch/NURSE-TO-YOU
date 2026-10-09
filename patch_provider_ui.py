import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

old_ui = '''                  <button
                    onClick={updateLocation}
                    disabled={isUpdatingLocation}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
                      isUpdatingLocation 
                        ? "bg-gray-200 text-gray-500" 
                        : "bg-blue-900 text-white hover:bg-blue-800 active:scale-95"
                    )}
                  >
                    <LocateFixed className={cn("w-3.5 h-3.5", isUpdatingLocation && "animate-pulse")} />
                    {isUpdatingLocation ? 'Syncing...' : 'Sync GPS'}
                  </button>
                </div>
                
                <div className="mt-2 text-sm font-medium text-blue-900">
                  {providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> GPS: Active ✓</div>
                      <div className="text-xs text-gray-500 font-normal">Location updated: {new Date(providerData.lastLocationUpdate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                      {providerData.locationAccuracy && <div className="text-xs text-gray-500 font-normal">Accuracy: approximately {Math.round(providerData.locationAccuracy)} meters</div>}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location not set</div>
                  )}
                </div>'''

new_ui = '''                  <button
                    onClick={updateLocation}
                    disabled={isUpdatingLocation}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm",
                      isUpdatingLocation 
                        ? "bg-gray-200 text-gray-500" 
                        : "bg-blue-900 text-white hover:bg-blue-800 active:scale-95"
                    )}
                  >
                    <LocateFixed className={cn("w-3.5 h-3.5", isUpdatingLocation && "animate-pulse")} />
                    {isUpdatingLocation ? 'Locating...' : 'Enable Location'}
                  </button>
                </div>
                
                <div className="mt-2 text-sm font-medium text-blue-900">
                  {providerData?.locationEnabled || providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> Location: Active</div>
                      {providerData.locationUpdatedAt && <div className="text-xs text-gray-500 font-normal">Last updated: {new Date(providerData.locationUpdatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location: Not available</div>
                  )}
                </div>'''

content = content.replace(old_ui, new_ui)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)

