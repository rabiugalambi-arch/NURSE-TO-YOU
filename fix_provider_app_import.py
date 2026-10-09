import sys
content = open('src/components/ProviderApplication.tsx').read()
content = content.replace("import { doc, updateDoc } from 'firebase/firestore';", "import { doc, updateDoc, setDoc } from 'firebase/firestore';")
open('src/components/ProviderApplication.tsx', 'w').write(content)
