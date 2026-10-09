import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# 1. Patch Nurse filtering (findProviders)
old_nurse = '''        // Ignore providers without valid GPS coordinates
        if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          console.log(`[Client GPS] Ignoring provider ${p.fullName || p.name || doc.id} because they have no valid GPS coordinates.`);
          return;
        }

        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
          console.log(`[Client GPS] Distance to ${p.fullName || p.name}: ${distanceKm.toFixed(2)} km`);
        }'''

new_nurse = '''        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
          console.log(`[Client GPS] Distance to ${p.fullName || p.name}: ${distanceKm.toFixed(2)} km`);
        } else if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          console.log(`[Client GPS] Provider ${p.fullName || p.name || doc.id} has no valid GPS coordinates, showing without distance.`);
        }'''

content = content.replace(old_nurse, new_nurse)

# 2. Patch Physician filtering
old_physician = '''                          if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
                             console.log(`[Client GPS] Ignoring physician ${p.fullName || p.name || doc.id} due to no GPS.`);
                             return;
                          }
                          
                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                          }'''

new_physician = '''                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                          }'''

content = content.replace(old_physician, new_physician)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

