import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_inline = '''                  {!location && (
                    <button type="button" onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((pos) => setLocation({lat: pos.coords.latitude, lng: pos.coords.longitude}));
                        }
                    }} className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Get Current Location
                    </button>
                  )}'''

new_inline = '''                  {!location && (
                    <button type="button" onClick={handleUseCurrentLocation} disabled={locating} className="text-blue-600 text-xs font-bold mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {locating ? 'Locating...' : 'Get Current Location'}
                    </button>
                  )}'''

content = content.replace(old_inline, new_inline)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

