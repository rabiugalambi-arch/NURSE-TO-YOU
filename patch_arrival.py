import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''<span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400"/> {p.estimatedArrival}m arrival</span>''',
    '''<span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400"/> {p.distanceKm !== null ? Math.round(p.distanceKm * 5) : 30}m arrival</span>'''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)

