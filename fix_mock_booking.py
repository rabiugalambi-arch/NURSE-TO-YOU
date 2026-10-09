import sys
content = open('src/components/PatientApp.tsx').read()
content = content.replace('mockBookingNumber', 'bookingNumber')
content = content.replace('setMockBookingNumber', 'setBookingNumber')
content = content.replace("setAddress('Kano, Nigeria (Mocked)');", "setAddress('Kano, Nigeria (Fallback)');")
content = content.replace("/* Hero Image Mock */", "/* Hero Image Placeholder */")
open('src/components/PatientApp.tsx', 'w').write(content)
print("Removed mock variable names.")
