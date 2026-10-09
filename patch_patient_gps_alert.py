import sys

content = open('src/components/PatientApp.tsx').read()
old_err = """        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission was not granted.';
        }
        setAddress(msg);
        setLocation(null);"""

new_err = """        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission was not granted.';
        }
        alert(msg);
        setLocation(null);"""

if old_err in content:
    content = content.replace(old_err, new_err)
    print("Patched patient gps alert")
else:
    print("Could not find patient gps error handling")

open('src/components/PatientApp.tsx', 'w').write(content)
