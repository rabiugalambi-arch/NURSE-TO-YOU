import sys
content = open('src/components/ProviderApp.tsx').read()

old_mock = '''// Temporary mock providers for selection if no auth is fully implemented yet
const mockProvidersList = [
  { id: 'p1', providerId: 'p1', name: 'Nurse Amina Yusuf', professionalRole: 'RN' },
  { id: 'p2', providerId: 'p2', name: 'Nurse Ibrahim Musa', professionalRole: 'LPN' },
  { id: 'p3', providerId: 'p3', name: 'Nurse Fatima Bello', professionalRole: 'NP' },
  { id: 'p4', providerId: 'p4', name: 'Nurse Chidi Okeke', professionalRole: 'RN' },
];'''

content = content.replace(old_mock, "")
open('src/components/ProviderApp.tsx', 'w').write(content)
print("Removed mock providers.")
