import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Add a check for valid location
replacement = '''      snap.forEach(doc => {
        const p = doc.data() as Provider;
        
        // Ensure provider has a valid location
        if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {
          return;
        }
        
        const distanceKm = calculateDistance('''

content = re.sub(
    r'      snap\.forEach\(doc => \{\n\s*const p = doc\.data\(\) as Provider;\n\s*const distanceKm = calculateDistance\(',
    replacement,
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
