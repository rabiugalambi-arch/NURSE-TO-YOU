import sys

content = open('src/components/ProviderApp.tsx').read()

old_block = """  const toggleAvailability = async () => {
    if (!providerData) return;
    try {
      await updateDoc(doc(db, 'providers', providerId), {
        available: !providerData.available
      });
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };"""

new_block = """  const toggleAvailability = async () => {
    if (!providerData) return;
    const newStatus = !providerData.available;
    
    try {
      if (newStatus) {
        // Provider is turning ON availability - fetch location first
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
              console.error(e?.message || e);
            } finally {
              setIsUpdatingLocation(false);
            }
          },
          (error) => {
            let msg = 'Unable to detect location. Please retry.';
            if (error.code === error.PERMISSION_DENIED) {
               msg = 'Location permission is required to turn on Duty Status.';
            }
            setLocationStatus({ message: msg, type: 'error' });
            setIsUpdatingLocation(false);
            alert(msg);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        // Turning OFF availability
        await updateDoc(doc(db, 'providers', providerId), {
          available: false
        });
      }
    } catch (e: any) {
      console.error(e?.message || e);
    }
  };"""

content = content.replace(old_block, new_block)
open('src/components/ProviderApp.tsx', 'w').write(content)
