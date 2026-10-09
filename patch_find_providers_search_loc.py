import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace("location.lat, location.lng,", "searchLocation.lat, searchLocation.lng,")
open('src/components/PatientApp.tsx', 'w').write(content)
