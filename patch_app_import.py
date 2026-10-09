import sys

content = open('src/App.tsx').read()
content = content.replace("import { doc, getDoc, onSnapshot } from 'firebase/firestore';", "import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';")
open('src/App.tsx', 'w').write(content)
