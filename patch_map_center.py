import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace("center={[11.9964, 8.5167]}", "center={location ? [location.lat, location.lng] : [11.9964, 8.5167]}")
open('src/components/PatientApp.tsx', 'w').write(content)
