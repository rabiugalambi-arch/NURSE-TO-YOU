import sys

content = open('src/components/AuthForms.tsx').read()

old_handle = """  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    }
  };"""

new_handle = """  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, trimmedEmail);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/user-not-found') {
        setResetSent(true);
        setError('');
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many password reset attempts. Please wait and try again.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Unable to send the reset email. Please check your internet connection and try again.");
      } else {
        setError(err.message || 'Failed to send reset email');
      }
    } finally {
      setLoading(false);
    }
  };"""

content = content.replace(old_handle, new_handle)

old_message = "{resetSent && <div className=\"mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-left\">Password reset email sent! Check your inbox.</div>}"
new_message = "{resetSent && <div className=\"mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg text-left\">Password reset email sent. Please check your Gmail inbox and spam folder.</div>}"

content = content.replace(old_message, new_message)

open('src/components/AuthForms.tsx', 'w').write(content)
