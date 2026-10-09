import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# 1. Update finding nurses
old_nurse_find = '''      const snap = await getDocs(q);
      const matched: (Provider & { distanceKm: number | null })[] = [];
      
      snap.forEach(doc => {
        const p = doc.data() as Provider;
        if (p.serviceArea && !p.serviceArea.toLowerCase().includes("kano")) { 
           return;
        }

        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
          console.log(`[Client GPS] Distance to ${p.fullName || p.name}: ${distanceKm.toFixed(2)} km`);
        } else if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          console.log(`[Client GPS] Provider ${p.fullName || p.name || doc.id} has no valid GPS coordinates, showing without distance.`);
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }
      });'''

new_nurse_find = '''      const snap = await getDocs(q);
      const matched: (Provider & { distanceKm: number | null })[] = [];
      
      snap.forEach(doc => {
        const p = doc.data() as Provider;
        
        // Remove strict city-name spelling checks, use radius instead
        // if (p.serviceArea && !p.serviceArea.toLowerCase().includes("kano")) { 
        //    return;
        // }

        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
          console.log(`[Client GPS] Distance to ${p.fullName || p.name}: ${distanceKm.toFixed(2)} km`);
          
          // Only show providers within 50km radius (approximate size of Kano State coverage)
          if (distanceKm > 50) {
            console.log(`[Client GPS] Ignoring ${p.fullName || p.name} - too far (${distanceKm.toFixed(2)} km)`);
            return;
          }
        } else if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          console.log(`[Client GPS] Provider ${p.fullName || p.name || doc.id} has no valid GPS coordinates, showing without distance.`);
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }
      });'''

content = content.replace(old_nurse_find, new_nurse_find)

# 2. Update finding physicians
old_phys_find = '''                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          
                          if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) return;
                          
                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                          }
                          
                          matched.push({ ...p, id: doc.id, distanceKm });
                        });'''

new_phys_find = '''                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          
                          // Remove strict city-name spelling checks, use radius instead
                          // if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) return;
                          
                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                             
                             // Only show providers within 50km radius
                             if (distanceKm > 50) {
                               console.log(`[Client GPS] Ignoring ${p.fullName || p.name} - too far (${distanceKm.toFixed(2)} km)`);
                               return;
                             }
                          }
                          
                          matched.push({ ...p, id: doc.id, distanceKm });
                        });'''

content = content.replace(old_phys_find, new_phys_find)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

