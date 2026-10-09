import sys

content = open('src/components/PatientApp.tsx').read()
old_str = """        const distanceKm = calculateDistance(
          searchLocation.lat, searchLocation.lng,
          pData.latitude, pData.longitude
        );"""

new_str = """        const distanceKm = calculateDistance(
          location.lat, location.lng,
          pData.latitude, pData.longitude
        );"""

if old_str in content:
    content = content.replace(old_str, new_str)
    print("Patched calculateDistance in confirmBooking")
else:
    print("Could not find calculateDistance in confirmBooking")

open('src/components/PatientApp.tsx', 'w').write(content)
