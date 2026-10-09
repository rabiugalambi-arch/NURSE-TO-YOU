import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

# Replace button text
content = content.replace(
    "{isUpdatingLocation ? 'Syncing...' : 'Sync GPS'}",
    "{isUpdatingLocation ? 'Locating...' : 'Enable Location'}"
)

# Replace GPS status text
content = content.replace(
    '''{providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> GPS: Active ✓</div>
                      <div className="text-xs text-gray-500 font-normal">Location updated: {new Date(providerData.lastLocationUpdate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                      {providerData.locationAccuracy && <div className="text-xs text-gray-500 font-normal">Accuracy: approximately {Math.round(providerData.locationAccuracy)} meters</div>}
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location not set</div>
                  )}''',
    '''{providerData?.locationEnabled || providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-teal-600"><Check className="w-4 h-4"/> Location: Active</div>
                      <div className="text-xs text-gray-500 font-normal">Last updated: {new Date(providerData.locationUpdatedAt || providerData.lastLocationUpdate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                  ) : (
                    <div className="text-gray-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Location: Not available</div>
                  )}'''
)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)

