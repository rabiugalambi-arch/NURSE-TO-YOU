import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace(
    "const [bookingNumber, setBookingNumber] = useState('');",
    "const [bookingNumber, setBookingNumber] = useState('');\n  const [isBooking, setIsBooking] = useState(false);"
)

# Update confirmBooking
replacement = '''  const confirmBooking = async () => {
    if (isBooking) return;
    if (!selectedProvider || !selectedService || !patientId) {
      alert("Missing booking information.");
      return;
    }
    if (!location) {
      alert("Precise GPS location is required to confirm the booking.");
      return;
    }
    
    setIsBooking(true);
    try {'''

content = re.sub(
    r'  const confirmBooking = async \(\) => \{\n\s*if \(!selectedProvider \|\| !selectedService \|\| !patientId\) \{\n\s*alert\("Missing booking information\."\);\n\s*return;\n\s*\}\n\s*if \(!location\) \{\n\s*alert\("Precise GPS location is required to confirm the booking\."\);\n\s*return;\n\s*\}\n\s*try \{',
    replacement,
    content
)

# Update catch block to reset isBooking
content = re.sub(
    r'      alert\(err\.message \|\| "Failed to create booking\. The provider may have just been booked by someone else\."\);\n\s*\}\n\s*\};',
    '''      alert(err.message || "Failed to create booking. The provider may have just been booked by someone else.");
    } finally {
      setIsBooking(false);
    }
  };''',
    content
)

# Update button
content = re.sub(
    r'<button \n\s*onClick=\{confirmBooking\}\n\s*className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"\n\s*>',
    '''<button 
                onClick={confirmBooking}
                disabled={isBooking}
                className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >''',
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
