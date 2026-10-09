import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace("msg = 'Please enable location permission.';", "msg = 'Location permission was not granted.';")
open('src/components/PatientApp.tsx', 'w').write(content)
