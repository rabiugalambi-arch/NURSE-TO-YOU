import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'\s*updatedAt: serverTimestamp\(\),\n\s*paymentReference: \'TXN_\' \+ Date\.now\(\) \+ Math\.floor\(Math\.random\(\)\*1000\)',
    '\n            updatedAt: serverTimestamp()',
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
