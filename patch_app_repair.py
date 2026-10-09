import sys

content = open('src/App.tsx').read()

old_snapshot = """          // Listen to users collection (solves race condition on registration)
          unsubUserDoc = onSnapshot(doc(db, 'users', u.uid), (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              setRole(userData.role);
              setLoading(false);
            } else {
              // Might be in the middle of registration, wait for the doc
              // Don't set loading false yet, give it a moment
              setTimeout(() => {
                 setLoading(false);
              }, 2000);
            }
          }, (err) => {
            console.error('Error fetching user role:', err);
            setLoading(false);
          });"""

new_snapshot = """          // Listen to users collection (solves race condition on registration)
          unsubUserDoc = onSnapshot(doc(db, 'users', u.uid), async (docSnap) => {
            if (docSnap.exists() && docSnap.data().role) {
              const userData = docSnap.data();
              setRole(userData.role);
              setLoading(false);
            } else {
              // Might be in the middle of registration, or an existing provider without a users document.
              // Safe Data Migration Check:
              try {
                const providerDoc = await getDoc(doc(db, 'providers', u.uid));
                if (providerDoc.exists()) {
                   // It's a provider, repair the users doc
                   const { setDoc } = await import('firebase/firestore');
                   await setDoc(doc(db, 'users', u.uid), {
                      uid: u.uid,
                      role: 'provider',
                      fullName: providerDoc.data().name || '',
                      email: u.email || '',
                      phone: u.phoneNumber || '',
                      createdAt: providerDoc.data().createdAt || Date.now(),
                      accountStatus: 'active'
                   }, { merge: true });
                   setRole('provider');
                   setLoading(false);
                   return;
                }
              } catch (e) {
                 console.warn("Migration check error:", e);
              }
              
              // Give it a moment in case it's mid-registration
              setTimeout(() => {
                 setLoading(false);
              }, 2000);
            }
          }, (err) => {
            console.error('Error fetching user role:', err);
            setLoading(false);
          });"""
content = content.replace(old_snapshot, new_snapshot)

open('src/App.tsx', 'w').write(content)
