const fs = require('fs');
let content = fs.readFileSync('src/components/PatientApp.tsx', 'utf8');

const originalBlock = `  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    
    const listToSearch = allServices.length > 0 ? allServices : FALLBACK_SERVICES_LIST;

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

// Remove original block
content = content.replace(originalBlock, '');

// Re-insert after all states are declared
// Find the last useState
const anchor = `const [expandedTracking, setExpandedTracking] = useState<string | null>(null);`;

if (content.includes(anchor)) {
  content = content.replace(
    anchor,
    `${anchor}\n\n${originalBlock}`
  );
} else {
  console.log("Could not find anchor");
}

fs.writeFileSync('src/components/PatientApp.tsx', content);
console.log("Moved searchResults useMemo");
