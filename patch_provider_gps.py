import sys

content = open('src/components/ProviderApp.tsx').read()

# Update location update to include accuracy
old_update = """    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await updateDoc(doc(db, 'providers', providerId), {
            latitude,
            longitude,
            lastLocationUpdate: Date.now()
          });
          setLocationStatus({ message: 'Location updated successfully', type: 'success' });
          setTimeout(() => setLocationStatus(null), 3000);
        } catch (error: any) {
          console.error("Error updating location", error?.message || error);
          setLocationStatus({ message: 'Failed to update location', type: 'error' });
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (error) => {
        let msg = 'Unable to retrieve location';
        if (error.code === error.PERMISSION_DENIED) msg = 'Location permission denied';
        setLocationStatus({ message: msg, type: 'error' });
        setIsUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );"""

new_update = """    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          await updateDoc(doc(db, 'providers', providerId), {
            latitude,
            longitude,
            locationAccuracy: accuracy,
            lastLocationUpdate: Date.now()
          });
          setLocationStatus({ message: 'GPS Synced', type: 'success' });
          setTimeout(() => setLocationStatus(null), 3000);
        } catch (error: any) {
          console.error("Error updating location", error?.message || error);
          setLocationStatus({ message: 'Unable to detect location. Please turn on device Location/GPS and try again.', type: 'error' });
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (error) => {
        let msg = 'Unable to detect location. Please turn on device Location/GPS and try again.';
        if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission required.';
        }
        setLocationStatus({ message: msg, type: 'error' });
        setIsUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );"""

if old_update in content:
    content = content.replace(old_update, new_update)
    print("Updated manual GPS sync logic")
else:
    print("WARNING: Manual GPS sync logic not found")

# Update auto-update to include accuracy
old_auto_update = """                await updateDoc(doc(db, 'providers', providerId), {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  lastLocationUpdate: Date.now()
                });"""

new_auto_update = """                await updateDoc(doc(db, 'providers', providerId), {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  locationAccuracy: position.coords.accuracy,
                  lastLocationUpdate: Date.now()
                });"""

if old_auto_update in content:
    content = content.replace(old_auto_update, new_auto_update)
    print("Updated auto GPS sync logic")
else:
    print("WARNING: Auto GPS sync logic not found")

# Update UI to match the exact requirement
old_ui = """                <p className="text-sm font-medium text-blue-900 mt-2 flex items-center gap-1.5">
                  <LocateFixed className="w-4 h-4 text-blue-600"/>
                  {providerData?.lastLocationUpdate ? (
                    <>Synced at {new Date(providerData.lastLocationUpdate).toLocaleTimeString()}</>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-3 h-3"/> Location sync required</span>
                  )}
                </p>"""

new_ui = """                <div className="mt-2 text-sm font-medium text-blue-900">
                  {providerData?.lastLocationUpdate ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1"><Check className="w-4 h-4 text-teal-600"/> GPS: Active ✓</div>
                      <div className="text-xs text-gray-500">Location updated: {new Date(providerData.lastLocationUpdate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                      {providerData.locationAccuracy && <div className="text-xs text-gray-500">Accuracy: approximately {Math.round(providerData.locationAccuracy)} meters</div>}
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
