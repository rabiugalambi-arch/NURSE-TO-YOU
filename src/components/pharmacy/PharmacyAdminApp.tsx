import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, setDoc, onSnapshot, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PharmacyProduct, PharmacyOrder, PackageOption } from './types';
import { Search, Plus, Edit, Trash2, CheckCircle, XCircle, AlertCircle, Package, Settings, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type AdminPharmacyTab = 'products' | 'orders' | 'prescriptions';

export function PharmacyAdminApp() {
  const [activeTab, setActiveTab] = useState<AdminPharmacyTab>('orders');
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PharmacyProduct | null>(null);

  // Form State
  const [prodForm, setProdForm] = useState<Partial<PharmacyProduct>>({
    name: '', genericName: '', brandName: '', isBrand: false, category: 'Pain Relief', 
    description: '', uses: '', manufacturer: '', strength: '', dosageForm: '', 
    price: 0, stockQuantity: 0, prescriptionRequired: false, active: true, imageUrl: '', packages: []
  });

  const [newPackage, setNewPackage] = useState<PackageOption>({ id: '', packageSize: '', price: 0, unitPrice: 0, isBestValue: false });

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'pharmacyProducts'), (snap) => {
      const prods: PharmacyProduct[] = [];
      snap.forEach(d => prods.push({ id: d.id, ...d.data() } as PharmacyProduct));
      setProducts(prods);
    }, (err) => console.warn('Snapshot error in PharmacyAdminApp.tsx:', err));

    const unsubOrders = onSnapshot(collection(db, 'pharmacyOrders'), (snap) => {
      const ords: PharmacyOrder[] = [];
      snap.forEach(d => ords.push({ id: d.id, ...d.data() } as PharmacyOrder));
      ords.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(ords);
    }, (err) => console.warn('Snapshot error in PharmacyAdminApp.tsx:', err));

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const addPackageToForm = () => {
    if (!newPackage.packageSize || newPackage.price <= 0) return;
    setProdForm(prev => {
      const updatedPackages = [...(prev.packages || []), { ...newPackage, id: Math.random().toString(36).substr(2, 9) }];
      // Recalculate minimum price fallback
      const minPrice = Math.min(...updatedPackages.map(p => p.price));
      return { ...prev, packages: updatedPackages, price: minPrice };
    });
    setNewPackage({ id: '', packageSize: '', price: 0, unitPrice: 0, isBestValue: false });
  };

  const removePackage = (id: string) => {
    setProdForm(prev => {
      const updatedPackages = (prev.packages || []).filter(p => p.id !== id);
      const minPrice = updatedPackages.length > 0 ? Math.min(...updatedPackages.map(p => p.price)) : 0;
      return { ...prev, packages: updatedPackages, price: minPrice };
    });
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct?.id) {
        await updateDoc(doc(db, 'pharmacyProducts', editingProduct.id), {
          ...prodForm,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'pharmacyProducts'), {
          ...prodForm,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      console.warn(err);
      alert("Error saving product");
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, 'pharmacyProducts', id));
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'pharmacyOrders', orderId), {
      orderStatus: status,
      updatedAt: Date.now()
    });
  };

  const updatePrescriptionStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, 'pharmacyOrders', orderId), {
      prescriptionStatus: status,
      updatedAt: Date.now()
    });
  };

  const pendingPrescriptions = orders.filter(o => o.prescriptionStatus === 'Pending Review');

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[750px] font-sans">
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        <button 
          onClick={() => setActiveTab('orders')}
          className={cn("flex-1 py-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'orders' ? "border-blue-900 text-blue-900 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          Orders
        </button>
        <button 
          onClick={() => setActiveTab('prescriptions')}
          className={cn("flex-1 py-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'prescriptions' ? "border-blue-900 text-blue-900 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          Prescriptions
          {pendingPrescriptions.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingPrescriptions.length}</span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={cn("flex-1 py-4 text-sm font-bold border-b-2 transition-colors", activeTab === 'products' ? "border-blue-900 text-blue-900 bg-white" : "border-transparent text-gray-500 hover:text-gray-700")}
        >
          Inventory / Catalog
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {activeTab === 'products' && (
          <div>
            {!isAddingProduct && !editingProduct ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Pharmacy Catalog</h2>
                  <button onClick={() => {
                    setProdForm({
                      name: '', genericName: '', brandName: '', isBrand: false, category: 'Pain Relief', 
                      description: '', uses: '', manufacturer: '', strength: '', dosageForm: '', 
                      price: 0, stockQuantity: 0, prescriptionRequired: false, active: true, imageUrl: '', packages: []
                    });
                    setIsAddingProduct(true);
                  }} className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-800 transition-colors">
                    <Plus className="w-4 h-4" /> Add Product
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                      <tr>
                        <th className="p-4">Product</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Packages</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-8 h-8 object-contain" /> : <Package className="w-5 h-5 text-gray-400" />}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                  {p.name}
                                  {p.isBrand && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 rounded uppercase font-bold tracking-wider">Brand</span>}
                                </p>
                                <p className="text-xs text-gray-500">{p.genericName}</p>
                                {p.prescriptionRequired && <span className="text-[9px] bg-red-100 text-red-700 px-1 py-0.5 rounded uppercase font-bold mt-1 inline-block">Rx Req</span>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-600 font-medium">{p.category}</td>
                          <td className="p-4">
                            <span className="text-gray-900 font-medium">{p.packages?.length || 0} options</span>
                            <div className="text-xs text-gray-500 mt-1">Starts at ₦{p.price?.toLocaleString()}</div>
                          </td>
                          <td className="p-4">
                            <span className={cn("px-3 py-1 rounded-full text-xs font-bold", p.stockQuantity > 10 ? "bg-green-100 text-green-700" : p.stockQuantity > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700")}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button onClick={() => { setEditingProduct(p); setProdForm(p); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteProduct(p.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  <button onClick={() => { setIsAddingProduct(false); setEditingProduct(null); }} className="text-gray-500 hover:text-gray-900 text-sm font-bold bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
                </div>
                
                <form onSubmit={saveProduct} className="grid grid-cols-2 gap-x-6 gap-y-5">
                  <div className="col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 text-blue-900 flex items-center gap-2"><Info className="w-4 h-4"/> Basic Info</h3>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Display Name</label>
                    <input type="text" required value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Generic Name</label>
                    <input type="text" required value={prodForm.genericName} onChange={e => setProdForm({...prodForm, genericName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
                      <input type="checkbox" checked={prodForm.isBrand} onChange={e => setProdForm({...prodForm, isBrand: e.target.checked})} className="w-4 h-4 text-blue-900" />
                      <span className="text-sm font-bold text-amber-900">Is Branded Medicine?</span>
                    </label>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Brand Name (if applicable)</label>
                    <input type="text" value={prodForm.brandName || ''} onChange={e => setProdForm({...prodForm, brandName: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" disabled={!prodForm.isBrand} />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category / Classification</label>
                    <select required value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900">
                      <option value="Pain Relief">Pain Relief</option>
                      <option value="Antibiotics">Antibiotics</option>
                      <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                      <option value="Cold & Flu">Cold & Flu</option>
                      <option value="Skin Care">Skin Care</option>
                      <option value="Diabetes Care">Diabetes Care</option>
                      <option value="Cardiovascular">Cardiovascular</option>
                      <option value="Maternal & Women's Health">Maternal & Women's Health</option>
                      <option value="Children's Health">Children's Health</option>
                      <option value="First Aid">First Aid</option>
                      <option value="Medical Devices">Medical Devices</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Manufacturer</label>
                    <input type="text" value={prodForm.manufacturer} onChange={e => setProdForm({...prodForm, manufacturer: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Quantity (Total)</label>
                    <input type="number" required min="0" value={prodForm.stockQuantity} onChange={e => setProdForm({...prodForm, stockQuantity: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Image URL (Optional)</label>
                    <input type="text" value={prodForm.imageUrl} onChange={e => setProdForm({...prodForm, imageUrl: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Strength (e.g. 500mg)</label>
                    <input type="text" value={prodForm.strength} onChange={e => setProdForm({...prodForm, strength: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosage Form (e.g. Tablet, Syrup)</label>
                    <input type="text" value={prodForm.dosageForm} onChange={e => setProdForm({...prodForm, dosageForm: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea rows={2} value={prodForm.description} onChange={e => setProdForm({...prodForm, description: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900"></textarea>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Uses (Comma separated)</label>
                    <input type="text" value={prodForm.uses} onChange={e => setProdForm({...prodForm, uses: e.target.value})} placeholder="e.g. Headaches, Fever, Pain relief" className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:border-blue-900" />
                  </div>
                  
                  <div className="col-span-2 py-4 border-y border-gray-100 my-2">
                    <label className="flex items-center gap-3 cursor-pointer p-4 bg-red-50 rounded-xl border border-red-100">
                      <input type="checkbox" checked={prodForm.prescriptionRequired} onChange={e => setProdForm({...prodForm, prescriptionRequired: e.target.checked})} className="w-5 h-5 text-red-600 rounded" />
                      <div>
                        <span className="text-sm font-bold text-red-900 block">Requires Prescription</span>
                        <span className="text-xs text-red-700">Customers must upload a valid Rx document before adding to cart.</span>
                      </div>
                    </label>
                  </div>

                  {/* Multiple Packages Section */}
                  <div className="col-span-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 text-blue-900 flex items-center gap-2"><Package className="w-4 h-4"/> Package Options & Pricing</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 mb-4">
                      {prodForm.packages && prodForm.packages.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {prodForm.packages.map(pkg => (
                            <div key={pkg.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <div>
                                <span className="font-bold text-gray-900 block">{pkg.packageSize}</span>
                                <span className="text-xs text-gray-500">Unit Price: ₦{pkg.unitPrice} {pkg.isBestValue && <span className="text-teal-600 font-bold ml-1">(Best Value)</span>}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-blue-900 text-lg">₦{pkg.price.toLocaleString()}</span>
                                <button type="button" onClick={() => removePackage(pkg.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4 italic">No packages added yet. Add at least one.</p>
                      )}
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-4 sm:col-span-1">
                          <input type="text" placeholder="Size (e.g. 10 tabs)" value={newPackage.packageSize} onChange={e => setNewPackage({...newPackage, packageSize: e.target.value})} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <input type="number" placeholder="Total Price ₦" value={newPackage.price || ''} onChange={e => setNewPackage({...newPackage, price: Number(e.target.value)})} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <input type="number" placeholder="Unit Price ₦ (for comparison)" value={newPackage.unitPrice || ''} onChange={e => setNewPackage({...newPackage, unitPrice: Number(e.target.value)})} className="w-full p-2 border border-gray-200 rounded-lg text-sm" />
                        </div>
                        <div className="col-span-4 sm:col-span-1 flex items-center justify-between">
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={newPackage.isBestValue} onChange={e => setNewPackage({...newPackage, isBestValue: e.target.checked})} /> Best Val
                          </label>
                          <button type="button" onClick={addPackageToForm} className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap">Add Option</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 mt-4 flex justify-end">
                    <button type="submit" className="bg-teal-600 text-white font-bold py-3 px-10 rounded-xl hover:bg-teal-700 shadow-md">
                      Save Product to Catalog
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pharmacy Orders</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-4 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Order #{order.id?.substring(0, 8).toUpperCase()}</h3>
                      <p className="text-sm text-gray-500 font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-900 text-xl">₦{order.totalAmount.toLocaleString()}</p>
                      <select 
                        value={order.orderStatus}
                        onChange={(e) => updateOrderStatus(order.id!, e.target.value)}
                        className={cn(
                          "mt-2 text-sm border border-gray-200 rounded-lg p-1.5 font-bold outline-none",
                          order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer</h4>
                      <p className="text-sm font-bold text-gray-900">{order.deliveryAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress.email}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Delivery ({order.deliveryMethod})</h4>
                      <p className="text-sm text-gray-900 font-medium">{order.deliveryDate} | {order.deliveryTimeSlot}</p>
                      <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress.address}, {order.deliveryAddress.city}</p>
                      {order.deliveryAddress.instructions && <p className="text-xs italic text-gray-500 mt-1">Note: {order.deliveryAddress.instructions}</p>}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Items</h4>
                      <div className="space-y-1.5">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-gray-700"><span className="font-bold">{item.quantity}x</span> {item.name} <span className="text-xs text-gray-400">({item.packageName})</span></span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                        Payment: <span className="font-bold text-gray-900">{order.paymentMethod}</span> ({order.paymentStatus})
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-gray-500 py-10">No orders found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Prescription Reviews</h2>
            <div className="space-y-6">
              {orders.filter(o => o.prescriptionStatus !== 'Not Required').map(order => (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-50 pb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Review for Order #{order.id?.substring(0, 8).toUpperCase()}</h3>
                      <p className="text-sm text-gray-500">Customer: <span className="font-medium text-gray-900">{order.deliveryAddress.fullName}</span></p>
                    </div>
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                      order.prescriptionStatus === 'Pending Review' ? "bg-amber-100 text-amber-800 border border-amber-200" :
                      order.prescriptionStatus === 'Approved' ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                    )}>
                      {order.prescriptionStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">Uploaded Document</h4>
                      {order.prescriptionData ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 bg-gray-50 flex items-center justify-center min-h-[200px]">
                          {order.prescriptionData.includes('application/pdf') ? (
                             <div className="text-center text-gray-500 flex flex-col items-center">
                               <Package className="w-12 h-12 mb-2 text-gray-400"/>
                               <p className="font-bold">PDF Document</p>
                               <a href={order.prescriptionData} download="prescription.pdf" className="text-blue-600 text-sm hover:underline mt-2">Download File</a>
                             </div>
                          ) : (
                             <img src={order.prescriptionData} alt="Prescription" className="max-w-full max-h-[300px] object-contain rounded" />
                          )}
                        </div>
                      ) : (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 font-medium">
                          <AlertCircle className="w-5 h-5" /> No document uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Requested Rx Items</h4>
                      <ul className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-2 mb-6">
                        {order.items.filter(i => i.prescriptionRequired).map((item, i) => (
                          <li key={i} className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{item.name} <span className="text-xs text-gray-500 font-normal">({item.packageName})</span></span>
                            <span className="text-sm font-bold text-gray-700">Qty: {item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {order.prescriptionStatus === 'Pending Review' && (
                        <div>
                          <p className="text-xs text-gray-500 mb-3 italic">Please carefully review the uploaded document against the requested items. Do they match and is the prescription valid?</p>
                          <div className="flex gap-3">
                            <button onClick={() => updatePrescriptionStatus(order.id!, 'Approved')} className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 flex justify-center items-center gap-2 shadow-sm transition-colors">
                              <CheckCircle className="w-5 h-5" /> Approve Dispensing
                            </button>
                            <button onClick={() => updatePrescriptionStatus(order.id!, 'Rejected')} className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 flex justify-center items-center gap-2 shadow-sm transition-colors">
                              <XCircle className="w-5 h-5" /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {orders.filter(o => o.prescriptionStatus !== 'Not Required').length === 0 && (
                <p className="text-center text-gray-500 py-10">No prescriptions require review.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
