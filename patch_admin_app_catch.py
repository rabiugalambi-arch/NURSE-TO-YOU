import sys

content = open('src/components/AdminApp.tsx').read()
content = content.replace("await updateDoc(doc(db, 'providerApplications', providerId), appUpdateData);", "await updateDoc(doc(db, 'providerApplications', providerId), appUpdateData).catch(() => {});")
open('src/components/AdminApp.tsx', 'w').write(content)
print("Patched AdminApp.tsx catch")
