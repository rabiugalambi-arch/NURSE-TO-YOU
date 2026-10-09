import sys

content = open('src/components/AdminApp.tsx').read()

# 1. Update AdminView
content = content.replace(
    "type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services';",
    "type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications';"
)

# 2. Add NavItem
nav_item = "          <NavItem icon={<Users size={20}/>} label=\"Providers\" active={activeView === 'providers'} onClick={() => { setActiveView('providers'); setIsMobileMenuOpen(false); }} />"
new_nav_item = nav_item + "\n          <NavItem icon={<ShieldCheck size={20}/>} label=\"Provider Apps\" active={activeView === 'applications'} onClick={() => { setActiveView('applications'); setIsMobileMenuOpen(false); }} />"
content = content.replace(nav_item, new_nav_item)

# 3. Add handleUpdateApplicationStatus
funcs = """
  const handleUpdateApplicationStatus = async (providerId: string, status: 'approved' | 'rejected' | 'requires_information' | 'suspended', reason?: string) => {
    try {
      const updateData: any = { applicationStatus: status };
      if (status === 'approved') {
        updateData.verified = true;
      } else {
        updateData.verified = false;
        if (reason && status === 'rejected') updateData.rejectionReason = reason;
        if (reason && status === 'requires_information') updateData.informationRequested = reason;
      }
      await updateDoc(doc(db, 'providers', providerId), updateData);
    } catch (err: any) {
      console.error(err?.message || err?.code || 'Unknown error object', err);
    }
  };

  const renderApplications = () => {
    const apps = providers.filter(p => p.applicationStatus && p.applicationStatus !== 'draft');
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Provider Applications</h2>
        {apps.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">No applications found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.professionalRole} - {p.qualification}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' : p.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' : p.applicationStatus === 'requires_information' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.applicationStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 space-y-2 mb-6 flex-1">
                  <p><strong>License:</strong> {p.licenseNumber}</p>
                  <p><strong>Institution:</strong> {p.institution} ({p.qualificationYear})</p>
                  <p><strong>Experience:</strong> {p.experienceYears} years</p>
                  <p><strong>Address:</strong> {p.address}, {p.city}, {p.state}</p>
                  {p.documents && p.documents.length > 0 && (
                    <p><strong>Documents:</strong> {p.documents.join(', ')}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-auto border-t border-gray-100 pt-4">
                  {p.applicationStatus !== 'approved' && (
                    <button onClick={() => handleUpdateApplicationStatus(p.id, 'approved')} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-700">Approve</button>
                  )}
                  {p.applicationStatus !== 'rejected' && (
                    <button onClick={() => {
                      const reason = prompt("Enter rejection reason:");
                      if (reason) handleUpdateApplicationStatus(p.id, 'rejected', reason);
                    }} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-red-700">Reject</button>
                  )}
                  {p.applicationStatus !== 'approved' && p.applicationStatus !== 'rejected' && p.applicationStatus !== 'requires_information' && (
                    <button onClick={() => {
                      const reason = prompt("What information is required?");
                      if (reason) handleUpdateApplicationStatus(p.id, 'requires_information', reason);
                    }} className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-orange-600">Request Info</button>
                  )}
                  {p.applicationStatus === 'approved' && (
                    <button onClick={() => handleUpdateApplicationStatus(p.id, 'suspended', 'Suspended by admin')} className="flex-1 bg-gray-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-gray-700">Suspend</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
"""

target_render = "  const renderProviders = () => ("
if "const handleUpdateApplicationStatus" not in content:
    content = content.replace(target_render, funcs + "\n" + target_render)

# 4. Render the view
render_stmt = "{activeView === 'services' && renderServices()}"
new_render_stmt = render_stmt + "\n          {activeView === 'applications' && renderApplications()}"
content = content.replace(render_stmt, new_render_stmt)

open('src/components/AdminApp.tsx', 'w').write(content)
print("Patched AdminApp.tsx")
