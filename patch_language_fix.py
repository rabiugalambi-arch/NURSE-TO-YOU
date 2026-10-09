import re

with open('src/contexts/LanguageContext.tsx', 'r') as f:
    content = f.read()

content = re.sub(r"\n  'Cancel': 'Soke',$", "", content)

with open('src/contexts/LanguageContext.tsx', 'w') as f:
    f.write(content)
