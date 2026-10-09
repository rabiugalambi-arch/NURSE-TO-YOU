import sys

content = open('src/components/AdminApp.tsx').read()

# Replace the Google login UI with an error message because App.tsx should handle auth
old_login_ui = """  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="flex justify-center mb-6 text-blue-600">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Admin Secure Login</h2>
          
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
              Sign In with Google
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-2">First time testing?</p>
            <button onClick={handleSetupAdmin} className="text-sm text-blue-600 hover:underline">
              Create test admin account
            </button>
          </div>
        </div>
      </div>
    );
  }"""

new_login_ui = """  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center mb-6 text-red-500">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }"""

if old_login_ui in content:
    content = content.replace(old_login_ui, new_login_ui)
    print("Patched admin login UI")
else:
    print("Could not find old admin login UI")

open('src/components/AdminApp.tsx', 'w').write(content)
