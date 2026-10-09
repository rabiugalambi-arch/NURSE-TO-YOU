import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

old_toggle = '''  const toggleAvailability = async () => {
    if (!providerData) return;
    const newStatus = !providerData.available;
    
    try {
      if (newStatus) {
        // Provider is turning ON availability - fetch location first
        setIsUpdatingLocation(true);
        setLocationStatus({ message: 'Detecting location...', type: 'info' });
        
        if (!navigator.geolocation) {
          // Fallback if no geolocation support
          await updateDoc(doc(db, 'providers', providerId), { available: true });
          setLocationStatus({ message: 'Geolocation not supported, but you are now available.', type: 'warning' });
          setIsUpdatingLocation(false);
          setTimeout(() => setLocationStatus(null), 3000);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              await updateDoc(doc(db, 'providers', providerId), {
                available: true,
                latitude,
                longitude,
                locationAccuracy: accuracy,
                lastLocationUpdate: Date.now()
              });
              setLocationStatus({ message: 'Location detected ✓', type: 'success' });
              setTimeout(() => setLocationStatus(null), 3000);
            } catch (e: any) {
              setLocationStatus({ message: 'Error updating location', type: 'error' });
              console.warn(e?.message || e);
            } finally {
              setIsUpdatingLocation(false);
            }
          },
          (error) => {
            let msg = 'Unable to detect location. You are now available without GPS.';
            if (error.code === error.PERMISSION_DENIED) { 
              msg = 'Location permission denied. You are now available without GPS.';
            }
            updateDoc(doc(db, 'providers', providerId), { available: true }).then(() => {
              setLocationStatus({ message: msg, type: 'warning' });
              setIsUpdatingLocation(false);
              setTimeout(() => setLocationStatus(null), 5000);
            }).catch(() => {
              setLocationStatus({ message: 'Error updating status', type: 'error' });
              setIsUpdatingLocation(false);
            });
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {'''

new_toggle = '''  const toggleAvailability = async () => {
    if (!providerData) return;
    const newStatus = !providerData.available;
    
    try {
      if (newStatus) {
        // Provider is turning ON availability - fetch location first
        setIsUpdatingLocation(true);
        setLocationStatus({ message: 'Detecting location...', type: 'info' });
        console.log("[Provider GPS] Toggling availability, requesting location permission...");
        
        if (!navigator.geolocation) {
          // Fallback if no geolocation support
          console.warn("[Provider GPS] Geolocation not supported. Setting available anyway.");
          await updateDoc(doc(db, 'providers', providerId), { available: true, locationEnabled: false });
          setLocationStatus({ message: 'Geolocation not supported, but you are now available.', type: 'warning' });
          setIsUpdatingLocation(false);
          setTimeout(() => setLocationStatus(null), 3000);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude, accuracy } = position.coords;
              console.log(`[Provider GPS] Toggle Success: lat=${latitude}, lng=${longitude}, acc=${accuracy}`);
              await updateDoc(doc(db, 'providers', providerId), {
                available: true,
                latitude,
                longitude,
                locationAccuracy: accuracy,
                locationUpdatedAt: Date.now(),
                lastLocationUpdate: Date.now(),
                locationEnabled: true
              });
              setLocationStatus({ message: 'Location detected ✓', type: 'success' });
              setTimeout(() => setLocationStatus(null), 3000);
            } catch (e: any) {
              console.error("[Provider GPS] Toggle Error updating Firestore:", e?.message || e);
              setLocationStatus({ message: 'Error updating location', type: 'error' });
            } finally {
              setIsUpdatingLocation(false);
            }
          },
          (error) => {
            let msg = 'Unable to detect location. You are now available without GPS.';
            if (error.code === error.PERMISSION_DENIED) { 
              msg = 'Location permission denied. You are now available without GPS.';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              msg = 'Location services unavailable. You are now available without GPS.';
            } else if (error.code === error.TIMEOUT) {
              msg = 'Location request timed out. You are now available without GPS.';
            }
            console.warn("[Provider GPS] Toggle Error:", msg, error);
            
            updateDoc(doc(db, 'providers', providerId), { available: true, locationEnabled: false }).then(() => {
              setLocationStatus({ message: msg, type: 'warning' });
              setIsUpdatingLocation(false);
              setTimeout(() => setLocationStatus(null), 5000);
            }).catch((err) => {
              console.error("[Provider GPS] Fallback update failed:", err);
              setLocationStatus({ message: 'Error updating status', type: 'error' });
              setIsUpdatingLocation(false);
            });
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {'''

content = content.replace(old_toggle, new_toggle)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)

