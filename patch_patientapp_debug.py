import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''    } catch (error: any) {
      console.error("Error finding providers", error?.message || error);''',
    '''    } catch (error: any) {
      console.warn("PatientApp findProviders error:", error?.message || error);'''
)

content = content.replace(
    '''    }, (err) => console.error('Snapshot error in PatientApp.tsx:', err));''',
    '''    }, (err: any) => console.warn('Snapshot error in PatientApp bookings:', err?.message || err));'''
)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
