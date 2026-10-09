import sys

content = open('src/components/AuthForms.tsx').read()

old_subtitle = """          <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Nurse To You</h2>
          
          {!googleRole ? ("""
new_subtitle = """          <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to Nurse To You</h2>
          {existingUser && <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg text-left">Your account was authenticated, but your Nurse To You profile could not be found. Please complete your Provider registration or contact Admin. (UID: {existingUser.uid})</div>}
          
          {!googleRole ? ("""
content = content.replace(old_subtitle, new_subtitle)

open('src/components/AuthForms.tsx', 'w').write(content)
