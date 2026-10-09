const fs = require('fs');

let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// The instruction is "Provider type/qualification required"
const oldDurationBlock = `              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Estimated Duration</p>
                  <p className="text-blue-900 font-bold text-xl">{selectedService.duration}</p>
                </div>
              </div>`;

const newQualificationsBlock = `              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1">Required Qualifications</p>
                  <p className="text-blue-900 font-bold text-sm">{(selectedService.roles || []).join(', ') || 'Authorized Healthcare Provider'}</p>
                </div>
              </div>`;

if (content.includes(oldDurationBlock)) {
  content = content.replace(oldDurationBlock, newQualificationsBlock);
} else {
  console.log("Could not find old duration block");
}

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Patched service details successfully");
