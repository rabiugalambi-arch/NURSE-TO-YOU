import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

replacement = '''        if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano')) {
           return;
        }'''

content = re.sub(
    r'        if \(p\.serviceArea && !p\.serviceArea\.toLowerCase\(\)\.includes\(\'kano\'\) && !p\.serviceArea\.toLowerCase\(\)\.includes\(\'nigeria\'\)\) \{\n\s*// Reject if they clearly belong somewhere else\. But wait, if they didn\'t write Kano, we might accidentally block test accounts\.\n\s*// Let\'s just strictly allow them if they are approved and available\. The app is a Kano app\.\n\s*\}',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
