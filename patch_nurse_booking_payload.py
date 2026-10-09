import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

replacement = '''          price: selectedService.price,
          status: 'REQUESTED',
          paymentStatus: paymentMethod === 'test' ? 'paid_test' : 'paid',
          paymentMode: paymentMethod === 'test' ? 'test' : 'real',
          transactionReference: paymentMethod === 'test' ? 'TEST_' + Date.now() : null,'''

content = re.sub(
    r'          price: selectedService\.price,\n\s*status: \'REQUESTED\',',
    replacement,
    content
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
