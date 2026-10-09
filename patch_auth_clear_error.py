import sys

content = open('src/components/AuthForms.tsx').read()

# Add a clear error on email change
old_email = "onChange={e => setEmail(e.target.value)}"
new_email = "onChange={e => { setEmail(e.target.value); setError(''); }}"

# Do the same for password just in case
old_pass = "onChange={e => setPassword(e.target.value)}"
new_pass = "onChange={e => { setPassword(e.target.value); setError(''); }}"

if old_email in content:
    content = content.replace(old_email, new_email)
if old_pass in content:
    content = content.replace(old_pass, new_pass)

open('src/components/AuthForms.tsx', 'w').write(content)
