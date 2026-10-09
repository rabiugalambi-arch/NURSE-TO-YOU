import re

with open('src/components/pharmacy/PharmacyClientApp.tsx', 'r') as f:
    content = f.read()

replacement_payload = '''      const newOrder = {
        orderId: bNumber,
        clientId: patientId,
        items: cart,
        totalAmount: total,
        paymentMethod: paymentMethod === 'test' ? 'Test Payment' : paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Mobile Wallet',
        paymentStatus: paymentMethod === 'test' ? 'paid_test' : 'successful',
        paymentMode: paymentMethod === 'test' ? 'test' : 'real',
        orderStatus: 'Pending',
        prescriptionStatus: hasPrescriptionReq ? 'Pending Review' : 'Not Required',
        deliveryAddress: checkoutForm,'''

content = re.sub(
    r'      const newOrder = \{\n\s*orderId: bNumber,\n\s*clientId: patientId,\n\s*items: cart,\n\s*totalAmount: total,\n\s*paymentMethod: paymentMethod === \'card\' \? \'Credit/Debit Card\' : paymentMethod === \'paypal\' \? \'PayPal\' : \'Mobile Wallet\',\n\s*paymentStatus: \'successful\',\n\s*orderStatus: \'Pending\',\n\s*prescriptionStatus: hasPrescriptionReq \? \'Pending Review\' : \'Not Required\',\n\s*deliveryAddress: checkoutForm,',
    replacement_payload,
    content
)

replacement_buttons = '''                 <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                   <button onClick={()=>setPaymentMethod('test')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='test' ? "bg-white text-purple-900 shadow" : "text-gray-500")}>Test</button>
                   <button onClick={()=>setPaymentMethod('card')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='card' ? "bg-white text-gray-900 shadow" : "text-gray-500")}><CreditCard className="w-4 h-4"/> Card</button>
                   <button onClick={()=>setPaymentMethod('wallet')} className={cn("flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", paymentMethod==='wallet' ? "bg-white text-gray-900 shadow" : "text-gray-500")}>Apple/G Pay</button>
                 </div>'''

content = re.sub(
    r'<div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">\n\s*<button onClick=\{\(\)=>setPaymentMethod\(\'card\'\)\}.*?<CreditCard className="w-4 h-4"\/> Card<\/button>\n\s*<button onClick=\{\(\)=>setPaymentMethod\(\'paypal\'\)\}.*?PayPal<\/button>\n\s*<button onClick=\{\(\)=>setPaymentMethod\(\'wallet\'\)\}.*?Apple\/G Pay<\/button>\n\s*<\/div>',
    replacement_buttons,
    content
)

replacement_ui = '''                   {paymentMethod === 'test' ? (
                     <div className="text-center py-10 bg-purple-50 rounded-xl border border-purple-200">
                       <ShieldCheck className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                       <h3 className="font-bold text-purple-900 mb-1">Demo Test Payment</h3>
                       <p className="text-purple-700 text-sm font-medium">No real money will be charged.</p>
                     </div>
                   ) : paymentMethod === 'card' ? ('''

content = re.sub(
    r'                   \{paymentMethod === \'card\' \? \(',
    replacement_ui,
    content
)

with open('src/components/pharmacy/PharmacyClientApp.tsx', 'w') as f:
    f.write(content)
