import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# I will replace the location access directly
content = re.sub(
    r'const distanceKm = calculateDistance\(\s*location\.lat,\s*location\.lng,\s*pData\.latitude,\s*pData\.longitude\s*\);',
    r'''let distanceKm = null;
        if (location && location.lat && location.lng && pData.latitude && pData.longitude) {
          distanceKm = calculateDistance(
            location.lat, location.lng,
            pData.latitude, pData.longitude
          );
        }''',
    content
)

content = re.sub(
    r'patientLatitude:\s*location\.lat,\s*patientLongitude:\s*location\.lng,',
    r'''patientLatitude: location ? location.lat : null,
          patientLongitude: location ? location.lng : null,
          patientAddress: address || null,''',
    content
)

content = re.sub(
    r'estimatedArrival:\s*Math\.round\(distanceKm \* 5\)',
    r'''estimatedArrival: distanceKm !== null ? Math.round(distanceKm * 5) : 30''',
    content
)


with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
