import re

with open('src/components/PatientApp.tsx', 'r') as f:
    content = f.read()

old_checks = """        // Bypassing strict verification check for testing
        // if (!pData.verified || pData.applicationStatus !== 'approved') {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }
        // Bypassing available check for testing
        // if (!pData.available) {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }
        // Bypassing isBusy check for testing
        // if (pData.isBusy) {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }
        // Bypassing services check for testing
        // if (!pData.services || !pData.services.includes(selectedService.name)) {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }"""

new_checks = """        if (!pData.verified || pData.applicationStatus !== 'approved') {
            throw new Error("PROVIDER_UNVERIFIED: This provider is not fully approved by admin yet.");
        }
        if (pData.available === false) {
            throw new Error("PROVIDER_UNAVAILABLE: This provider is no longer available.");
        }
        if (pData.isBusy === true) {
            throw new Error("PROVIDER_BUSY: This provider is currently busy with another client.");
        }
        if (!pData.services || !pData.services.includes(selectedService.name)) {
            throw new Error("PROVIDER_SERVICE_MISMATCH: This provider does not offer the selected service.");
        }"""

content = content.replace(old_checks, new_checks)

with open('src/components/PatientApp.tsx', 'w') as f:
    f.write(content)
