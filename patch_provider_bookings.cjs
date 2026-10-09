const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

content = content.replace(
  `                      <h4 className="font-bold text-gray-900 text-xl mb-1">{b.service}</h4>
                      <p className="text-xs text-gray-500 font-medium mb-3">ID: {b.bookingId || b.id.substring(0,8).toUpperCase()}</p>`,
  `                      <h4 className="font-bold text-gray-900 text-xl mb-1 flex items-center gap-2">
                        {b.service}
                        {b.bookingType === 'physician' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">{b.consultationType || 'Consultation'}</span>}
                      </h4>
                      <div className="flex flex-col gap-1 mb-3 text-xs text-gray-500 font-medium">
                        <p>ID: {b.bookingId || b.id.substring(0,8).toUpperCase()}</p>
                        {b.bookingType === 'physician' && (
                          <p className="flex items-center gap-1 text-blue-900">
                            <Calendar className="w-3 h-3"/> {b.date || 'TBD'} • <Clock className="w-3 h-3"/> {b.time || 'TBD'}
                          </p>
                        )}
                      </div>`
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
