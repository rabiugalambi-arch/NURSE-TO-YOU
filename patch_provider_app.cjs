const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApplication.tsx', 'utf8');

// 1. Update formData state
content = content.replace(
  `  const [formData, setFormData] = useState({
    phone: providerData?.phone || '',
    address: providerData?.address || '',
    city: providerData?.city || '',
    state: providerData?.state || '',
    professionalRole: providerData?.professionalRole || 'RN',`,
  `  const [formData, setFormData] = useState({
    phone: providerData?.phone || '',
    address: providerData?.address || '',
    city: providerData?.city || '',
    state: providerData?.state || '',
    type: providerData?.type || 'nurse',
    specialty: providerData?.specialty || '',
    consultationFee: providerData?.consultationFee || 15000,
    clinicLocation: providerData?.clinicLocation || '',
    professionalRole: providerData?.professionalRole || 'RN',`
);

// 2. Update submit payload
content = content.replace(
  `      await updateDoc(doc(db, 'providers', providerId), {
        applicationStatus: 'submitted',
        verified: false,
        name: providerData.name, // Ensure base data is there
        professionalRole: formData.professionalRole,`,
  `      await updateDoc(doc(db, 'providers', providerId), {
        applicationStatus: 'submitted',
        verified: false,
        name: providerData.name, // Ensure base data is there
        type: formData.type,
        specialty: formData.type === 'physician' ? formData.specialty : null,
        consultationFee: formData.type === 'physician' ? Number(formData.consultationFee) : null,
        clinicLocation: formData.type === 'physician' ? formData.clinicLocation : null,
        professionalRole: formData.professionalRole,`
);

// 3. Add UI fields to Section 2
content = content.replace(
  `        {/* Section 2: Professional Information */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">2. Professional Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>`,
  `        {/* Section 2: Professional Information */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">2. Professional Details</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
              <select required name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-white">
                <option value="nurse">Nurse / Medical Staff</option>
                <option value="physician">Physician / Doctor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>`
);

content = content.replace(
  `              <option value="Midwife">Registered Midwife</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">`,
  `              <option value="Midwife">Registered Midwife</option>
              {formData.type === 'physician' && (
                <>
                  <option value="MD">Medical Doctor (MD)</option>
                  <option value="DO">Doctor of Osteopathic Medicine (DO)</option>
                  <option value="Specialist">Specialist Consultant</option>
                </>
              )}
            </select>
            </div>
          </div>
          
          {formData.type === 'physician' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                <select required name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-white">
                  <option value="">Select Specialty</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Pediatrician">Pediatrician</option>
                  <option value="Obstetrician & Gynecologist">Obstetrician & Gynecologist</option>
                  <option value="Cardiologist">Cardiologist</option>
                  <option value="Dermatologist">Dermatologist</option>
                  <option value="Psychiatrist">Psychiatrist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Orthopedic Specialist">Orthopedic Specialist</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Surgeon">Surgeon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₦)</label>
                <input required type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Clinic / Hospital Location</label>
                <input required type="text" name="clinicLocation" value={formData.clinicLocation} onChange={handleChange} placeholder="Name and address of primary clinic" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">`
);

fs.writeFileSync('src/components/ProviderApplication.tsx', content);
