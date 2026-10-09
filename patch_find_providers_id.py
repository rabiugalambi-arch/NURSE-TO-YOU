import sys
content = open('src/components/PatientApp.tsx').read()
content = content.replace("matched.push({ ...p, distanceKm });", "matched.push({ ...p, id: doc.id, distanceKm });")
open('src/components/PatientApp.tsx', 'w').write(content)
