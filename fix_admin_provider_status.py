import sys

content = open('src/components/AdminApp.tsx').read()
old_status = """  const handleUpdateProviderStatus = async (providerId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'providers', providerId), { verified });
    } catch (err) {
      console.error(err?.message || err?.code || 'Unknown error object', err);
    }
  };"""

new_status = """  const handleUpdateProviderStatus = async (providerId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'providers', providerId), { 
        verified,
        applicationStatus: verified ? 'approved' : 'suspended'
      });
      await updateDoc(doc(db, 'providerApplications', providerId), {
        applicationStatus: verified ? 'approved' : 'suspended'
      }).catch(() => {});
    } catch (err) {
      console.error(err?.message || err?.code || 'Unknown error object', err);
    }
  };"""

content = content.replace(old_status, new_status)
open('src/components/AdminApp.tsx', 'w').write(content)
print("Fixed AdminApp provider status")
