import re

with open('src/components/AdminApp.tsx', 'r') as f:
    content = f.read()

replacement = '''                <td className="px-6 py-4 text-sm">
                  {b.paymentStatus === 'paid_test' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">TEST PAID</span>
                  ) : b.paymentStatus === 'paid' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">PAID</span>
                  ) : (
                    <span className="text-gray-500 font-medium">Pending</span>
                  )}
                  {b.paymentMode === 'test' && <div className="text-[10px] text-gray-400 mt-1 uppercase">Test Mode</div>}
                </td>'''

content = re.sub(
    r'<td className="px-6 py-4 text-sm text-gray-500">Pending</td>',
    replacement,
    content
)

with open('src/components/AdminApp.tsx', 'w') as f:
    f.write(content)
