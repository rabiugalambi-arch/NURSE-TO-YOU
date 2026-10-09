const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  "export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';",
  "export type BookingStatus = 'REQUESTED' | 'ACCEPTED' | 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DECLINED';"
);
fs.writeFileSync('src/types.ts', content);

let dts = fs.existsSync('src/vite-env.d.ts') ? fs.readFileSync('src/vite-env.d.ts', 'utf8') : '';
if (!dts.includes("declare module '*.jpg'")) {
  dts += "\n/// <reference types=\"vite/client\" />\ndeclare module '*.jpg' {\n  const src: string;\n  export default src;\n}\n";
  fs.writeFileSync('src/vite-env.d.ts', dts);
}
