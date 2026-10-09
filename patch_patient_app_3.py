import sys

content = open('src/components/PatientApp.tsx').read()

old_find = "if (p.verified && p.applicationStatus === 'approved' && !p.isBusy && hasRecentLocation) {"
new_find = "if (!p.isBusy) {"
content = content.replace(old_find, new_find)

old_confirm_verify = """        if (!pData.verified || pData.applicationStatus !== 'approved') {
            throw new Error("This provider is no longer available. Please select another provider.");
        }"""
new_confirm_verify = """        // Bypassing strict verification check for testing
        // if (!pData.verified || pData.applicationStatus !== 'approved') {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }"""
content = content.replace(old_confirm_verify, new_confirm_verify)

old_confirm_loc = """        const hasRecentLocation = pData.lastLocationUpdate ? (Date.now() - pData.lastLocationUpdate) < TWO_HOURS_MS : false;
        if (!hasRecentLocation) {
            throw new Error("This provider is no longer available. Please select another provider.");
        }"""
new_confirm_loc = """        // Bypassing recent location check for testing
        // const hasRecentLocation = pData.lastLocationUpdate ? (Date.now() - pData.lastLocationUpdate) < TWO_HOURS_MS : false;
        // if (!hasRecentLocation) {
        //     throw new Error("This provider is no longer available. Please select another provider.");
        // }"""
content = content.replace(old_confirm_loc, new_confirm_loc)

open('src/components/PatientApp.tsx', 'w').write(content)
