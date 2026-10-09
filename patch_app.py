import sys

content = open('src/App.tsx').read()

old_auth = """  // 2. User is not logged in but selected a view
  if (!user) {
    return (
      <AuthForms view={view} onBack={() => setView(null)} />
    );
  }"""
new_auth = """  // 2. User is not logged in or hasn't finished profile creation
  if (!user || !role) {
    return (
      <AuthForms view={view} onBack={() => {
        if (user) signOut(auth);
        setView(null);
      }} existingUser={user} />
    );
  }"""
content = content.replace(old_auth, new_auth)

open('src/App.tsx', 'w').write(content)
