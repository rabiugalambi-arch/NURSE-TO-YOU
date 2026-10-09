import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

old_interval = '''  // Auto-update GPS location every 30 seconds if available or busy
  useEffect(() => {
    let intervalId: any;
    if (providerData && (providerData.available || providerData.isBusy)) {
      intervalId = setInterval(() => {'''

new_interval = '''  // Auto-update GPS location every 30 seconds if available or busy AND location is enabled
  useEffect(() => {
    let intervalId: any;
    if (providerData && (providerData.available || providerData.isBusy) && providerData.locationEnabled) {
      intervalId = setInterval(() => {'''

content = content.replace(old_interval, new_interval)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)

