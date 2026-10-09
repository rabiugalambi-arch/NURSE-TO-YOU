import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Fix confirmBooking silent failure
content = re.sub(
    r'if \(!selectedProvider \|\| !selectedService \|\| !location \|\| !patientId\) return;',
    '''if (!selectedProvider || !selectedService || !patientId) {
      alert("Missing booking information.");
      return;
    }
    if (!location) {
      alert("Precise GPS location is required to confirm the booking.");
      return;
    }''',
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
