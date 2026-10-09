import fs from 'fs';

const files = ['src/components/PatientApp.tsx', 'src/components/ProviderApp.tsx', 'src/components/AdminApp.tsx', 'src/App.tsx'];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/console\.error\((.*?)\)/g, (match, p1) => {
      return `console.error(${p1}?.message || ${p1}?.code || 'Unknown error object', ${p1})`;
    });
    fs.writeFileSync(file, content);
  }
}
