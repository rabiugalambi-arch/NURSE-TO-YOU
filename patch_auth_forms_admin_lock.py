import sys

content = open('src/components/AuthForms.tsx').read()

old_state = """  const [isLogin, setIsLogin] = useState(true);"""
new_state = """  const [isLogin, setIsLogin] = useState(view === 'admin' ? true : true);""" # Just a placeholder

# actually we can just force it in handleAuth
old_auth = """      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {"""
new_auth = """      if (isLogin || view === 'admin') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {"""

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    print("Patched admin lock")

open('src/components/AuthForms.tsx', 'w').write(content)
