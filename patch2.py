import sys

content = open('src/components/AuthForms.tsx').read()
content = content.replace("        verified: true,\n        applicationStatus: 'approved',", "        verified: false,\n        applicationStatus: 'pending',")
open('src/components/AuthForms.tsx', 'w').write(content)
