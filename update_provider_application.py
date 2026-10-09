import sys

content = open('src/components/ProviderApplication.tsx').read()

# Add setDoc
if "setDoc" not in content:
    content = content.replace("doc, updateDoc", "doc, updateDoc, setDoc")

old_submit = """    try {
      await updateDoc(doc(db, 'providers', providerId), {
        ...formData,
        documents,
        applicationStatus: 'submitted',
        verified: false
      });
    }"""

new_submit = """    try {
      await updateDoc(doc(db, 'providers', providerId), {
        applicationStatus: 'submitted',
        verified: false,
        name: providerData.name, // Ensure base data is there
        professionalRole: formData.professionalRole,
        qualification: formData.qualification,
        experienceYears: formData.experienceYears,
      });
      await setDoc(doc(db, 'providerApplications', providerId), {
        ...formData,
        name: providerData.name, // Save name to app
        documents,
        applicationStatus: 'submitted',
        updatedAt: Date.now()
      });
    }"""

content = content.replace(old_submit, new_submit)
open('src/components/ProviderApplication.tsx', 'w').write(content)
print("Updated ProviderApplication.tsx")
