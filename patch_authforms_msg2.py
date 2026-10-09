import sys

content = open('src/components/AuthForms.tsx').read()

old_subtitle = """{existingUser && <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg text-left">Your account was authenticated, but your Nurse To You profile could not be found. Please complete your Provider registration or contact Admin. (UID: {existingUser.uid})</div>}"""
new_subtitle = """{existingUser && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg text-left">
              Your account was authenticated, but your Nurse To You profile could not be found. Please complete your {view === 'provider' ? 'Provider' : 'Client'} registration or contact Admin. 
              <div className="text-xs text-blue-600 mt-2 font-mono break-all">Diagnostic: {existingUser.uid} | {existingUser.providerData[0]?.providerId} | No Profile | role: unknown</div>
            </div>
          )}"""
content = content.replace(old_subtitle, new_subtitle)

open('src/components/AuthForms.tsx', 'w').write(content)
