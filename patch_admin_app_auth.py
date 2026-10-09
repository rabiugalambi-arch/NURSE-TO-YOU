import sys

content = open('src/components/AdminApp.tsx').read()

old_auth = """    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          if (adminDoc.exists()) {"""

new_auth = """    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          const isUserAdmin = userDoc.exists() && userDoc.data().role === 'admin';
          
          if (adminDoc.exists() || isUserAdmin) {"""

if old_auth in content:
    content = content.replace(old_auth, new_auth)
    print("Patched AdminApp.tsx auth logic")
else:
    print("Could not find old admin auth logic")

open('src/components/AdminApp.tsx', 'w').write(content)
