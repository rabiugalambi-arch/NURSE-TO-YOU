import sys

content = open('src/components/PatientApp.tsx').read()
content = content.replace("Eye, LocateFixed, Calendar, ShieldCheck, Download, Bell, MoreVertical", "Eye, LocateFixed, Calendar, ShieldCheck, Download, Bell, MoreVertical, Store")
if "import { PharmacyClientApp }" not in content:
    content = content.replace("import { Lock } from 'lucide-react';", "import { Lock } from 'lucide-react';\nimport { PharmacyClientApp } from './pharmacy/PharmacyClientApp';")
open('src/components/PatientApp.tsx', 'w').write(content)
