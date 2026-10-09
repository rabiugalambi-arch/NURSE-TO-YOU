import sys

content = open('src/components/ProviderApp.tsx').read()
start_idx = content.find("if (!providerId) {")
if start_idx != -1:
    end_idx = content.find("  }", start_idx) + 3
    content = content[:start_idx] + content[end_idx:]

open('src/components/ProviderApp.tsx', 'w').write(content)
print('Done!')
