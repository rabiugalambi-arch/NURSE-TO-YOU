import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Replace handleUseCurrentLocation alert
content = content.replace(
    '''        if (error.code === error.PERMISSION_DENIED) { 
          msg = 'Location permission is required to find nearby providers. Please retry.';
        }
        alert(msg);''',
    '''        alert("Your location could not be detected. You can still view and book available providers across Kano State.");'''
)

# Replace findProviders searchLocation geocoding logic
find_providers_old = '''    if (!searchLocation && address) {
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
    }'''

find_providers_new = '''    if (!searchLocation && address && address !== 'Location detected ✓') {
      setLocating(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          searchLocation = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          setLocation(searchLocation);
        }
      } catch (e) {
        console.warn("PatientApp findProviders Nominatim error:", e);
      }
      setLocating(false);
    }'''
content = content.replace(find_providers_old, find_providers_new)


# Replace distanceKm type and calculation
distance_old = '''        let distanceKm = 9999;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }'''

distance_new = '''        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }'''
content = content.replace(distance_old, distance_new)

# Replace sort logic
sort_old = '''      matched.sort((a, b) => {
        if (Math.abs(a.distanceKm - b.distanceKm) < 1) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.distanceKm - b.distanceKm;
      });'''

sort_new = '''      matched.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        
        if (Math.abs(a.distanceKm - b.distanceKm) < 1) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.distanceKm - b.distanceKm;
      });'''
content = content.replace(sort_old, sort_new)

# Replace matched array type
matched_old = '''const matched: (Provider & { distanceKm: number })[] = [];'''
matched_new = '''const matched: (Provider & { distanceKm: number | null })[] = [];'''
content = content.replace(matched_old, matched_new)

# Render logic
render_old = '''<span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-gray-400"/> {p.distanceKm.toFixed(1)}km away</span>'''
render_new = '''{p.distanceKm !== null ? (
                              <span className="flex items-center gap-1"><Navigation className="w-4 h-4 text-gray-400"/> {p.distanceKm.toFixed(1)}km away</span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs"><Navigation className="w-4 h-4 text-gray-400 shrink-0"/> Location distance unavailable</span>
                            )}'''
content = content.replace(render_old, render_new)

# Let's check physician search too!
physician_search_old = '''                        // Load physicians
                        const providersRef = collection(db, 'providers');
                        const q = query(
                          providersRef,
                          where('type', '==', 'physician'),
                          where('specialty', '==', specialty.name),
                          where('available', '==', true)
                        );
                        const snap = await getDocs(q);
                        const matched: (Provider & { distanceKm: number })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          matched.push({ ...p, id: doc.id, distanceKm: 0 });
                        });
                        setProviders(matched);'''

physician_search_new = '''                        // Load physicians
                        const providersRef = collection(db, 'providers');
                        const q = query(
                          providersRef,
                          where('type', '==', 'physician'),
                          where('specialty', '==', specialty.name),
                          where('available', '==', true)
                        );
                        const snap = await getDocs(q);
                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          matched.push({ ...p, id: doc.id, distanceKm: null });
                        });
                        setProviders(matched);'''
content = content.replace(physician_search_old, physician_search_new)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

