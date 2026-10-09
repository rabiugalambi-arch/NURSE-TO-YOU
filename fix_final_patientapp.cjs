const fs = require('fs');

let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

content = content.replace(
  `              )}
              </div>
            </div>
            <BottomNav />
          </div>
        )}`,
  `              )}
            </div>
            <BottomNav />
          </div>
        )}`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
