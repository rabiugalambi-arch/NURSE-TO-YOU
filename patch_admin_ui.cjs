const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

const uiInjection = `
        {activeView === 'physician_bookings' && (
          <div className="animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Stethoscope className="w-8 h-8 text-blue-900" /> Physician Bookings
                </h1>
                <p className="text-gray-500 mt-1">Manage all dedicated physician care bookings.</p>
              </div>
              
              <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                {['All', 'Pending Admin Processing', 'Contacting Client', 'Physician Arranged', 'Completed', 'Cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setPhysicianFilter(f)}
                    className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${physicianFilter === f ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:text-gray-900'}\`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                      <th className="py-4 px-6 font-semibold text-gray-600">ID / Date</th>
                      <th className="py-4 px-6 font-semibold text-gray-600">Client Details</th>
                      <th className="py-4 px-6 font-semibold text-gray-600">Booking Info</th>
                      <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                      <th className="py-4 px-6 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {physicianBookings.filter(b => physicianFilter === 'All' || b.bookingStatus === physicianFilter.toLowerCase().replace(/ /g, '_')).map(b => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">{b.bookingId}</div>
                          <div className="text-xs text-gray-500">
                            {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{b.clientName}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {b.clientPhone}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3"/> {b.clientEmail}</div>
                          <div className="text-xs text-gray-400 mt-1 max-w-[200px] truncate">{b.clientAddress}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Prefers:</span> {b.preferredDate} at {b.preferredTime}
                          </div>
                          <div className="text-xs mt-1 text-gray-500 max-w-[250px] line-clamp-2">
                            <span className="font-semibold text-gray-600">Reason:</span> {b.reason}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold \${
                            b.bookingStatus === 'completed' ? 'bg-teal-100 text-teal-800' :
                            b.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            b.bookingStatus === 'physician_arranged' ? 'bg-blue-100 text-blue-800' :
                            b.bookingStatus === 'contacting_client' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }\`}>
                            {b.bookingStatus.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <select 
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2"
                            value={b.bookingStatus}
                            onChange={async (e) => {
                              try {
                                await updateDoc(doc(db, 'physician_bookings', b.id), {
                                  bookingStatus: e.target.value,
                                  updatedAt: serverTimestamp()
                                });
                                // also send notification to client
                                await addDoc(collection(db, 'notifications'), {
                                  userId: b.clientId,
                                  title: 'Physician Booking Update',
                                  message: \`Your physician booking \${b.bookingId} is now \${e.target.value.replace(/_/g, ' ')}.\`,
                                  type: 'info',
                                  createdAt: serverTimestamp(),
                                  read: false
                                });
                              } catch(err) {
                                console.error('Error updating status', err);
                              }
                            }}
                          >
                            <option value="pending_admin_processing">Pending Admin Processing</option>
                            <option value="contacting_client">Contacting Client</option>
                            <option value="physician_arranged">Physician Arranged</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {physicianBookings.filter(b => physicianFilter === 'All' || b.bookingStatus === physicianFilter.toLowerCase().replace(/ /g, '_')).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-500">
                          <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p>No physician bookings found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
`;

const anchor = `{activeView === 'pharmacy' && (`;

if(content.includes(anchor)) {
  content = content.replace(anchor, uiInjection + '\n        ' + anchor);
  fs.writeFileSync('src/components/AdminApp.tsx', content);
  console.log("Admin UI injected");
} else {
  console.log("Anchor not found");
}
