import sys

content = open('src/components/ProviderApp.tsx').read()

poll_code = '''  // Auto-update GPS location every 30 seconds if available or busy
  useEffect(() => {
    let intervalId: any;
    if (providerData && (providerData.available || providerData.isBusy)) {
      intervalId = setInterval(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                await updateDoc(doc(db, 'providers', providerId), {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  lastLocationUpdate: Date.now()
                });
              } catch (e) {
                // Silent fail for auto-updates
              }
            },
            () => {}, // Silent error
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        }
      }, 30000);
    }
    return () => clearInterval(intervalId);
  }, [providerData?.available, providerData?.isBusy, providerId]);
'''

if 'Auto-update GPS location' not in content:
    content = content.replace("  const [tab, setTab] = useState<'requests' | 'earnings' | 'profile'>('requests');", "  const [tab, setTab] = useState<'requests' | 'earnings' | 'profile'>('requests');\n" + poll_code)

open('src/components/ProviderApp.tsx', 'w').write(content)
print("Added GPS polling")
