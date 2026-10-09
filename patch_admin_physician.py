import re

with open('src/components/AdminApp.tsx', 'r') as f:
    content = f.read()

replacement = '''                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
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
                          </div>'''

content = re.sub(
    r'<span className=\{`inline-flex items-center px-2\.5 py-1 rounded-full text-xs font-bold \$\{[^}]+\}`\}>\s*\{b\.bookingStatus\.replace\(\/_/g, \' \'\)\.toUpperCase\(\)\}\s*</span>',
    replacement,
    content
)

with open('src/components/AdminApp.tsx', 'w') as f:
    f.write(content)
