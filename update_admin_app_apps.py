import sys

content = open('src/components/AdminApp.tsx').read()

# Add state for providerApplications
state_addition = "  const [applications, setApplications] = useState<any[]>([]);\n"
if "const [applications" not in content:
    content = content.replace("  const [services, setServices] = useState", state_addition + "  const [services, setServices] = useState")

# Add snapshot for providerApplications
snap_addition = """
            unsubApps = onSnapshot(collection(db, 'providerApplications'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setApplications(data);
            }, (err) => console.warn('Apps snapshot error:', err.message));
"""
if "unsubApps =" not in content:
    content = content.replace("let unsubServices: any;", "let unsubServices: any;\n    let unsubApps: any;")
    content = content.replace("unsubServices = onSnapshot", snap_addition + "            unsubServices = onSnapshot")
    content = content.replace("if (unsubServices) unsubServices();", "if (unsubServices) unsubServices();\n        if (unsubApps) unsubApps();")


# Update handleUpdateApplicationStatus
old_handle = """  const handleUpdateApplicationStatus = async (providerId: string, status: 'approved' | 'rejected' | 'requires_information' | 'suspended', reason?: string) => {
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
  };"""

new_handle = """  const handleUpdateApplicationStatus = async (providerId: string, status: 'approved' | 'rejected' | 'requires_information' | 'suspended', reason?: string) => {
    try {
      const updateData: any = { applicationStatus: status };
      const appUpdateData: any = { applicationStatus: status };
      
      if (status === 'approved') {
        updateData.verified = true;
      } else {
        updateData.verified = false;
        if (reason && status === 'rejected') {
            updateData.rejectionReason = reason;
            appUpdateData.rejectionReason = reason;
        }
        if (reason && status === 'requires_information') {
            updateData.informationRequested = reason;
            appUpdateData.informationRequested = reason;
        }
      }
      await updateDoc(doc(db, 'providers', providerId), updateData);
      await updateDoc(doc(db, 'providerApplications', providerId), appUpdateData);
    } catch (err: any) {
      console.error(err?.message || err?.code || 'Unknown error object', err);
    }
  };"""

content = content.replace(old_handle, new_handle)

# Update renderApplications
old_render = """  const renderApplications = () => {
    const apps = providers.filter(p => p.applicationStatus && p.applicationStatus !== 'draft');
    return ("""

new_render = """  const renderApplications = () => {
    const apps = applications.filter(p => p.applicationStatus && p.applicationStatus !== 'draft');
    return ("""

content = content.replace(old_render, new_render)

open('src/components/AdminApp.tsx', 'w').write(content)
print("Updated AdminApp.tsx to use providerApplications")
