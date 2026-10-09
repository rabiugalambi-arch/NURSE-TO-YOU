const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const originalSearchMemo = `
    return listToSearch.filter(service => {
      if (service.active === false) return false;

      const enName = service.name.toLowerCase();
      const haName = t(service.name).toLowerCase();
      const catEn = service.categoryId.toLowerCase();
      const catHa = t(service.categoryId).toLowerCase();

      if (enName.includes(q) || haName.includes(q) || catEn.includes(q) || catHa.includes(q)) return true;

      const keywords = SERVICE_SEARCH_KEYWORDS[service.name] || [];
      if (keywords.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))) return true;

      return false;
    });
  }, [searchQuery, allServices, t]);`;

const newSearchMemo = `
    const results = listToSearch.filter(service => {
      if (service.active === false) return false;

      const enName = service.name.toLowerCase();
      const haName = t(service.name).toLowerCase();
      const catEn = service.categoryId.toLowerCase();
      const catHa = t(service.categoryId).toLowerCase();

      if (enName.includes(q) || haName.includes(q) || catEn.includes(q) || catHa.includes(q)) return true;

      const keywords = SERVICE_SEARCH_KEYWORDS[service.name] || [];
      if (keywords.some(kw => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))) return true;

      return false;
    });

    const physicianKeywords = ['physician', 'doctor', 'physician care', 'doctor booking', 'likita', 'asibiti'];
    if (physicianKeywords.some(kw => kw.includes(q) || q.includes(kw))) {
      results.unshift({
        id: 'physician_care_special',
        categoryId: 'PHYSICIAN CARE',
        name: 'Physician Booking',
        price: 15000,
        description: 'Book a professional physician for a consultation.',
        active: true,
        roles: ['Physician']
      } as any);
    }

    return results;
  }, [searchQuery, allServices, t]);`;

content = content.replace(originalSearchMemo, newSearchMemo);

// Let's also patch the click handler in the search results to route physician booking appropriately.
const originalClick = `                          <div 
                            key={service.id} 
                            onClick={() => {
                              setSelectedService(service);
                              setSelectedCategory({ id: service.categoryId, name: service.categoryId, active: true });
                              setSearchQuery('');
                              setStep('service_details');
                            }}`;

const newClick = `                          <div 
                            key={service.id} 
                            onClick={() => {
                              if (service.id === 'physician_care_special') {
                                setSearchQuery('');
                                setStep('physician_booking_form');
                                return;
                              }
                              setSelectedService(service);
                              setSelectedCategory({ id: service.categoryId, name: service.categoryId, active: true });
                              setSearchQuery('');
                              setStep('service_details');
                            }}`;

content = content.replace(originalClick, newClick);

fs.writeFileSync('src/components/PatientApp.tsx', content);
