const fs = require('fs');

let patientContent = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

patientContent = patientContent.replace(
  `              )}
              </div>
            </div>
          </div>
        )}

        {step === 'all_services' && (`,
  `              )}
            </div>
            <BottomNav />
          </div>
        )}

        {step === 'all_services' && (`
);

fs.writeFileSync('src/components/PatientApp.tsx', patientContent);
