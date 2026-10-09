const fs = require('fs');
let content = fs.readFileSync('src/components/ProviderApp.tsx', 'utf8');

const bannerComp = `
const NotificationBanner = () => {
  const [permission, setPermission] = useState<NotificationPermission>(
    (typeof Notification !== 'undefined') ? Notification.permission : 'default'
  );

  if (permission !== 'default') return null;
  if (!('Notification' in window)) return null;

  const handleEnable = () => {
    Notification.requestPermission().then((p) => setPermission(p));
  };

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-900 p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div>
        <h3 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-blue-600"/> Enable Booking Notifications</h3>
        <p className="text-sm opacity-90">To receive background alerts for new bookings when you are not actively viewing the app, please enable browser notifications.</p>
      </div>
      <button 
        onClick={handleEnable}
        className="shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
      >
        Enable
      </button>
    </div>
  );
};
`;

// Insert after imports and other outside things (e.g., after locallyCancelledBookings)
content = content.replace(
  `const locallyCancelledBookings = new Set<string>();`,
  `const locallyCancelledBookings = new Set<string>();\n${bannerComp}`
);

// Insert into the UI for the requests tab
content = content.replace(
  `        {tab === 'requests' && (
          <div className="p-6 pb-12 animate-in fade-in">`,
  `        {tab === 'requests' && (
          <div className="p-6 pb-12 animate-in fade-in">
            <NotificationBanner />`
);

fs.writeFileSync('src/components/ProviderApp.tsx', content);
