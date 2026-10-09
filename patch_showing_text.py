import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace(
    '<MapPin className="w-4 h-4"/> Showing qualified providers nearby in Kano',
    '<MapPin className="w-4 h-4"/> Showing verified and available providers within 10 km'
)

# Add Availability and Service to the provider card
old_role = '<p className="text-gray-600 text-sm mb-2">{p.professionalRole}</p>'
new_role = """<p className="text-gray-600 text-sm mb-1">{p.professionalRole} • {selectedService?.name}</p>
                          <p className="text-teal-600 text-xs font-bold mb-2">Available</p>"""
content = content.replace(old_role, new_role)

open('src/components/PatientApp.tsx', 'w').write(content)
