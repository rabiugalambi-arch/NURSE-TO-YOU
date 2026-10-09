import sys
content = open('src/App.tsx').read()
content = content.replace("console.error('Error fetching user role:', e);", "console.error('Error fetching user role:', e); if (e.message) { console.error(e.message); }")
open('src/App.tsx', 'w').write(content)
