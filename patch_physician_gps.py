import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_physician = '''                        const snap = await getDocs(q);
                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          matched.push({ ...p, id: doc.id, distanceKm: null });
                        });
                        setProviders(matched);'''

new_physician = '''                        const snap = await getDocs(q);
                        const matched: (Provider & { distanceKm: number | null })[] = [];
                        snap.forEach(doc => {
                          const p = doc.data() as Provider;
                          
                          if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) return;
                          
                          if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
                             console.log(`[Client GPS] Ignoring physician ${p.fullName || p.name || doc.id} due to no GPS.`);
                             return;
                          }
                          
                          let distanceKm: number | null = null;
                          if (location && location.lat && location.lng) {
                             distanceKm = calculateDistance(location.lat, location.lng, p.latitude, p.longitude);
                          }
                          
                          matched.push({ ...p, id: doc.id, distanceKm });
                        });
                        
                        matched.sort((a, b) => {
                          if (a.distanceKm === null) return 1;
                          if (b.distanceKm === null) return -1;
                          return a.distanceKm - b.distanceKm;
                        });
                        
                        setProviders(matched);'''

content = content.replace(old_physician, new_physician)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

