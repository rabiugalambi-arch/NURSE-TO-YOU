import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace("                  ))\n                )}", "                  ))}\n                  </>\n                )}")
open('src/components/PatientApp.tsx', 'w').write(content)
