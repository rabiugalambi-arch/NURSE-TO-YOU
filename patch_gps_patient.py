import sys

content = open('src/components/PatientApp.tsx').read()
old_func = """  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setAddress('Kano, Nigeria (Fallback)');
      setLocation({ lat: 11.9964, lng: 8.5167 });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Detected GPS Location');
        setLocating(false);
      },
      (error) => {
        // Suppress console.error so AI Studio doesn't flag it as an app crash
        console.warn("Geolocation warning:", error?.message || error?.code);
        setLocation({ lat: 11.9964, lng: 8.5167 }); // Fallback to Kano
        setAddress('Kano, Nigeria (Fallback)');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };"""

new_func = """  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setAddress('Geolocation not supported by browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setAddress('Location detected');
        setLocating(false);
      },
      (error) => {
        console.warn("Geolocation warning:", error?.message || error?.code);
        let msg = 'Unable to detect location. Please retry.';
        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Please enable location permission.';
        }
        setAddress(msg);
        setLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Updated handleUseCurrentLocation")
else:
    print("WARNING: handleUseCurrentLocation not found or different")

open('src/components/PatientApp.tsx', 'w').write(content)
