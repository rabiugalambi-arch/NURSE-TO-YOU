import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

replacement = '''        if (p.serviceArea && !p.serviceArea.toLowerCase().includes('kano') && !p.serviceArea.toLowerCase().includes('nigeria')) {
           // Reject if they clearly belong somewhere else. But wait, if they didn't write Kano, we might accidentally block test accounts.
           // Let's just strictly allow them if they are approved and available. The app is a Kano app.
        }'''

content = re.sub(
    r'        // Kano state filter: since all our providers are operating in Kano.*?// return; // We won\'t block if serviceArea doesn\'t explicitly say Kano to avoid breaking existing testing accounts, but let\'s check it loosely if it exists\.\n\s*\}',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
