import sys

content = open('src/components/AuthForms.tsx').read()

if "GoogleAuthProvider" not in content:
    content = content.replace("sendPasswordResetEmail\n} from 'firebase/auth';", "sendPasswordResetEmail,\n  GoogleAuthProvider,\n  signInWithPopup\n} from 'firebase/auth';")

if "const googleProvider = new GoogleAuthProvider();" not in content:
    content = content.replace("export function AuthForms({ view, onBack }: AuthFormsProps) {", "const googleProvider = new GoogleAuthProvider();\n\nexport function AuthForms({ view, onBack }: AuthFormsProps) {")

google_func = """  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      const cred = await signInWithPopup(auth, googleProvider);
      
      // If they are registering (or we want to ensure their profile exists)
      // Check if user doc exists, if not create it
      const { doc, getDoc, setDoc } = require('firebase/firestore');
      const { db } = require('../firebase');
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      
      if (!userDoc.exists()) {
        const uid = cred.user.uid;
        const role = view === 'patient' ? 'client' : view === 'provider' ? 'provider' : 'admin';
        
        await setDoc(doc(db, 'users', uid), {
          uid,
          role,
          fullName: cred.user.displayName || '',
          email: cred.user.email || '',
          phone: cred.user.phoneNumber || '+234',
          createdAt: Date.now(),
          accountStatus: 'active'
        });

        if (role === 'provider') {
          await setDoc(doc(db, 'providers', uid), {
            providerId: uid,
            name: cred.user.displayName || '',
            professionalRole: 'RN',
            licenseNumber: 'Pending',
            serviceArea: 'Pending',
            verified: false,
            applicationStatus: 'submitted',
            available: false,
            latitude: 0,
            longitude: 0,
            services: [],
            rating: 0,
            createdAt: Date.now()
          });
        }
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed');
      }
    } finally {
      setLoading(false);
    }
  };
"""

if "handleGoogleSignIn" not in content:
    content = content.replace("const handleResetPassword = async () => {", google_func + "\n  const handleResetPassword = async () => {")

google_button = """        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-4 px-6 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex justify-center items-center gap-3 h-14"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        {view !== 'admin' && ("""

if "Or continue with" not in content:
    content = content.replace("</form>\n        {view !== 'admin' && (", google_button)

open('src/components/AuthForms.tsx', 'w').write(content)
