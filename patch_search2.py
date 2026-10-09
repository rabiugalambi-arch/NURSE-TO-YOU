import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace("p.fullName || p.name", "p.name")

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
