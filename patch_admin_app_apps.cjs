const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

content = content.replace(
  `                    <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.professionalRole} - {p.qualification}</p>`,
  `                    <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium capitalize text-gray-700">{p.type === 'physician' ? 'Physician' : 'Nurse'}</span> • {p.type === 'physician' ? p.specialty : p.professionalRole}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.qualification}</p>`
);

content = content.replace(
  `                  <p><strong>License:</strong> {p.licenseNumber}</p>
                  <p><strong>Institution:</strong> {p.institution} ({p.qualificationYear})</p>`,
  `                  <p><strong>License:</strong> {p.licenseNumber}</p>
                  <p><strong>Institution:</strong> {p.institution} ({p.qualificationYear})</p>
                  {p.type === 'physician' && (
                    <>
                      <p><strong>Consultation Fee:</strong> ₦{p.consultationFee}</p>
                      <p><strong>Clinic:</strong> {p.clinicLocation}</p>
                    </>
                  )}`
);

fs.writeFileSync('src/components/AdminApp.tsx', content);
