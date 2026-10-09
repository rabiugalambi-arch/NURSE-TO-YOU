import sys

content = open('src/components/PatientApp.tsx').read()
old = "if (distanceKm <= (p.serviceArea || 50000) && p.verified && !p.isBusy && hasRecentLocation) {"
new = "if (distanceKm <= (p.serviceArea || 50000) && p.verified && p.applicationStatus === 'approved' && !p.isBusy && hasRecentLocation) {"

content = content.replace(old, new)
open('src/components/PatientApp.tsx', 'w').write(content)
print("Patched PatientApp.tsx")
