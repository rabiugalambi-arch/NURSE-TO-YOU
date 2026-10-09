import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { PharmacyProduct, CartItem, PharmacyOrder, PackageOption } from './types';
import { ArrowLeft, Search, ShoppingCart, Info, CheckCircle, Package, Clock, AlertCircle, FileText, ChevronRight, Store, FileWarning, CreditCard, Filter, ArrowUpDown, Lock, X, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

type PharmacyStep = 'home' | 'product' | 'cart' | 'checkout' | 'orders' | 'order_details';
type CheckoutInternalStep = 'info' | 'delivery' | 'payment' | 'confirmation';

export function PharmacyClientApp({ patientId, onBack }: { patientId: string, onBack: () => void }) {
  const [step, setStep] = useState<PharmacyStep>('home');
  const [checkoutStep, setCheckoutStep] = useState<CheckoutInternalStep>('info');
  
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('default');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<PharmacyProduct | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageOption | null>(null);
  const [relatedProduct, setRelatedProduct] = useState<PharmacyProduct | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '', phone: '', email: '', address: '', city: 'Kano', state: 'Kano', instructions: ''
  });
  const [deliveryMethod, setDeliveryMethod] = useState<'Standard' | 'Express'>('Standard');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState<string>('8:00 AM - 11:00 AM');
  
  const [prescriptionData, setPrescriptionData] = useState<string>('');
  
  // Payment Mock
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'wallet' | 'test'>('test');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [cardMock, setCardMock] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const [error, setError] = useState('');

  const categories = ['All', 'Pain Relief', 'Antibiotics', 'Vitamins & Supplements', 'Cold & Flu', 'Skin Care', 'Diabetes Care', 'Cardiovascular', "Maternal & Women's Health", "Children's Health", 'First Aid', 'Medical Devices'];

  useEffect(() => {
    const unsubProducts = onSnapshot(query(collection(db, 'pharmacyProducts'), where('active', '==', true)), (snap) => {
      const prods: PharmacyProduct[] = [];
      snap.forEach(d => prods.push({ id: d.id, ...d.data() } as PharmacyProduct));
      setProducts(prods);
      setLoading(false);
    }, (err) => console.warn('Snapshot error in PharmacyClientApp.tsx:', err));

    const unsubOrders = onSnapshot(query(collection(db, 'pharmacyOrders'), where('clientId', '==', patientId)), (snap) => {
      const ords: PharmacyOrder[] = [];
      snap.forEach(d => ords.push({ id: d.id, ...d.data() } as PharmacyOrder));
      ords.sort((a, b) => b.createdAt - a.createdAt);
      setOrders(ords);
    }, (err) => console.warn('Snapshot error in PharmacyClientApp.tsx:', err));

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [patientId]);

  // Product Selection & Generic/Brand linking
  const handleProductSelect = (p: PharmacyProduct) => {
    setSelectedProduct(p);
    setSelectedPackage(p.packages?.[0] || null);
    
    // Find generic/brand counterpart
    const related = products.find(alt => 
      alt.id !== p.id && 
      alt.genericName.toLowerCase() === p.genericName.toLowerCase() && 
      alt.isBrand !== p.isBrand
    );
    setRelatedProduct(related || null);
    setStep('product');
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.brandName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'a-z') return a.name.localeCompare(b.name);
    if (sortBy === 'z-a') return b.name.localeCompare(a.name);
    return 0; // default
  });

  const addToCart = (product: PharmacyProduct, pkg: PackageOption, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedPackage.id === pkg.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id && item.selectedPackage.id === pkg.id 
          ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { product, selectedPackage: pkg, quantity: qty }];
    });
    alert(`${product.name} (${pkg.packageSize}) added to cart`);
    setStep('home');
  };

  const updateCartQuantity = (productId: string, pkgId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId && item.selectedPackage.id === pkgId) {
        const newQ = item.quantity + delta;
        if (newQ > 0) return { ...item, quantity: newQ };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string, pkgId: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === productId && item.selectedPackage.id === pkgId)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) setPrescriptionData(event.target.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const getCartTotals = () => {
    const subtotal = cart.reduce((acc, item) => acc + (item.selectedPackage.price * item.quantity), 0);
    const fee = deliveryMethod === 'Express' ? 2500 : 1000;
    const tax = Math.round(subtotal * 0.05); // 5% mock tax
    return { subtotal, deliveryFee: fee, tax, total: subtotal + fee + tax };
  };

  const processMockPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Fake validation
    if (paymentMethod === 'card') {
      if (cardMock.number.replace(/\s/g, '').length < 15) return setError("Invalid card number");
      if (!cardMock.expiry || !cardMock.cvc) return setError("Incomplete card details");
    }

    setPaymentStatus('processing');
    
    // Simulate API call
    setTimeout(() => {
      if (cardMock.number.includes('4242 4242 4242 4242') && cardMock.name.toLowerCase().includes('fail')) {
        setPaymentStatus('failed');
        setError('Card was declined. Please try another method.');
      } else {
        setPaymentStatus('success');
        submitOrder();
      }
    }, 2500);
  };

  const submitOrder = async () => {
    const hasPrescriptionReq = cart.some(item => item.product.prescriptionRequired);
    const { subtotal, deliveryFee, tax, total } = getCartTotals();

    try {
      const orderData: PharmacyOrder = {
        clientId: patientId,
        items: cart.map(item => ({
          productId: item.product.id!,
          name: item.product.name,
          packageName: item.selectedPackage.packageSize,
          price: item.selectedPackage.price,
          quantity: item.quantity,
          prescriptionRequired: item.product.prescriptionRequired
        })),
        subtotal,
        deliveryFee,
        tax,
        totalAmount: total,
        paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Mobile Wallet',
        paymentStatus: 'successful',
        orderStatus: 'Pending',
        prescriptionStatus: hasPrescriptionReq ? 'Pending Review' : 'Not Required',
        deliveryAddress: checkoutForm,
        deliveryMethod,
        deliveryDate,
        deliveryTimeSlot,
        prescriptionData: hasPrescriptionReq ? prescriptionData : undefined,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const docRef = await addDoc(collection(db, 'pharmacyOrders'), orderData);
      
      // Clear Cart
      setCart([]);
      setPrescriptionData('');
      
      // Set to confirmation viewing the new order
      setSelectedOrder({ id: docRef.id, ...orderData });
      setCheckoutStep('confirmation');
      
    } catch (err: any) {
      setPaymentStatus('failed');
      setError(err.message || 'Failed to place order');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => {
            if (step === 'checkout') {
              if (checkoutStep === 'confirmation') { setStep('home'); setCheckoutStep('info'); }
              else if (checkoutStep === 'payment') setCheckoutStep('delivery');
              else if (checkoutStep === 'delivery') setCheckoutStep('info');
              else setStep('cart');
            } else if (step === 'home') onBack();
            else if (step === 'order_details') setStep('orders');
            else setStep('home');
          }} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="font-bold text-lg text-blue-900 flex items-center gap-2">
            <Store className="w-5 h-5 text-teal-500"/> Pharmacy
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setStep('orders')} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
            <Package className="w-5 h-5" />
          </button>
          <button onClick={() => setStep('cart')} className="p-2 rounded-full hover:bg-gray-100 text-blue-900 relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        
        {step === 'home' && (
          <div className="animate-in fade-in">
            <div className="p-4 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search medicines..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-blue-900 text-sm" />
                </div>
                <button onClick={() => setShowFilters(!showFilters)} className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-100">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              
              {showFilters && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Sort By</p>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none">
                    <option value="default">Best Match</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="a-z">Name: A to Z</option>
                    <option value="z-a">Name: Z to A</option>
                  </select>
                </div>
              )}
            </div>

            <div className="px-4 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors border", selectedCategory === c ? "bg-blue-900 text-white border-blue-900" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
                  {c}
                </button>
              ))}
            </div>

            <div className="px-4 pb-6">
              <h2 className="text-gray-800 font-bold mb-4">{selectedCategory}</h2>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No products found.</div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} onClick={() => handleProductSelect(p)} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md cursor-pointer flex flex-col relative group">
                      {p.isBrand && <div className="absolute top-2 left-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full z-10">BRAND</div>}
                      {p.prescriptionRequired && <div className="absolute top-2 right-2 bg-red-100 text-red-700 p-1.5 rounded-full z-10"><FileWarning className="w-3 h-3"/></div>}
                      
                      <div className="h-32 bg-gray-50 p-4 flex items-center justify-center">
                        {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <Package className="w-12 h-12 text-gray-300" />}
                      </div>
                      
                      <div className="p-3 flex-1 flex flex-col">
                        <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{p.name}</h3>
                        <p className="text-gray-500 text-xs line-clamp-1 mb-2">{p.genericName}</p>
                        <div className="mt-auto">
                          <p className="text-[10px] text-gray-500 mb-0.5">From</p>
                          <span className="font-bold text-blue-900 text-sm">₦{p.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'product' && selectedProduct && (
          <div className="animate-in slide-in-from-right-4 bg-white min-h-full pb-24">
            <div className="h-64 bg-gray-50 flex items-center justify-center p-8 relative border-b border-gray-100">
              {selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <Package className="w-24 h-24 text-gray-300" />}
            </div>
            
            <div className="p-5">
              <div className="flex gap-2 mb-2">
                <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{selectedProduct.category}</span>
                {selectedProduct.isBrand && <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Brand Name</span>}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.name}</h1>
              <p className="text-gray-500 font-medium mb-4">{selectedProduct.genericName} • {selectedProduct.manufacturer}</p>
              
              {relatedProduct && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-blue-900 font-bold mb-0.5">Also available as {relatedProduct.isBrand ? 'Brand' : 'Generic'}</p>
                    <p className="text-sm text-blue-800">{relatedProduct.name}</p>
                  </div>
                  <button onClick={() => handleProductSelect(relatedProduct)} className="bg-white text-blue-900 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 shadow-sm">View Options</button>
                </div>
              )}
              
              {selectedProduct.prescriptionRequired && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 text-red-900 text-sm shadow-sm">
                  <FileWarning className="w-5 h-5 shrink-0 text-red-600" />
                  <div>
                    <p className="font-bold">Prescription Required</p>
                    <p className="text-xs text-red-700 mt-0.5">You will need to upload a valid prescription during checkout.</p>
                  </div>
                </div>
              )}

              {selectedProduct.packages && selectedProduct.packages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Select Package Size</h3>
                  <div className="space-y-3">
                    {selectedProduct.packages.map(pkg => (
                      <div 
                        key={pkg.id} 
                        onClick={() => setSelectedPackage(pkg)}
                        className={cn(
                          "border-2 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all",
                          selectedPackage?.id === pkg.id ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-white"
                        )}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={cn("font-bold", selectedPackage?.id === pkg.id ? "text-blue-900" : "text-gray-900")}>{pkg.packageSize}</h4>
                            {pkg.isBestValue && <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Best Value</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">₦{pkg.unitPrice.toLocaleString()} / unit</p>
                        </div>
                        <div className="text-right">
                          <p className={cn("font-bold text-lg", selectedPackage?.id === pkg.id ? "text-blue-900" : "text-gray-900")}>₦{pkg.price.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2"><Info className="w-4 h-4 text-blue-900"/> Description</h3>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">{selectedProduct.description}</p>
                </div>
                {selectedProduct.uses && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm">Common Uses</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.uses.split(',').map((use, i) => (
                        <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-600">{use.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">Product Details</h3>
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
                    <div className="flex justify-between p-3 text-sm"><span className="text-gray-500">Strength</span><span className="font-medium">{selectedProduct.strength || 'N/A'}</span></div>
                    <div className="flex justify-between p-3 text-sm"><span className="text-gray-500">Dosage Form</span><span className="font-medium">{selectedProduct.dosageForm || 'N/A'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
               {selectedPackage ? (
                 <button 
                   onClick={() => addToCart(selectedProduct, selectedPackage)}
                   disabled={selectedProduct.stockQuantity === 0}
                   className="w-full bg-blue-900 text-white py-3.5 rounded-xl font-bold shadow-lg flex justify-between items-center px-6 disabled:opacity-50"
                 >
                   <span>{selectedProduct.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                   <span className="bg-blue-800 px-3 py-1 rounded-lg">₦{selectedPackage.price.toLocaleString()}</span>
                 </button>
               ) : (
                 <button disabled className="w-full bg-gray-200 text-gray-500 py-3.5 rounded-xl font-bold">Select a package first</button>
               )}
            </div>
          </div>
        )}

        {step === 'cart' && (
          <div className="p-4 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
                <button onClick={() => setStep('home')} className="mt-6 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold">Browse Catalog</button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.selectedPackage.id}`} className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 shadow-sm relative">
                      {item.product.prescriptionRequired && <FileWarning className="w-4 h-4 text-red-500 absolute top-4 right-4" />}
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">
                        {item.product.imageUrl ? <img src={item.product.imageUrl} className="max-h-full max-w-full object-contain mix-blend-multiply p-1" /> : <Package className="w-8 h-8 text-gray-300" />}
                      </div>
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.product.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.selectedPackage.packageSize} • {item.product.isBrand ? 'Brand' : 'Generic'}</p>
                        <div className="font-bold text-blue-900 mt-1">₦{item.selectedPackage.price.toLocaleString()}</div>
                        
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-slate-50 border border-gray-200 rounded-lg p-0.5">
                            <button onClick={() => updateCartQuantity(item.product.id!, item.selectedPackage.id, -1)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-medium hover:bg-white rounded-md">-</button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.product.id!, item.selectedPackage.id, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 font-medium hover:bg-white rounded-md">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.product.id!, item.selectedPackage.id)} className="text-xs font-bold text-red-500">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600 text-sm"><span>Subtotal</span><span className="font-medium text-gray-900">₦{getCartTotals().subtotal.toLocaleString()}</span></div>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold text-lg border-t border-gray-100 pt-4">
                    <span>Subtotal</span>
                    <span className="text-blue-900">₦{getCartTotals().subtotal.toLocaleString()}</span>
                  </div>
                </div>

                <button onClick={() => { setStep('checkout'); setCheckoutStep('info'); }} className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg">Proceed to Checkout</button>
              </div>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="p-4">
             {/* Progress Bar */}
             <div className="flex items-center justify-between mb-8 px-2 relative">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -z-10 -translate-y-1/2"></div>
               <div className={cn("absolute top-1/2 left-0 h-0.5 bg-blue-900 -z-10 -translate-y-1/2 transition-all duration-500", checkoutStep === 'info' ? 'w-0' : checkoutStep === 'delivery' ? 'w-1/3' : checkoutStep === 'payment' ? 'w-2/3' : 'w-full')}></div>
               
               {['info', 'delivery', 'payment', 'confirmation'].map((s, i) => {
                 const isActive = checkoutStep === s;
                 const isPast = ['info', 'delivery', 'payment', 'confirmation'].indexOf(checkoutStep) > i;
                 return (
                   <div key={s} className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors", isActive ? "bg-blue-900 text-white ring-4 ring-blue-50" : isPast ? "bg-blue-900 text-white" : "bg-white text-gray-400 border border-gray-200")}>
                     {isPast ? <CheckCircle className="w-4 h-4"/> : i + 1}
                   </div>
                 )
               })}
             </div>

             {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex gap-2 items-start">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
             )}

             {checkoutStep === 'info' && (
               <div className="animate-in slide-in-from-right-4">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Details</h2>
                 <div className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label><input type="text" value={checkoutForm.fullName} onChange={e=>setCheckoutForm({...checkoutForm, fullName: e.target.value})} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input type="email" value={checkoutForm.email} onChange={e=>setCheckoutForm({...checkoutForm, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none" /></div>
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number</label><input type="tel" value={checkoutForm.phone} onChange={e=>setCheckoutForm({...checkoutForm, phone: e.target.value})} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none" /></div>
                 </div>

                 {cart.some(item => item.product.prescriptionRequired) && (
                   <div className="mt-6 bg-white p-5 rounded-2xl shadow-sm border border-red-100">
                     <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><FileWarning className="w-5 h-5"/> Prescription Required</h3>
                     <p className="text-xs text-red-700 mb-4">You have prescription medication in your cart. Upload a valid prescription PDF or Image.</p>
                     
                     {prescriptionData ? (
                       <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32 flex items-center justify-center">
                         {prescriptionData.includes('application/pdf') ? <div className="text-blue-900 font-bold"><FileText className="w-8 h-8 mx-auto mb-1"/> PDF Uploaded</div> : <img src={prescriptionData} className="max-h-full" />}
                         <button onClick={() => setPrescriptionData('')} className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow">Change</button>
                       </div>
                     ) : (
                       <div>
                         <input type="file" accept="image/*,.pdf" onChange={handleFileChange} id="rx-upload" className="hidden" />
                         <label htmlFor="rx-upload" className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-red-200 rounded-xl bg-red-50 cursor-pointer text-red-600 hover:bg-red-100 transition-colors">
                           <FileText className="w-8 h-8 mb-2" />
                           <span className="text-sm font-bold">Tap to upload prescription</span>
                         </label>
                       </div>
                     )}
                   </div>
                 )}

                 <button 
                   onClick={() => {
                     if (!checkoutForm.fullName || !checkoutForm.phone || !checkoutForm.email) return setError("Please fill all details.");
                     if (cart.some(item => item.product.prescriptionRequired) && !prescriptionData) return setError("Prescription is required.");
                     setError(''); setCheckoutStep('delivery');
                   }}
                   className="w-full mt-6 bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg"
                 >Continue to Delivery</button>
               </div>
             )}

             {checkoutStep === 'delivery' && (
               <div className="animate-in slide-in-from-right-4">
                 <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Booking</h2>
                 
                 <div className="space-y-4 mb-6">
                   <div onClick={() => setDeliveryMethod('Standard')} className={cn("p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-colors", deliveryMethod === 'Standard' ? "border-blue-900 bg-blue-50" : "border-gray-200 bg-white")}>
                     <div>
                       <h4 className="font-bold text-gray-900">Standard Delivery</h4>
                       <p className="text-xs text-gray-500 mt-1">1 - 3 business days</p>
                     </div>
                     <span className="font-bold text-blue-900">₦1,000</span>
                   </div>
                   <div onClick={() => setDeliveryMethod('Express')} className={cn("p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-colors", deliveryMethod === 'Express' ? "border-blue-900 bg-blue-50" : "border-gray-200 bg-white")}>
                     <div>
                       <h4 className="font-bold text-gray-900 flex items-center gap-1">Express Delivery <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 rounded uppercase">Fast</span></h4>
                       <p className="text-xs text-gray-500 mt-1">Same day or next day</p>
                     </div>
                     <span className="font-bold text-blue-900">₦2,500</span>
                   </div>
                 </div>

                 <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4 mb-6">
                   <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Delivery Address</label><textarea value={checkoutForm.address} onChange={e=>setCheckoutForm({...checkoutForm, address: e.target.value})} rows={2} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none"></textarea></div>
                   <div className="grid grid-cols-2 gap-3">
                     <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label><input type="date" min={new Date().toISOString().split('T')[0]} value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none" /></div>
                     <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time Slot</label>
                       <select value={deliveryTimeSlot} onChange={e=>setDeliveryTimeSlot(e.target.value)} className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-sm outline-none">
                         <option>8:00 AM - 11:00 AM</option><option>11:00 AM - 2:00 PM</option><option>2:00 PM - 5:00 PM</option><option>5:00 PM - 8:00 PM</option>
                       </select>
                     </div>
                   </div>
                 </div>
                 
                 {/* Visual Map Placeholder */}
                 <div className="h-32 bg-gray-200 rounded-2xl overflow-hidden relative border border-gray-300 mb-6 flex items-center justify-center">
                   <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Kano,Nigeria&zoom=12&size=600x300&key=dummy')] bg-cover bg-center"></div>
                   <div className="relative z-10 flex flex-col items-center bg-white/90 p-2 rounded-lg backdrop-blur shadow-sm">
                     <Package className="w-6 h-6 text-blue-900 mb-1"/>
                     <span className="text-[10px] font-bold text-gray-700 uppercase">Map Visual Placeholder</span>
                   </div>
                 </div>

                 <button 
                   onClick={() => {
                     if (!checkoutForm.address || !deliveryDate) return setError("Please enter address and date.");
                     setError(''); setCheckoutStep('payment');
                   }}
                   className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg"
                 >Continue to Payment</button>
               </div>
             )}

             {checkoutStep === 'payment' && (
               <div className="animate-in slide-in-from-right-4">
                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment</h2>
                 
                 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-900 text-sm shadow-sm mb-6">
                   <Lock className="w-5 h-5 shrink-0 text-blue-600" />
                   <div>
                     <p className="font-bold">Sandbox / Demo Payment</p>
                     <p className="text-xs text-blue-800 mt-0.5">No real money will be charged. This is a prototype integration demonstrating Stripe-like Elements structure.</p>
                   </div>
                 </div>

                 <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
                   <div className="flex justify-between text-sm mb-2 text-gray-500"><span>Subtotal</span><span>₦{getCartTotals().subtotal.toLocaleString()}</span></div>
                   <div className="flex justify-between text-sm mb-2 text-gray-500"><span>Delivery ({deliveryMethod})</span><span>₦{getCartTotals().deliveryFee.toLocaleString()}</span></div>
                   <div className="flex justify-between text-sm mb-4 text-gray-500"><span>Tax (5%)</span><span>₦{getCartTotals().tax.toLocaleString()}</span></div>
                   <div className="flex justify-between font-bold text-xl border-t border-gray-100 pt-4 text-gray-900">
                     <span>Total</span><span className="text-blue-900">₦{getCartTotals().total.toLocaleString()}</span>
                   </div>
                 </div>

                                  <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                   <button onClick={()=>setPaymentMethod('test')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='test' ? "bg-white text-purple-900 shadow" : "text-gray-500")}>Test</button>
                   <button onClick={()=>setPaymentMethod('card')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='card' ? "bg-white text-gray-900 shadow" : "text-gray-500")}><CreditCard className="w-4 h-4"/> Card</button>
                   <button onClick={()=>setPaymentMethod('wallet')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='wallet' ? "bg-white text-gray-900 shadow" : "text-gray-500")}>Apple/G Pay</button>
                 </div>

                 <form onSubmit={processMockPayment} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                   {paymentStatus === 'processing' && (
                     <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                       <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
                       <p className="font-bold text-blue-900">Processing your payment...</p>
                     </div>
                   )}
                   
                   {paymentMethod === 'test' ? (
                     <div className="text-center py-10 bg-purple-50 rounded-xl border border-purple-200">
                       <ShieldCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                       <h3 className="font-bold text-purple-900 mb-1">Demo Test Payment</h3>
                       <p className="text-purple-700 text-sm font-medium">No real money will be charged.</p>
                     </div>
                   ) : paymentMethod === 'card' ? (
                     <>
                       <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 focus-within:border-blue-900 transition-colors">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Card Number (Mock Stripe Element)</label>
                         <input type="text" placeholder="0000 0000 0000 0000" required value={cardMock.number} onChange={e=>{
                           let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                           let matches = v.match(/\d{4,16}/g);
                           let match = matches && matches[0] || '';
                           let parts = [];
                           for (let i=0, len=match.length; i<len; i+=4) parts.push(match.substring(i, i+4));
                           if(parts.length) setCardMock({...cardMock, number: parts.join(' ')});
                           else setCardMock({...cardMock, number: v});
                         }} className="w-full bg-transparent outline-none font-mono text-gray-900 text-lg tracking-wider" maxLength={19} />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 focus-within:border-blue-900 transition-colors">
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Expiry</label>
                           <input type="text" placeholder="MM/YY" required value={cardMock.expiry} onChange={e=>setCardMock({...cardMock, expiry: e.target.value})} className="w-full bg-transparent outline-none text-gray-900" maxLength={5}/>
                         </div>
                         <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 focus-within:border-blue-900 transition-colors">
                           <label className="text-xs font-bold text-gray-500 uppercase block mb-1">CVC</label>
                           <input type="text" placeholder="123" required value={cardMock.cvc} onChange={e=>setCardMock({...cardMock, cvc: e.target.value})} className="w-full bg-transparent outline-none text-gray-900" maxLength={4}/>
                         </div>
                       </div>
                       <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 focus-within:border-blue-900 transition-colors">
                         <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Name on Card</label>
                         <input type="text" placeholder="John Doe" required value={cardMock.name} onChange={e=>setCardMock({...cardMock, name: e.target.value})} className="w-full bg-transparent outline-none text-gray-900"/>
                       </div>
                     </>
                   ) : (
                     <div className="text-center py-10">
                       <p className="text-gray-500 font-medium">You will be redirected to complete your {paymentMethod} mock payment.</p>
                     </div>
                   )}

                   <button type="submit" disabled={paymentStatus === 'processing'} className="w-full mt-4 bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 disabled:opacity-50">
                     Pay ₦{getCartTotals().total.toLocaleString()}
                   </button>
                 </form>
               </div>
             )}

             {checkoutStep === 'confirmation' && selectedOrder && (
               <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-6">
                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                   <CheckCircle className="w-10 h-10 text-green-500" />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment successful!</h2>
                 <p className="text-gray-500 mb-8">Order <span className="font-mono font-bold text-gray-700">NTY-PHARM-{selectedOrder.id?.substring(0,8).toUpperCase()}</span> has been placed.</p>
                 
                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm text-left overflow-hidden mb-8">
                   <div className="bg-gray-50 p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Order Summary</h3></div>
                   <div className="p-5 space-y-4">
                     <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Total Paid</span><span className="font-bold text-blue-900 text-right">₦{selectedOrder.totalAmount.toLocaleString()}</span></div>
                     <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Delivery</span><span className="font-medium text-right">{selectedOrder.deliveryDate} ({selectedOrder.deliveryMethod})</span></div>
                     <div className="grid grid-cols-2 text-sm"><span className="text-gray-500">Method</span><span className="font-medium text-right">{selectedOrder.paymentMethod}</span></div>
                   </div>
                 </div>

                 <button onClick={() => { setStep('order_details'); }} className="w-full bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg mb-3">Track Order</button>
                 <button onClick={() => setStep('home')} className="w-full bg-slate-100 text-gray-600 font-bold py-4 rounded-xl hover:bg-slate-200">Continue Shopping</button>
               </div>
             )}
          </div>
        )}

        {step === 'orders' && (
          <div className="p-4 animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">You have no pharmacy orders yet.</p>
                <button onClick={() => setStep('home')} className="bg-blue-900 text-white px-6 py-2 rounded-xl font-bold text-sm">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} onClick={() => { setSelectedOrder(order); setStep('order_details'); }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className={cn("absolute top-0 left-0 w-1.5 h-full", order.orderStatus === 'Delivered' ? 'bg-green-500' : order.orderStatus === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500')}></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <div>
                        <p className="text-xs text-gray-500 font-mono mb-1">NTY-PHARM-{order.id?.substring(0, 8).toUpperCase()}</p>
                        <h3 className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</h3>
                      </div>
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", order.orderStatus === 'Delivered' ? "bg-green-100 text-green-700" : order.orderStatus === 'Cancelled' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800")}>
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4 pl-2 line-clamp-1">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</div>
                    <div className="flex justify-between items-center border-t border-gray-50 pt-3 pl-2">
                      <span className="font-bold text-gray-900">₦{order.totalAmount.toLocaleString()}</span>
                      <span className="text-xs text-blue-600 font-bold flex items-center gap-1">Track <ChevronRight className="w-3 h-3"/></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'order_details' && selectedOrder && (
          <div className="p-4 animate-in slide-in-from-right-4 pb-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Package className="w-5 h-5"/> Track Order</h2>
            
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-500 font-mono font-bold">#{selectedOrder.id?.substring(0, 8).toUpperCase()}</span>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Enhanced Order Status Timeline */}
              <div className="mb-8 relative pl-2">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                <div className="space-y-6 relative z-10">
                  <div className="flex gap-4 items-start">
                    <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-0.5 shadow ring-4 ring-white"><CheckCircle className="w-3 h-3 text-white" /></div>
                    <div><p className="text-sm font-bold text-gray-900">Order Placed</p><p className="text-xs text-gray-500">Payment Confirmed</p></div>
                  </div>
                  
                  {selectedOrder.prescriptionStatus !== 'Not Required' && (
                    <div className="flex gap-4 items-start">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow ring-4 ring-white", selectedOrder.prescriptionStatus === 'Approved' ? "bg-teal-500" : selectedOrder.prescriptionStatus === 'Rejected' ? "bg-red-500" : "bg-white border-2 border-blue-500")}>
                        {selectedOrder.prescriptionStatus === 'Approved' ? <CheckCircle className="w-3 h-3 text-white" /> : <Clock className="w-3 h-3 text-blue-500" />}
                      </div>
                      <div><p className="text-sm font-bold text-gray-900">Prescription Review</p><p className="text-xs text-gray-500">Status: <span className={cn("font-bold", selectedOrder.prescriptionStatus === 'Approved' ? "text-teal-600" : "text-amber-600")}>{selectedOrder.prescriptionStatus}</span></p></div>
                    </div>
                  )}

                  <div className="flex gap-4 items-start">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow ring-4 ring-white", ['Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "bg-teal-500" : "bg-gray-200")}>
                      <CheckCircle className={cn("w-3 h-3", ['Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "text-white" : "text-gray-400")} />
                    </div>
                    <div><p className={cn("text-sm font-bold", ['Preparing', 'Ready for Delivery', 'Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "text-gray-900" : "text-gray-400")}>Processing</p><p className="text-xs text-gray-500">Pharmacy is preparing items</p></div>
                  </div>
                  
                  <div className="flex gap-4 items-start">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow ring-4 ring-white", ['Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "bg-blue-500" : "bg-gray-200")}>
                      <CheckCircle className={cn("w-3 h-3", ['Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "text-white" : "text-gray-400")} />
                    </div>
                    <div><p className={cn("text-sm font-bold", ['Out for Delivery', 'Delivered'].includes(selectedOrder.orderStatus) ? "text-blue-900" : "text-gray-400")}>Out for Delivery</p></div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow ring-4 ring-white", selectedOrder.orderStatus === 'Delivered' ? "bg-green-500" : "bg-gray-200")}>
                      <CheckCircle className={cn("w-3 h-3", selectedOrder.orderStatus === 'Delivered' ? "text-white" : "text-gray-400")} />
                    </div>
                    <div><p className={cn("text-sm font-bold", selectedOrder.orderStatus === 'Delivered' ? "text-green-700" : "text-gray-400")}>Delivered</p></div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-4">
                <h3 className="font-bold text-gray-900 text-sm mb-4 uppercase tracking-wider text-gray-500">Items Ordered</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm bg-slate-50 p-3 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900 block">{item.name}</span>
                        <span className="text-xs text-gray-500">Qty: {item.quantity} • {item.packageName}</span>
                      </div>
                      <span className="font-bold text-gray-900 mt-1">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <div className="flex justify-between text-sm mb-1 text-gray-500"><span>Subtotal</span><span>₦{selectedOrder.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-1 text-gray-500"><span>Delivery Fee</span><span>₦{selectedOrder.deliveryFee.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm mb-3 text-gray-500"><span>Tax</span><span>₦{selectedOrder.tax.toLocaleString()}</span></div>
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-2 border-t border-gray-50">
                  <span>Total</span><span className="text-blue-900">₦{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3 uppercase tracking-wider text-gray-500">Delivery Information</h3>
              <p className="text-sm font-bold text-gray-900">{selectedOrder.deliveryAddress.fullName}</p>
              <p className="text-sm text-gray-600 mb-2">{selectedOrder.deliveryAddress.phone}</p>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city}
              </p>
              <div className="mt-4 flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                <span className="text-xs font-bold text-blue-900 uppercase">Schedule</span>
                <span className="text-sm font-medium text-blue-800">{selectedOrder.deliveryDate} • {selectedOrder.deliveryTimeSlot}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
