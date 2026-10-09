import sys
content = open('src/components/PatientApp.tsx').read()

old_filter = '''        if (distanceKm <= (p.serviceArea || 50000) && p.verified && !p.isBusy) {
          matched.push({ ...p, distanceKm });
        }'''

new_filter = '''        const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
        const hasRecentLocation = p.lastLocationUpdate ? (Date.now() - p.lastLocationUpdate) < TWO_HOURS_MS : false;
        
        if (distanceKm <= (p.serviceArea || 50000) && p.verified && !p.isBusy && hasRecentLocation) {
          matched.push({ ...p, distanceKm });
        }'''

content = content.replace(old_filter, new_filter)
open('src/components/PatientApp.tsx', 'w').write(content)
print("Updated GPS recent filter.")
