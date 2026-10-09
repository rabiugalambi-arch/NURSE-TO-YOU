import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_search = """        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }"""

new_search = """        if (!p.verified || p.applicationStatus !== 'approved') {
          console.log(`[Client] Ignoring ${p.fullName || p.name} - unverified`);
          return;
        }

        if (!p.isBusy) {
          matched.push({ ...p, id: doc.id, distanceKm });
        }"""

content = content.replace(old_search, new_search)

old_physician_search = """                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                             
                             // Only show providers within 50km radius
                             if (distanceKm > 50) {
                               console.log(`[Client GPS] Ignoring ${p.fullName || p.name} - too far (${distanceKm.toFixed(2)} km)`);
                               return;
                             }
                          }
                          
                          matched.push({ ...p, id: doc.id, distanceKm });"""

new_physician_search = """                          if (location && location.lat && location.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                             
                             // Only show providers within 50km radius
                             if (distanceKm > 50) {
                               console.log(`[Client GPS] Ignoring ${p.fullName || p.name} - too far (${distanceKm.toFixed(2)} km)`);
                               return;
                             }
                          }
                          
                          if (!p.verified || p.applicationStatus !== 'approved') {
                            console.log(`[Client] Ignoring ${p.fullName || p.name} - unverified`);
                            return;
                          }
                          
                          if (!p.isBusy) {
                            matched.push({ ...p, id: doc.id, distanceKm });
                          }"""
                          
content = content.replace(old_physician_search, new_physician_search)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
