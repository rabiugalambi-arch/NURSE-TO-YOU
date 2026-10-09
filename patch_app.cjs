const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace(
  `<PatientApp patientId={user.uid} userName={user.displayName || 'Client'} />`,
  `<PatientApp patientId={user.uid} userName={user.displayName || 'Client'} onHome={() => setView(null)} onLogout={() => { signOut(auth); setView(null); }} />`
);

appContent = appContent.replace(
  /        <div className="absolute top-4 left-4 z-50">[\s\S]*?<\/div>\s*<div className="absolute top-4 right-4 z-50">[\s\S]*?<\/div>/,
  `{/* Home and Logout buttons moved inside the apps */}`
);

fs.writeFileSync('src/App.tsx', appContent);

let patientContent = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// Add props to PatientApp
patientContent = patientContent.replace(
  `export function PatientApp({ patientId, userName }: { patientId: string, userName: string }) {`,
  `export function PatientApp({ patientId, userName, onHome, onLogout }: { patientId: string, userName: string, onHome?: () => void, onLogout?: () => void }) {`
);

patientContent = patientContent.replace(
  `import { LogOut, `,
  `import { `
);

// Add buttons to the home step in PatientApp
const oldHeader = `              <div>
                <p className="text-gray-500 text-sm">Hello, {userName} 👋</p>
                <h1 className="font-bold text-gray-900 text-lg flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-900"/> {location.address.substring(0, 20)}...</h1>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center relative shadow-sm border border-blue-200">
                <Bell className="w-5 h-5 text-blue-900" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>`;

const newHeader = `              <div>
                <p className="text-gray-500 text-sm">Hello, {userName} 👋</p>
                <h1 className="font-bold text-gray-900 text-lg flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-900"/> {location.address.substring(0, 20)}...</h1>
              </div>
              <div className="flex gap-2">
                {onHome && (
                  <button onClick={onHome} className="p-2 bg-white rounded-full text-blue-900 shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center gap-1 text-xs font-bold">
                    <ArrowLeft className="w-4 h-4" /> Home
                  </button>
                )}
                {onLogout && (
                  <button onClick={onLogout} className="p-2 bg-white rounded-full text-red-600 shadow-sm border border-gray-200 hover:bg-red-50 flex items-center gap-1 text-xs font-bold">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                )}
              </div>`;

patientContent = patientContent.replace(oldHeader, newHeader);

// Ensure LogOut is imported in PatientApp
if (!patientContent.includes('LogOut')) {
    patientContent = patientContent.replace(`import { ArrowLeft`, `import { LogOut, ArrowLeft`);
}

fs.writeFileSync('src/components/PatientApp.tsx', patientContent);
