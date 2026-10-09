import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace(
    "const [paymentMethod, setPaymentMethod] = useState('card');",
    "const [paymentMethod, setPaymentMethod] = useState('test');\n  const [physicianPaymentMethod, setPhysicianPaymentMethod] = useState('test');"
)

# Modify confirmPhysicianBooking
replacement_payload = '''            serviceType: 'Physician Care',
            amount: 15000,
            currency: 'NGN',
            paymentStatus: physicianPaymentMethod === 'test' ? 'paid_test' : 'paid',
            paymentMode: physicianPaymentMethod === 'test' ? 'test' : 'real',
            paymentReference: physicianPaymentMethod === 'test' ? 'TEST_' + Date.now() : 'TXN_' + Date.now() + Math.floor(Math.random()*1000),
            bookingStatus: 'pending_admin_processing','''

content = re.sub(
    r'            serviceType: \'Physician Care\',\n\s*amount: 15000,\n\s*currency: \'NGN\',\n\s*paymentStatus: \'paid\',\n\s*bookingStatus: \'pending_admin_processing\',',
    replacement_payload,
    content
)

# Modify Physician Payment UI
replacement_ui = '''              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-blue-900 font-bold">{t('Service Fee')}</span>
                  <span className="text-blue-900 font-black text-xl">₦15,000</span>
                </div>
                <p className="text-xs text-blue-700">{t('Fixed standard physician consultation fee')}</p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-blue-900"/> Select Payment Method</h3>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", physicianPaymentMethod === 'test' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPhysicianPaymentMethod('test')}
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Test Payment</p>
                      <p className="text-xs text-teal-700 font-semibold">Demo Payment — No real money will be charged.</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", physicianPaymentMethod === 'test' ? "border-blue-900" : "border-gray-300")}>
                    {physicianPaymentMethod === 'test' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", physicianPaymentMethod === 'card' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPhysicianPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Pay securely with your card</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", physicianPaymentMethod === 'card' ? "border-blue-900" : "border-gray-300")}>
                    {physicianPaymentMethod === 'card' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
              </div>

              <form onSubmit={confirmPhysicianBooking} className="relative">'''

content = re.sub(
    r'              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">.*?<form onSubmit=\{confirmPhysicianBooking\} className="relative">',
    replacement_ui,
    content,
    flags=re.DOTALL
)

content = content.replace(
    '''<p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-4"><ShieldCheck className="w-3 h-3"/> Secured by Paystack</p>''',
    '''<p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-4"><ShieldCheck className="w-3 h-3"/> Secured System</p>'''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
