import sys
content = open('src/components/PatientApp.tsx').read()
content = content.replace("if (!pData.services.includes(selectedService.name)) {", "if (!pData.services || !pData.services.includes(selectedService.name)) {")
open('src/components/PatientApp.tsx', 'w').write(content)
