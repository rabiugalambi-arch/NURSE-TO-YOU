const fs = require('fs');

function addErrorHandler(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Add a generic error handler to any onSnapshot that doesn't have one
  content = content.replace(
    /\(snapshot\) => \{([\s\S]*?)\n    \}\);/g,
    "(snapshot) => {$1\n    }, (err) => console.error('Snapshot error in " + filePath.split('/').pop() + ":', err));"
  );
  
  content = content.replace(
    /\(snap\) => \{([\s\S]*?)\n    \}\);/g,
    "(snap) => {$1\n    }, (err) => console.error('Snapshot error in " + filePath.split('/').pop() + ":', err));"
  );

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Patched', filePath);
  }
}

addErrorHandler('src/components/PatientApp.tsx');
addErrorHandler('src/components/ProviderApp.tsx');
addErrorHandler('src/components/AdminApp.tsx');
addErrorHandler('src/components/pharmacy/PharmacyClientApp.tsx');
addErrorHandler('src/components/pharmacy/PharmacyAdminApp.tsx');
