const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

// Hide Patient Location Map for Physicians
content = content.replace(
  `{b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && (
                      <div className="bg-slate-50 p-5 border-t border-b border-gray-100">`,
  `{b.status !== 'REQUESTED' && b.status !== 'CANCELLED' && b.bookingType !== 'physician' && (
                      <div className="bg-slate-50 p-5 border-t border-b border-gray-100">`
);

// Modify flow buttons
content = content.replace(
  `                      {b.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'ON_THE_WAY')}
                          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                        >
                          En Route to Patient
                        </button>
                      )}
                        
                      {b.status === 'ON_THE_WAY' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'ARRIVED')}
                          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                          Mark as Arrived
                        </button>
                      )}

                      {b.status === 'ARRIVED' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                        >
                          <ActivitySquare className="w-5 h-5"/> Start Service
                        </button>
                      )}`,
  `                      {b.status === 'ACCEPTED' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, b.bookingType === 'physician' ? 'IN_PROGRESS' : 'ON_THE_WAY')}
                          className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                        >
                          {b.bookingType === 'physician' ? 'Start Consultation' : 'En Route to Patient'}
                        </button>
                      )}
                        
                      {b.status === 'ON_THE_WAY' && b.bookingType !== 'physician' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'ARRIVED')}
                          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                        >
                          Mark as Arrived
                        </button>
                      )}

                      {b.status === 'ARRIVED' && b.bookingType !== 'physician' && (
                        <button 
                          onClick={() => updateBookingStatus(b.id, 'IN_PROGRESS')}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                        >
                          <ActivitySquare className="w-5 h-5"/> Start Service
                        </button>
                      )}`
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
