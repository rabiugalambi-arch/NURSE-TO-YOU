import sys

content = open('src/components/AuthForms.tsx').read()

old_state = """  const [professionalRole, setProfessionalRole] = useState('RN');
  const [licenseNumber, setLicenseNumber] = useState('');"""

new_state = """  const [professionalRole, setProfessionalRole] = useState('RN');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [services, setServices] = useState('');
  const [serviceArea, setServiceArea] = useState('');"""

if old_state in content:
    content = content.replace(old_state, new_state)
    print("Patched state")

old_provider_ui = """                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input 
                      type="text" 
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                    />
                  </div>"""

new_provider_ui = """                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professional Registration (License/ID)</label>
                    <input 
                      type="text" 
                      value={licenseNumber}
                      onChange={e => setLicenseNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. N&MCN 12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Services Qualified For</label>
                    <input 
                      type="text" 
                      value={services}
                      onChange={e => setServices(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. Wound Care, IV Therapy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Area / City</label>
                    <input 
                      type="text" 
                      value={serviceArea}
                      onChange={e => setServiceArea(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"
                      required
                      placeholder="e.g. Kano Metro"
                    />
                  </div>"""

if old_provider_ui in content:
    content = content.replace(old_provider_ui, new_provider_ui)
    print("Patched UI")

old_db_save = """        if (role === 'provider') {
          await setDoc(doc(db, 'providers', uid), {
            providerId: uid,
            name: fullName,
            professionalRole,
            licenseNumber,
            verified: false,
            applicationStatus: 'pending',
            available: false,
            latitude: 0,
            longitude: 0,
            services: [],
            rating: 0,
            createdAt: Date.now()
          });
        }"""

new_db_save = """        if (role === 'provider') {
          await setDoc(doc(db, 'providers', uid), {
            providerId: uid,
            name: fullName,
            professionalRole,
            licenseNumber,
            serviceArea,
            verified: false,
            applicationStatus: 'submitted',
            available: false,
            latitude: 0,
            longitude: 0,
            services: services.split(',').map(s => s.trim()).filter(s => s.length > 0),
            rating: 0,
            createdAt: Date.now()
          });
        }"""

if old_db_save in content:
    content = content.replace(old_db_save, new_db_save)
    print("Patched DB save")

open('src/components/AuthForms.tsx', 'w').write(content)
