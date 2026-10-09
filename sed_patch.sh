sed -i -e '378,395c\
        if (p.serviceArea && !p.serviceArea.toLowerCase().includes("kano")) { \
           return;\
        }\
\
        // Ignore providers without valid GPS coordinates\
        if (!p.latitude || !p.longitude || (p.latitude === 0 && p.longitude === 0)) {\
          console.log(`[Client GPS] Ignoring provider ${p.fullName || p.name || doc.id} because they have no valid GPS coordinates.`);\
          return;\
        }\
\
        let distanceKm: number | null = null;\
        \
        if (searchLocation && searchLocation.lat && searchLocation.lng) { \
          distanceKm = calculateDistance(\
            searchLocation.lat, searchLocation.lng,\
            p.latitude, p.longitude\
          );\
          console.log(`[Client GPS] Distance to ${p.fullName || p.name}: ${distanceKm.toFixed(2)} km`);\
        }\
        \
        if (!p.isBusy) {\
          matched.push({ ...p, id: doc.id, distanceKm });\
        }' src/components/PatientApp.tsx
