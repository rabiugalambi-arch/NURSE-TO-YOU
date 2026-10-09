import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

replacement = '''              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 text-center mb-8 shadow-sm">
                <p className="text-gray-500 text-sm mb-1">Total to Pay</p>
                <h2 className="text-4xl font-black text-blue-900">₦{(selectedService.price + 500).toLocaleString()}</h2>
              </div>
              
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-900 flex items-center gap-2"><ActivitySquare className="w-5 h-5 text-blue-900"/> Select Payment Method</h3>
                
                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'test' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('test')}
                >
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-teal-600" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Test Payment</p>
                      <p className="text-xs text-teal-700 font-semibold">Demo Payment — No real money will be charged.</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'test' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'test' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  className={cn("bg-slate-50 border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors", paymentMethod === 'card' ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-200")}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-4">
                    <ActivitySquare className="w-6 h-6 text-gray-700" />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Credit/Debit Card</p>
                      <p className="text-xs text-gray-500">Pay securely with your card</p>
                    </div>
                  </div>
                  <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", paymentMethod === 'card' ? "border-blue-900" : "border-gray-300")}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-blue-900 rounded-full"></div>}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-8 pb-6 border-b border-gray-200">
                <p className="text-xs text-gray-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Secured System</p>
              </div>'''

content = re.sub(
    r'<div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 text-center mb-8 shadow-sm">.*?<p className="text-xs text-gray-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3 h-3"/> Secured by Paystack</p>\n\s*</div>',
    replacement,
    content,
    flags=re.DOTALL
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
