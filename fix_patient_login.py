import sys

content = open('src/components/PatientApp.tsx').read()
start_idx = content.find("{step === 'login' && (")
if start_idx != -1:
    end_idx = content.find("        )}", start_idx) + 10
    content = content[:start_idx] + content[end_idx:]

open('src/components/PatientApp.tsx', 'w').write(content)
print('Done!')
