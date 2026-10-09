import sys

content = open('src/components/ProviderApp.tsx').read()

import_stmt = "import { ProviderApplication } from './ProviderApplication';\n"
if "ProviderApplication" not in content:
    content = content.replace("import { MapContainer", import_stmt + "import { MapContainer")

check_str = "if (providerData?.applicationStatus !== 'approved') {\n    return <ProviderApplication providerData={providerData} providerId={providerId} />;\n  }"

target = "  return (\n    <div className=\"max-w-md"
if check_str not in content:
    content = content.replace(target, check_str + "\n\n" + target)

open('src/components/ProviderApp.tsx', 'w').write(content)
print("Patched ProviderApp.tsx")
