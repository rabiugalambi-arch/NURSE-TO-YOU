import sys

content = open('src/components/ProviderApplication.tsx').read()
old = """        <p className="text-gray-600">
          Your application has been received and is currently being reviewed by our administrative team.
          We will notify you once a decision has been made.
        </p>
      </div>"""

new = """        <p className="text-gray-600 mb-4">
          Your application has been received and is currently being reviewed by our administrative team.
          We will notify you once a decision has been made.
        </p>
        <button 
          onClick={async () => {
            await updateDoc(doc(db, 'providers', providerId), { applicationStatus: 'draft' });
            window.location.reload();
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Reset Draft (Fix Error)
        </button>
      </div>"""

content = content.replace(old, new)
open('src/components/ProviderApplication.tsx', 'w').write(content)
print("Patched ProviderApplication with reset button")
