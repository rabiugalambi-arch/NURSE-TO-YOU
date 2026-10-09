import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

# Replace updateLocation function
old_update_location = '''  const updateLocation = () => {
    setIsUpdatingLocation(true);
    setLocationStatus({ message: 'Detecting location...', type: 'info' });
    
    if (!navigator.geolocation) {
      setLocationStatus({ message: 'Geolocation is not supported by your browser', type: 'error' });
      setIsUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          await updateDoc(doc(db, 'providers', providerId), {
            latitude,
            longitude,
            locationAccuracy: accuracy,
            lastLocationUpdate: Date.now()
          });
          setLocationStatus({ message: 'Location detected ✓', type: 'success' });
          setTimeout(() => setLocationStatus(null), 3000);
        } catch (error: any) {
          console.warn("Error updating location", error?.message || error);
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
    );
  };'''

new_update_location = '''  const updateLocation = () => {
    setIsUpdatingLocation(true);
    setLocationStatus({ message: 'Detecting location...', type: 'info' });
    console.log("[Provider GPS] Requesting location permission...");
    
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser';
      setLocationStatus({ message: msg, type: 'error' });
      console.warn("[Provider GPS]", msg);
      setIsUpdatingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`[Provider GPS] Success: lat=${latitude}, lng=${longitude}, acc=${accuracy}`);
          await updateDoc(doc(db, 'providers', providerId), {
            latitude,
            longitude,
            locationAccuracy: accuracy,
            locationUpdatedAt: Date.now(),
            lastLocationUpdate: Date.now(),
            locationEnabled: true
          });
          console.log("[Provider GPS] Firestore update successful.");
          setLocationStatus({ message: 'Location detected ✓', type: 'success' });
          setTimeout(() => setLocationStatus(null), 3000);
        } catch (error: any) {
          console.error("[Provider GPS] Error updating Firestore:", error?.message || error);
          setLocationStatus({ message: 'Unable to detect location. Please turn on device Location/GPS and try again.', type: 'error' });
        } finally {
          setIsUpdatingLocation(false);
        }
      },
      (error) => {
        let msg = 'Unable to detect location. Please check your network and GPS settings.';
        if (error.code === error.PERMISSION_DENIED) {
            msg = 'Location permission denied. Please allow location access in your browser/device settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Location services unavailable. Please turn on GPS.';
        } else if (error.code === error.TIMEOUT) {
            msg = 'Location request timed out. Please try again.';
        }
        console.warn("[Provider GPS] Error:", msg, error);
        setLocationStatus({ message: msg, type: 'error' });
        setIsUpdatingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };'''

content = content.replace(old_update_location, new_update_location)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)

