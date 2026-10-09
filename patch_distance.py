import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''        let distanceKm = 9999;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }''',
    '''        let distanceKm: number | null = null;
        
        if (searchLocation && searchLocation.lat && searchLocation.lng && p.latitude && p.longitude && !(p.latitude === 0 && p.longitude === 0)) { 
          distanceKm = calculateDistance(
            searchLocation.lat, searchLocation.lng,
            p.latitude, p.longitude
          );
        }'''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

