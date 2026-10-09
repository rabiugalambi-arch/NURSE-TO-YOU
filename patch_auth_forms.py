import sys

content = open('src/components/AuthForms.tsx').read()

old_auth_catch = """    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already associated with another account. Please log in with that account or use a different email.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    }"""
new_auth_catch = """    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already associated with another account. Please log in with that account or use a different email.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Email/Password authentication is disabled. Please enable 'Email/Password' under Firebase Authentication → Sign-in providers in your Firebase Console.");
      } else {
        setError(err.message || 'Authentication failed');
      }
    }"""
content = content.replace(old_auth_catch, new_auth_catch)

old_google_catch = """    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already associated with another account. Please sign in with your email and password.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed');
      }
    }"""
new_google_catch = """    } catch (err: any) {
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already associated with another account. Please sign in with your email and password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("Google Sign-In is disabled. Please enable 'Google' under Firebase Authentication → Sign-in providers in your Firebase Console.");
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed');
      }
    }"""
content = content.replace(old_google_catch, new_google_catch)

old_provider_email = """            verified: true,
            applicationStatus: 'approved',"""
new_provider_email = """            verified: false,
            applicationStatus: 'pending',"""
content = content.replace(old_provider_email, new_provider_email)

open('src/components/AuthForms.tsx', 'w').write(content)
