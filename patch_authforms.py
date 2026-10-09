import sys

content = open('src/components/AuthForms.tsx').read()

old_interface = """interface AuthFormsProps {
  view: 'patient' | 'provider' | 'admin';
  onBack: () => void;
}"""
new_interface = """import { User } from 'firebase/auth';

interface AuthFormsProps {
  view: 'patient' | 'provider' | 'admin';
  onBack: () => void;
  existingUser?: User | null;
}"""
content = content.replace(old_interface, new_interface)

old_comp = """export function AuthForms({ view, onBack }: AuthFormsProps) {"""
new_comp = """export function AuthForms({ view, onBack, existingUser }: AuthFormsProps) {"""
content = content.replace(old_comp, new_comp)

old_state = """  // Google Onboarding State
  const [googleRegistration, setGoogleRegistration] = useState<any>(null);"""
new_state = """  // Google Onboarding State
  const [googleRegistration, setGoogleRegistration] = useState<any>(existingUser || null);"""
content = content.replace(old_state, new_state)

# Also, if existingUser is passed, we might want to default googleRole to 'provider' if view is 'provider'
old_role_state = """  const [googleRole, setGoogleRole] = useState<'client' | 'provider' | null>(null);"""
new_role_state = """  const [googleRole, setGoogleRole] = useState<'client' | 'provider' | null>(existingUser && view === 'provider' ? 'provider' : null);"""
content = content.replace(old_role_state, new_role_state)

open('src/components/AuthForms.tsx', 'w').write(content)
