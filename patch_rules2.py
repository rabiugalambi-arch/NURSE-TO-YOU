import re

with open('firestore.rules', 'r') as f:
    content = f.read()

replacement = '''    match /menstrualCycles/{cycleId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }'''

content = re.sub(
    r'\s*match \/menstrualCycles\/\{cycleId\} \{\s*allow create: if isClient\(\) && request\.resource\.data\.userId == request\.auth\.uid;\s*allow read, update, delete: if isClient\(\) && resource\.data\.userId == request\.auth\.uid;\s*\}',
    '\n' + replacement + '\n',
    content
)

with open('firestore.rules', 'w') as f:
    f.write(content)
