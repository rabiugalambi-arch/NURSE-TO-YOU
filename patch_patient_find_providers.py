import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_find = '''        if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) { 
          return;
        }

        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }
      });
      
      matched.sort((a, b) => {
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

new_find = '''        if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) { 
          return;
        }

        // Ignore providers without valid GPS coordinates
        if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          console.log(`[Client GPS] Ignoring provider ${p.fullName} because they have no valid GPS coordinates.`);
          return;
        }

        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
          console.log(`[Client GPS] Distance to ${p.fullName}: ${distanceKm.toFixed(2)} km`);
        }
        
        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }
      });
      
      matched.sort((a, b) => {
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

content = content.replace(old_find, new_find)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

