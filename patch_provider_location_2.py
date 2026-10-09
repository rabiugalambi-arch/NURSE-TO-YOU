import sys

content = open('src/components/ProviderApp.tsx').read()
content = content.replace("message: 'GPS Synced'", "message: 'Location detected ✓'")
open('src/components/ProviderApp.tsx', 'w').write(content)
