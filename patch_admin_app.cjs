const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');
content = content.replace(
  `              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>`,
  `              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type & Role</th>`
);

content = content.replace(
  `                <td className="px-6 py-4 text-gray-700">{p.professionalRole}</td>`,
  `                <td className="px-6 py-4 text-gray-700">
                  <div className="font-medium capitalize text-gray-900">{p.type === 'physician' ? 'Physician' : 'Nurse'}</div>
                  <div className="text-xs text-gray-500">{p.type === 'physician' ? p.specialty : p.professionalRole}</div>
                </td>`
);

fs.writeFileSync('src/components/AdminApp.tsx', content);
