import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace(
    '<h3 className="font-bold text-gray-900 leading-tight mb-2">No verified and available provider is currently available near your location.</h3>',
    '<h3 className="font-bold text-gray-900 leading-tight mb-2">No verified and available provider is currently available within 10 km of your location.</h3>'
)
open('src/components/PatientApp.tsx', 'w').write(content)
print("Patched empty state text")
