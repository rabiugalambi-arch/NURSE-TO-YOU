import re

with open('firestore.rules', 'r') as f:
    content = f.read()

# Replace isClient() && with request.auth != null &&
content = content.replace('isClient() &&', 'request.auth != null &&')

with open('firestore.rules', 'w') as f:
    f.write(content)
