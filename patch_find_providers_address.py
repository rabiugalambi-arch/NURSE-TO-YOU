import sys

content = open('src/components/PatientApp.tsx').read()
old_find = """  const findProviders = async () => {
    if (!selectedService || !location) return;
    setStep('matching');"""

new_find = """  const findProviders = async () => {
    if (!selectedService) return;
    
    let searchLocation = location;
    
    if (!searchLocation && address) {
      setLocating(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          searchLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setLocation(searchLocation);
        } else {
          alert("Could not find coordinates for this address. Please try another address or use GPS.");
          setLocating(false);
          return;
        }
      } catch (e) {
        alert("Error finding address location.");
        setLocating(false);
        return;
      }
      setLocating(false);
    }
    
    if (!searchLocation) return;
    
    setStep('matching');"""

if old_find in content:
    content = content.replace(old_find, new_find)
    print("Patched findProviders for address")
else:
    print("Could not find findProviders")

open('src/components/PatientApp.tsx', 'w').write(content)
