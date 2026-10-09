import sys

content = open('src/components/PatientApp.tsx').read()

old_block = """  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      setAddress('Geolocation not supported by browser');
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
           msg = 'Location permission was not granted.';
        }
        alert(msg);
        setLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };"""

new_block = """  const handleUseCurrentLocation = () => {
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
           msg = 'Location permission is required to find nearby providers.';
        }
        alert(msg);
        setLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };"""

content = content.replace(old_block, new_block)
open('src/components/PatientApp.tsx', 'w').write(content)
