import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''                          matched.push({ ...p, id: doc.id, distanceKm: 0 });''',
    '''                          matched.push({ ...p, id: doc.id, distanceKm: null });'''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

