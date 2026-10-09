const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

// 1. Update Step type
content = content.replace(
  `type Step = 'splash' | 'login' | 'category_services' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports' | 'auth_settings' | 'pharmacy' | 'bookings' | 'physician_categories' | 'physician_list' | 'physician_profile';`,
  `type Step = 'splash' | 'login' | 'category_services' | 'home' | 'all_services' | 'service_details' | 'location' | 'matching' | 'results' | 'provider_profile' | 'booking_summary' | 'payment' | 'success' | 'profile' | 'reports' | 'auth_settings' | 'pharmacy' | 'bookings' | 'physician_categories' | 'physician_list' | 'physician_profile' | 'physician_booking_form' | 'physician_payment' | 'physician_success';`
);

fs.writeFileSync('src/components/PatientApp.tsx', content);
