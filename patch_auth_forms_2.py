import sys

content = open('src/components/AuthForms.tsx').read()

content = content.replace("verified: false,", "verified: true,")
content = content.replace("applicationStatus: 'submitted',", "applicationStatus: 'approved',")

open('src/components/AuthForms.tsx', 'w').write(content)
