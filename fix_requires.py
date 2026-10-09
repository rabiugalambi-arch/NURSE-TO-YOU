import sys

content = open('src/components/AuthForms.tsx').read()
content = content.replace("import { doc, setDoc } from 'firebase/firestore';", "import { doc, setDoc, getDoc } from 'firebase/firestore';")

content = content.replace("const { doc, getDoc, setDoc } = require('firebase/firestore');\n      const { db } = require('../firebase');", "")

open('src/components/AuthForms.tsx', 'w').write(content)
