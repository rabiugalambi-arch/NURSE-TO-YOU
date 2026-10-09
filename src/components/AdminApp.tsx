import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc, getDocs, query, where, setDoc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Users, FileText, CheckCircle, XCircle, Search, Activity, UserCircle, Store, Stethoscope, Phone, Mail, ShieldAlert, ShieldCheck, Clock, LayoutDashboard, MapPin, X, Menu, Settings, LogOut } from 'lucide-react';;
import { PharmacyAdminApp } from './pharmacy/PharmacyAdminApp';
import { Provider, Booking } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications' | 'pharmacy' | 'physician_bookings';

export function AdminApp() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState('');

  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [physicianBookings, setPhysicianBookings] = useState<any[]>([]);
  const [physicianFilter, setPhysicianFilter] = useState('All');

  useEffect(() => {
    let unsubProviders: any;
    let unsubBookings: any;
    let unsubServices: any;
    let unsubApps: any;
    let unsubPhysicianBookings: any;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          const isUserAdmin = userDoc.exists() && userDoc.data().role === 'admin';
          
          if (adminDoc.exists() || isUserAdmin) {
            setIsAdmin(true);
            
            unsubProviders = onSnapshot(collection(db, 'providers'), (snap) => {
              const data: Provider[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Provider));
              setProviders(data);
            }, (err) => console.warn('Provider snapshot error (likely auth change):', err.message));
            unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
              const data: Booking[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() } as Booking));
              setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
            }, (err) => console.warn('Bookings snapshot error (likely auth change):', err.message));
            
            
            unsubPhysicianBookings = onSnapshot(collection(db, 'physician_bookings'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setPhysicianBookings(data);
            }, (err) => console.warn('Physician bookings snapshot error:', err.message));
            unsubApps = onSnapshot(collection(db, 'providerApplications'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setApplications(data);
            }, (err) => console.warn('Apps snapshot error:', err.message));
            onSnapshot(collection(db, 'serviceCategories'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setCategories(data);
            }, (err) => console.warn('Categories snapshot error:', err.message));
            unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setServices(data);
            }, (err) => console.warn('Services snapshot error (likely auth change):', err.message));
          } else {
            setIsAdmin(false);
            setError("You do not have admin privileges.");
            await signOut(auth);
          }
        } catch (error: any) {
          console.warn(error?.message || error?.code || 'Unknown error object', error);
          setIsAdmin(false);
          setError("Failed to verify admin status");
          await signOut(auth).catch(() => {});
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        if (unsubProviders) unsubProviders();
        if (unsubBookings) unsubBookings();
        if (unsubPhysicianBookings) unsubPhysicianBookings();
        if (unsubServices) unsubServices();
        if (unsubApps) unsubApps();
      }
      setLoading(false);
    }, (err) => console.warn('Snapshot error in AdminApp.tsx:', err));
    
    return () => {
      unsubscribe();
      if (unsubProviders) unsubProviders();
      if (unsubBookings) unsubBookings();
      if (unsubServices) unsubServices();
        if (unsubApps) unsubApps();
    };
  }, []);

  const [applications, setApplications] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newService, setNewService] = useState({ name: '', price: '', roles: 'RN, LPN', categoryId: '', description: '' });
  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleSetupAdmin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'admins', cred.user.uid), {
        role: 'superadmin',
        createdAt: Date.now()
      });
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    }
    setLoading(false);
  };

  
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    await setDoc(doc(db, 'serviceCategories', newCategory.name), {
      name: newCategory.name,
      active: true
    });
    setNewCategory({ name: '' });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    await setDoc(doc(collection(db, 'services')), {
      name: newService.name,
      price: Number(newService.price),
      roles: newService.roles.split(',').map(r => r.trim()).filter(Boolean),
      categoryId: newService.categoryId,
      description: newService.description,
      active: true
    });
    setNewService({ name: '', price: '', roles: 'RN, LPN', categoryId: '', description: '' });
  };

  // ... (keep rest)

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
          <div className="flex justify-center mb-6 text-red-500">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProviderStatus = async (providerId: string, verified: boolean) => {
    try {
      await updateDoc(doc(db, 'providers', providerId), { 
        verified,
        applicationStatus: verified ? 'approved' : 'suspended'
      });
      await updateDoc(doc(db, 'providerApplications', providerId), {
        applicationStatus: verified ? 'approved' : 'suspended'
      }).catch(() => {});
    } catch (err) {
      console.warn(err?.message || err?.code || 'Unknown error object', err);
    }
  };

  const renderDashboard = () => {
    const verifiedProviders = providers.filter(p => p.verified).length;
    const pendingProviders = providers.length - verifiedProviders;
    const activeProviders = providers.filter(p => p.available).length;
    
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
    const pendingBookings = bookings.filter(b => b.status === 'REQUESTED' || b.status === 'ACCEPTED').length;

    // Chart Data
    const bookingsByStatus = [
      { name: 'Pending', count: pendingBookings },
      { name: 'Completed', count: completedBookings },
      { name: 'Cancelled', count: cancelledBookings },
    ];

    const recentBookings = bookings.slice(0, 3);
    const pendingVerificationsList = providers.filter(p => !p.verified).slice(0, 3);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Providers" value={providers.length} icon={<Users className="text-blue-500" />} />
          <StatCard title="Verified Providers" value={verifiedProviders} icon={<ShieldCheck className="text-green-500" />} />
          <StatCard title="Pending Verifications" value={pendingProviders} icon={<Clock className="text-orange-500" />} />
          <StatCard title="Active (Online)" value={activeProviders} icon={<Activity className="text-teal-500" />} />
          
          <StatCard title="Total Bookings" value={bookings.length} icon={<LayoutDashboard className="text-indigo-500" />} />
          <StatCard title="Pending Bookings" value={pendingBookings} icon={<Clock className="text-yellow-500" />} />
          <StatCard title="Completed Bookings" value={completedBookings} icon={<CheckCircle className="text-green-500" />} />
          <StatCard title="Cancelled Bookings" value={cancelledBookings} icon={<XCircle className="text-red-500" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Bookings Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsByStatus}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="text-blue-500" size={20}/> 
              System Notifications
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {pendingVerificationsList.map(p => (
                <div key={`prov-${p.id}`} className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-xs text-orange-600 font-semibold mb-1">Provider Verification</p>
                  <p className="text-sm text-gray-800">{p.name} ({p.professionalRole}) is waiting for verification approval.</p>
                </div>
              ))}
              {recentBookings.map(b => (
                <div key={`book-${b.id}`} className={`p-3 border rounded-lg ${b.status === 'CANCELLED' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${b.status === 'CANCELLED' ? 'text-red-600' : 'text-blue-600'}`}>
                    {b.status === 'CANCELLED' ? 'Booking Cancelled' : 'New Booking'}
                  </p>
                  <p className="text-sm text-gray-800">Booking {b.id.substring(0,6)} for {b.service}.</p>
                </div>
              ))}
              {pendingVerificationsList.length === 0 && recentBookings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent notifications.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };


  const handleUpdateApplicationStatus = async (providerId: string, status: 'approved' | 'rejected' | 'requires_information' | 'suspended', reason?: string) => {
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
      await updateDoc(doc(db, 'providerApplications', providerId), appUpdateData).catch(() => {});
    } catch (err: any) {
      console.warn(err?.message || err?.code || 'Unknown error object', err);
    }
  };

  const renderApplications = () => {
    const apps = applications.filter(p => p.applicationStatus && p.applicationStatus !== 'draft');
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
                    <p className="text-sm text-gray-500">
                      <span className="font-medium capitalize text-gray-700">{p.type === 'physician' ? 'Physician' : 'Nurse'}</span> • {p.type === 'physician' ? p.specialty : p.professionalRole}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.qualification}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.applicationStatus === 'approved' ? 'bg-green-100 text-green-800' : p.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' : p.applicationStatus === 'requires_information' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.applicationStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700 space-y-2 mb-6 flex-1">
                  <p><strong>License:</strong> {p.licenseNumber}</p>
                  <p><strong>Institution:</strong> {p.institution} ({p.qualificationYear})</p>
                  {p.type === 'physician' && (
                    <>
                      <p><strong>Consultation Fee:</strong> ₦{p.consultationFee}</p>
                      <p><strong>Clinic:</strong> {p.clinicLocation}</p>
                    </>
                  )}
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

  const renderProviders = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Provider Management</h2>
        <button
          onClick={async () => {
            try {
              let count = 0;
              for (const prov of providers) {
                if (prov.isBusy) {
                  await updateDoc(doc(db, 'providers', prov.id), {
                    isBusy: false,
                    currentBookingId: null
                  });
                  count++;
                }
              }
              alert(`Reset busy status for ${count} provider(s).`);
            } catch(e: any) {
              alert("Error resetting providers: " + e.message);
            }
          }}
          className="px-3.5 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 flex items-center gap-1.5 shadow-sm"
        >
          <Clock size={14} className="text-blue-900" /> Reset Stuck Busy Providers
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type & Role</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Services</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {providers.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={12}/> {p.serviceArea || 'Kano State'} {p.latitude ? `(${p.latitude.toFixed(3)}, ${p.longitude.toFixed(3)})` : ''}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  <div className="font-medium capitalize text-gray-900">{p.type === 'physician' ? 'Physician' : 'Nurse'}</div>
                  <div className="text-xs text-gray-500">{p.type === 'physician' ? p.specialty : p.professionalRole}</div>
                </td>
                <td className="px-6 py-4">
                  {p.verified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                  {p.isBusy ? (
                    <div className="inline-flex flex-col ml-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Busy
                      </span>
                      {p.currentBookingId && (
                        <span className="text-[10px] text-orange-600 mt-1">ID: {p.currentBookingId.substring(0,6)}...</span>
                      )}
                    </div>
                  ) : p.available ? (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Available
                    </span>
                  ) : (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Offline
                    </span>
                  )}
                  {p.lastLocationUpdate && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      Last loc: {new Date(p.lastLocationUpdate).toLocaleTimeString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {p.services.join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {p.isBusy && (
                    <button
                      onClick={async () => {
                        try {
                          await updateDoc(doc(db, 'providers', p.id), {
                            isBusy: false,
                            currentBookingId: null
                          });
                          alert(`Provider ${p.name} released from busy state.`);
                        } catch(e: any) {
                          alert("Error: " + e.message);
                        }
                      }}
                      className="text-xs text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-lg font-bold"
                    >
                      Free Busy
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, 'providers', p.id), {
                          available: !p.available
                        });
                      } catch(e: any) {
                        alert("Error updating availability: " + e.message);
                      }
                    }}
                    className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg font-bold"
                  >
                    {p.available ? 'Set Offline' : 'Set Available'}
                  </button>
                  {p.verified ? (
                    <button onClick={() => handleUpdateProviderStatus(p.id, false)} className="text-sm text-red-600 hover:text-red-800 font-medium">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => handleUpdateProviderStatus(p.id, true)} className="text-sm text-green-600 hover:text-green-800 font-medium">
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {providers.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No providers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">ID / Time</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client ID</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider ID</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs text-gray-500 mb-1">{b.id}</div>
                  <div className="font-medium text-gray-900">{format(new Date(b.createdAt), 'MMM d, h:mm a')}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{b.patientId.substring(0,8)}...</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{b.providerId}</td>
                <td className="px-6 py-4 text-gray-900">
                  {b.service}
                  <div className="text-sm font-semibold text-green-600 mt-1">₦{b.price?.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${b.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      b.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {b.status}
                  </span>
                </td>
                                <td className="px-6 py-4 text-sm">
                  {b.paymentStatus === 'paid_test' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">TEST PAID</span>
                  ) : b.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">PAID</span>
                  ) : (
                    <span className="text-gray-500 font-medium">Pending</span>
                  )}
                  {b.paymentMode === 'test' && <div className="text-[10px] text-gray-400 mt-1 uppercase">Test Mode</div>}
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-500">
                  <div className="flex items-center justify-end gap-1 text-xs">
                    <MapPin size={12}/> {b.patientLatitude?.toFixed(4)}, {b.patientLongitude?.toFixed(4)}
                  </div>
                </td>
              </tr>
            ))}
             {bookings.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bookings found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleToggleService = async (serviceId: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'services', serviceId), { active: !currentStatus });
  };

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Add Category</h3>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
            <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-64" placeholder="e.g. Wound Care" />
          </div>
          <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Add Category
          </button>
        </form>
      </div>

      <h3 className="font-bold text-gray-900 mb-4">Add Service</h3>
      <form onSubmit={handleAddService} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select required value={newService.categoryId} onChange={e => setNewService({...newService, categoryId: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48">
            <option value="">Select Category</option>
            {(categories.length > 0 ? categories : [{"id":"MEDICATION","name":"MEDICATION","active":true},{"id":"WOUND CARE","name":"WOUND CARE","active":true},{"id":"RESPIRATORY CARE","name":"RESPIRATORY CARE","active":true},{"id":"HEALTH MONITORING","name":"HEALTH MONITORING","active":true},{"id":"URINARY CARE","name":"URINARY CARE","active":true},{"id":"GASTRO CARE","name":"GASTRO CARE","active":true},{"id":"PHYSICAL CARE","name":"PHYSICAL CARE","active":true},{"id":"DIAGNOSTIC CARE","name":"DIAGNOSTIC CARE","active":true},{"id":"OTHER LABORATORY SERVICES","name":"OTHER LABORATORY SERVICES","active":true},{"id":"PREGNANCY CARE","name":"PREGNANCY CARE","active":true},{"id":"FAMILY PLANNING SERVICES","name":"FAMILY PLANNING SERVICES","active":true},{"id":"GENERAL HEALTH EDUCATION","name":"GENERAL HEALTH EDUCATION","active":true},{"id":"ORAL HEALTH","name":"ORAL HEALTH","active":true},{"id":"EYE CARE","name":"EYE CARE","active":true},{"id":"EAR, NOSE AND THROAT (ENT) CARE","name":"EAR, NOSE AND THROAT (ENT) CARE","active":true},{"id":"SKIN CARE","name":"SKIN CARE","active":true},{"id":"ORTHOPEDIC CARE","name":"ORTHOPEDIC CARE","active":true},{"id":"MENTAL HEALTH","name":"MENTAL HEALTH","active":true},{"id":"PEDIATRIC - KIDS HEALTH","name":"PEDIATRIC / KIDS HEALTH","active":true},{"id":"AMBULANCE SERVICE","name":"AMBULANCE SERVICE","active":true}]).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input type="text" required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48" placeholder="Short desc" />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Service Name</label>
          <input type="text" required value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48" placeholder="e.g. Wound Care" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estimated Price (₦)</label>
          <input type="number" required value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-32" placeholder="e.g. 15000" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Allowed Roles (comma separated)</label>
          <input type="text" required value={newService.roles} onChange={e => setNewService({...newService, roles: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48" placeholder="e.g. RN, LPN" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 h-10">
          + Add Service
        </button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service Name</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estimated Price</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Allowed Roles</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {services.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4 text-gray-500 text-sm">{s.categoryId}</td>
<td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                <td className="px-6 py-4 text-gray-700">₦{s.price?.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{s.roles?.join(', ')}</td>
                <td className="px-6 py-4">
                  {s.active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleToggleService(s.id, s.active)} 
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {s.active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No services defined. Add one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleToggleClientStatus = async (clientId: string) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      // In a real app we'd fetch first to check current status. For now just set suspended=true/false
      // Let's just alert since it requires fetching or a separate snapshot
      alert('Client status management would update firestore clients collection here.');
    } catch (e) {
      console.warn(e);
    }
  };

  const renderClients = () => {
    // Derive unique clients from bookings
    const uniqueClients = Array.from(new Set(bookings.map(b => b.patientId))).map(id => {
      const clientBookings = bookings.filter(b => b.patientId === id);
      return {
        id,
        bookingCount: clientBookings.length,
        lastBooking: clientBookings[0]?.createdAt
      };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Client Management</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client ID (Anonymized)</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Bookings</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uniqueClients.map(c => (
                <tr key={c.id}>
                  <td className="px-6 py-4 font-mono text-sm text-gray-900">{c.id}</td>
                  <td className="px-6 py-4 text-gray-700">{c.bookingCount}</td>
                  <td className="px-6 py-4 text-gray-700">{c.lastBooking ? format(new Date(c.lastBooking), 'MMM d, yyyy') : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleToggleClientStatus(c.id)} className="text-sm text-red-600 hover:text-red-800 font-medium">
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
              {uniqueClients.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No active clients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative z-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" />
          <h1 className="font-bold text-lg tracking-wide">NTY Admin</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-slate-800">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-full transition-transform transform md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="text-blue-400" />
            <h1 className="font-bold text-lg tracking-wide">NTY Admin</h1>
          </div>
          <p className="text-xs text-slate-400">Secure Access Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20}/>} label="Providers" active={activeView === 'providers'} onClick={() => { setActiveView('providers'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<ShieldCheck size={20}/>} label="Provider Apps" active={activeView === 'applications'} onClick={() => { setActiveView('applications'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Activity size={20}/>} label="Bookings" active={activeView === 'bookings'} onClick={() => { setActiveView('bookings'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Stethoscope size={20}/>} label="Physician Bookings" active={activeView === 'physician_bookings'} onClick={() => { setActiveView('physician_bookings'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20}/>} label="Clients" active={activeView === 'clients'} onClick={() => { setActiveView('clients'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20}/>} label="Services" active={activeView === 'services'} onClick={() => { setActiveView('services'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Store size={20}/>} label="Pharmacy" active={activeView === 'pharmacy'} onClick={() => { setActiveView('pharmacy'); setIsMobileMenuOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 w-full px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50">
        {activeView === 'dashboard' && renderDashboard()}
        
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${physicianFilter === f ? 'bg-blue-50 text-blue-900' : 'text-gray-500 hover:text-gray-900'}`}
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
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            b.bookingStatus === 'completed' ? 'bg-teal-100 text-teal-800' :
                            b.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                            b.bookingStatus === 'physician_arranged' ? 'bg-blue-100 text-blue-800' :
                            b.bookingStatus === 'contacting_client' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {b.bookingStatus.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          
                          <div className="mt-2">
                            {b.paymentStatus === 'paid_test' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">TEST PAID</span>
                            ) : b.paymentStatus === 'paid' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">PAID</span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">UNPAID</span>
                            )}
                          </div>
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
                                  message: `Your physician booking ${b.bookingId} is now ${e.target.value.replace(/_/g, ' ')}.`,
                                  type: 'info',
                                  createdAt: serverTimestamp(),
                                  read: false
                                });
                              } catch(err) {
                                console.warn('Error updating status', err);
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

        {activeView === 'pharmacy' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pharmacy Store Management</h2>
            <PharmacyAdminApp />
          </div>
        )}
        {activeView === 'providers' && renderProviders()}
        {activeView === 'bookings' && renderBookings()}
        {activeView === 'clients' && renderClients()}
        {activeView === 'services' && renderServices()}
          {activeView === 'applications' && renderApplications()}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
      <div className="p-3 bg-gray-50 rounded-xl">
        {icon}
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors font-medium text-sm
        ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
