import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'No nearby available provider found. Please try again or contact support.',
    'No approved and available provider is currently available in Kano State.'
)

content = content.replace(
    '''                    {providers[0].distanceKm > 10 && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-orange-800 text-sm mb-4">
                        No provider is currently nearby, but these verified providers are available elsewhere in Kano State.
                      </div>
                    )}''',
    ''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
