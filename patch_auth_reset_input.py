import sys

content = open('src/components/AuthForms.tsx').read()

old_email_change = "onChange={e => { setEmail(e.target.value); setError(''); }}"
new_email_change = "onChange={e => { setEmail(e.target.value); setError(''); setResetSent(false); }}"

old_pass_change = "onChange={e => { setPassword(e.target.value); setError(''); }}"
new_pass_change = "onChange={e => { setPassword(e.target.value); setError(''); setResetSent(false); }}"

content = content.replace(old_email_change, new_email_change)
content = content.replace(old_pass_change, new_pass_change)

open('src/components/AuthForms.tsx', 'w').write(content)
