import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_gps = '''  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation not supported by browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Location detected ✓');
        setLocating(false);
      },
      (error) => {
        console.warn("Geolocation warning:", error?.message || error?.code);
        let msg = 'Unable to detect location. Please retry.';
        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission is required to find nearby providers. Please retry.';
        }
        alert(msg);
        setLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };'''

new_gps = '''  const handleUseCurrentLocation = () => {
    setLocating(true);
    console.log("[Client GPS] Requesting location...");
    if (!navigator.geolocation) {
      alert('Geolocation not supported by your browser.');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(`[Client GPS] Success: lat=${position.coords.latitude}, lng=${position.coords.longitude}`);
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Location detected ✓');
        setLocating(false);
      },
      (error) => {
        console.warn("[Client GPS] Geolocation warning:", error?.message || error?.code);
        let msg = 'Unable to detect location. Please check your network and GPS settings.';
        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission denied. Please allow location access in your device settings to find nearby providers.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
           msg = 'Location services unavailable. Please turn on GPS.';
        } else if (error.code === error.TIMEOUT) {
           msg = 'Location request timed out. Please try again.';
        }
        alert(msg);
        setLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };'''

content = content.replace(old_gps, new_gps)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

