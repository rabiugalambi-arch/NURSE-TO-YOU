import sys

content = open('src/components/AuthForms.tsx').read()

old_error_handler = """    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {"""

new_error_handler = """    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already associated with another account. Please log in with that account or use a different email.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {"""

if old_error_handler in content:
    content = content.replace(old_error_handler, new_error_handler)
    print("Patched AuthForms error handler")

open('src/components/AuthForms.tsx', 'w').write(content)
