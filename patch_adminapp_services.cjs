const fs = require('fs');
let content = fs.readFileSync('src/components/AdminApp.tsx', 'utf8');

// Add categories state
content = content.replace(
  `const [services, setServices] = useState<any[]>([]);`,
  `const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [newService, setNewService] = useState({ name: '', price: '', roles: 'RN, LPN', categoryId: '', description: '' });`
);
content = content.replace(
  `const [newService, setNewService] = useState({ name: '', price: '', roles: 'RN, LPN' });`,
  ``
);

// Add category listener
content = content.replace(
  `unsubServices = onSnapshot(collection(db, 'services')`,
  `onSnapshot(collection(db, 'serviceCategories'), (snap) => {
              const data: any[] = [];
              snap.forEach(d => data.push({ id: d.id, ...d.data() }));
              setCategories(data);
            }, (err) => console.warn('Categories snapshot error:', err.message));
            unsubServices = onSnapshot(collection(db, 'services')`
);

// Handle add category
const handleAddCat = `
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) return;
    await setDoc(doc(db, 'serviceCategories', newCategory.name), {
      name: newCategory.name,
      active: true
    });
    setNewCategory({ name: '' });
  };
`;

content = content.replace(
  `const handleAddService`,
  `${handleAddCat}\n  const handleAddService`
);

// Handle add service fields
content = content.replace(
  `roles: newService.roles.split(',').map(r => r.trim()).filter(Boolean),`,
  `roles: newService.roles.split(',').map(r => r.trim()).filter(Boolean),
      categoryId: newService.categoryId,
      description: newService.description,`
);
content = content.replace(
  `setNewService({ name: '', price: '', roles: 'RN, LPN' });`,
  `setNewService({ name: '', price: '', roles: 'RN, LPN', categoryId: '', description: '' });`
);

// Update renderServices UI
const oldRenderServicesStart = `<form onSubmit={handleAddService} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">`;
const newRenderServicesStart = `
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Add Category</h3>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
            <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-64" placeholder="e.g. Wound Care" />
          </div>
          <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
            Add Category
          </button>
        </form>
      </div>

      <h3 className="font-bold text-gray-900 mb-4">Add Service</h3>
      <form onSubmit={handleAddService} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select required value={newService.categoryId} onChange={e => setNewService({...newService, categoryId: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48">
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <input type="text" required value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="px-3 py-2 border rounded-lg text-sm w-48" placeholder="Short desc" />
        </div>
`;

content = content.replace(oldRenderServicesStart, newRenderServicesStart);

// Update table to show category
content = content.replace(
  `<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>`,
  `<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>\n<th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service Name</th>`
);

content = content.replace(
  `<td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>`,
  `<td className="px-6 py-4 text-gray-500 text-sm">{s.categoryId}</td>\n<td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>`
);

fs.writeFileSync('src/components/AdminApp.tsx', content);
console.log('Patched AdminApp');
