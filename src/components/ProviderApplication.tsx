import React, { useState } from 'react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Provider } from '../types';
import { ShieldCheck, Upload, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export function ProviderApplication({ providerData, providerId }: { providerData: Provider | null, providerId: string }) {
  const [formData, setFormData] = useState({
    phone: providerData?.phone || '',
    address: providerData?.address || '',
    city: providerData?.city || '',
    state: providerData?.state || '',
    type: providerData?.type || 'nurse',
    specialty: providerData?.specialty || '',
    consultationFee: providerData?.consultationFee || 15000,
    clinicLocation: providerData?.clinicLocation || '',
    professionalRole: providerData?.professionalRole || 'RN',
    licenseNumber: providerData?.licenseNumber || '',
    registrationBody: providerData?.registrationBody || '',
    qualification: providerData?.qualification || '',
    institution: providerData?.institution || '',
    qualificationYear: providerData?.qualificationYear || '',
    experienceYears: providerData?.experienceYears || '',
  });

  const [documents, setDocuments] = useState<string[]>(providerData?.documents || []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const status = providerData?.applicationStatus || 'draft';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileNames = Array.from(e.target.files).map(f => f.name);
      setDocuments([...documents, ...fileNames]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await updateDoc(doc(db, 'providers', providerId), {
        applicationStatus: 'submitted',
        verified: false,
        name: providerData.name, // Ensure base data is there
        type: formData.type,
        specialty: formData.type === 'physician' ? formData.specialty : null,
        consultationFee: formData.type === 'physician' ? Number(formData.consultationFee) : null,
        clinicLocation: formData.type === 'physician' ? formData.clinicLocation : null,
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
    } catch (err: any) {
      setError(err?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (!providerData) return null;

  if (status === 'submitted' || status === 'under_review') {
    return (
      <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center">
        <Clock className="w-16 h-16 text-blue-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
        <p className="text-gray-600 mb-4">
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
      </div>
    );
  }

  if (status === 'rejected' || status === 'suspended') {
    return (
      <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Application {status === 'suspended' ? 'Suspended' : 'Rejected'}</h2>
        <p className="text-gray-600 mb-4">
          {providerData.rejectionReason || 'Your application was not approved at this time.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 h-full overflow-y-auto">
      <div className="bg-blue-900 text-white p-6 rounded-3xl mb-6 shadow-md">
        <h1 className="text-2xl font-bold mb-2">Provider Application</h1>
        <p className="text-blue-100 text-sm">
          Please complete your professional profile to become a verified Nurse To You provider.
        </p>
      </div>

      {status === 'requires_information' && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Additional Information Required</h3>
            <p className="text-sm mt-1">{providerData.informationRequested}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 pb-8">
        {/* Section 1: Personal Information */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">1. Personal Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
            <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
          </div>
        </section>

        {/* Section 2: Professional Information */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Professional Role</label>
            <select required name="professionalRole" value={formData.professionalRole} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none bg-white">
              <option value="RN">Registered Nurse (RN)</option>
              <option value="LPN">Licensed Practical Nurse (LPN)</option>
              <option value="NP">Nurse Practitioner (NP)</option>
              <option value="Midwife">Registered Midwife</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
              <input required type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Body</label>
              <input required type="text" name="registrationBody" value={formData.registrationBody} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
            <input required type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. B.Sc Nursing" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <input required type="text" name="institution" value={formData.institution} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
              <input required type="text" name="qualificationYear" value={formData.qualificationYear} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
              <input required type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-transparent outline-none" />
            </div>
          </div>
        </section>

        {/* Section 3: Document Verification */}
        <section className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-2">3. Verification Documents</h2>
          <p className="text-sm text-gray-500">Upload your professional license and identification documents.</p>
          
          <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors cursor-pointer relative">
            <input type="file" multiple onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <Upload className="w-8 h-8 text-blue-900 mx-auto mb-2" />
            <p className="font-medium text-blue-900">Tap to upload documents</p>
            <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG</p>
          </div>

          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-bold text-gray-700">Uploaded:</p>
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-teal-500" />
                  {doc}
                </div>
              ))}
            </div>
          )}
        </section>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-blue-900 text-white font-bold py-4 rounded-full shadow-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
