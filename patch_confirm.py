import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Remove GPS check
content = content.replace(
    '''    if (!location) {
      alert("Precise GPS location is required to confirm the booking.");
      return;
    }''',
    '''    // GPS check removed to allow booking anywhere in Kano State
    '''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

