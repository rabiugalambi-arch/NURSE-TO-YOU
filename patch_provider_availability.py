import re

with open('src/components/ProviderApp.tsx', 'r') as f:
    content = f.read()

# Replace toggle availability !navigator.geolocation
nav_geo_old = '''        if (!navigator.geolocation) {
          setLocationStatus({ message: 'Geolocation is not supported by your browser', type: 'error' });
          setIsUpdatingLocation(false);
          return;
        }'''

nav_geo_new = '''        if (!navigator.geolocation) {
          // Fallback if no geolocation support
          await updateDoc(doc(db, 'providers', providerId), { available: true });
          setLocationStatus({ message: 'Geolocation not supported, but you are now available.', type: 'warning' });
          setIsUpdatingLocation(false);
          setTimeout(() => setLocationStatus(null), 3000);
          return;
        }'''
content = content.replace(nav_geo_old, nav_geo_new)

# Replace getCurrentPosition error handler
err_handler_old = '''          (error) => {
            let msg = 'Unable to detect location. Please retry.';
            if (error.code === error.PERMISSION_DENIED) { 
              msg = 'Location permission is required to turn on Duty Status.';
            }
            setLocationStatus({ message: msg, type: 'error' });
            setIsUpdatingLocation(false);
            alert(msg);
          },'''

err_handler_new = '''          (error) => {
            let msg = 'Unable to detect location. You are now available without GPS.';
            if (error.code === error.PERMISSION_DENIED) { 
              msg = 'Location permission denied. You are now available without GPS.';
            }
            updateDoc(doc(db, 'providers', providerId), { available: true }).then(() => {
              setLocationStatus({ message: msg, type: 'warning' });
              setIsUpdatingLocation(false);
              setTimeout(() => setLocationStatus(null), 5000);
            }).catch(() => {
              setLocationStatus({ message: 'Error updating status', type: 'error' });
              setIsUpdatingLocation(false);
            });
          },'''
content = content.replace(err_handler_old, err_handler_new)

with open('src/components/ProviderApp.tsx', 'w') as f:
    f.write(content)
