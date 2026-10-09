import sys

content = open('src/components/PatientApp.tsx').read()

old_block = """        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission is required to find nearby providers.';
        }"""

new_block = """        if (error.code === error.PERMISSION_DENIED) {
           msg = 'Location permission is required to find nearby providers. Please retry.';
        }"""

content = content.replace(old_block, new_block)
open('src/components/PatientApp.tsx', 'w').write(content)
