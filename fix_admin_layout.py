import sys

content = open('src/components/AdminApp.tsx').read()

if 'Menu, X' not in content:
    content = content.replace('LayoutDashboard, Settings } from \'lucide-react\';', 'LayoutDashboard, Settings, Menu, X } from \'lucide-react\';')

if 'isMobileMenuOpen' not in content:
    content = content.replace('  const [activeView, setActiveView] = useState<AdminView>(\'dashboard\');', '  const [activeView, setActiveView] = useState<AdminView>(\'dashboard\');\n  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);')

old_layout = '''  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative z-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col h-full">'''

new_layout = '''  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative z-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-blue-400" />
          <h1 className="font-bold text-lg tracking-wide">NTY Admin</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg hover:bg-slate-800">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col h-full transition-transform transform md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>'''
content = content.replace(old_layout, new_layout)

old_nav = '''        <nav className="flex-1 p-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Users size={20}/>} label="Providers" active={activeView === 'providers'} onClick={() => setActiveView('providers')} />
          <NavItem icon={<Activity size={20}/>} label="Bookings" active={activeView === 'bookings'} onClick={() => setActiveView('bookings')} />
          <NavItem icon={<Users size={20}/>} label="Clients" active={activeView === 'clients'} onClick={() => setActiveView('clients')} />
          <NavItem icon={<Settings size={20}/>} label="Services" active={activeView === 'services'} onClick={() => setActiveView('services')} />
        </nav>'''

new_nav = '''        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={activeView === 'dashboard'} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20}/>} label="Providers" active={activeView === 'providers'} onClick={() => { setActiveView('providers'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Activity size={20}/>} label="Bookings" active={activeView === 'bookings'} onClick={() => { setActiveView('bookings'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20}/>} label="Clients" active={activeView === 'clients'} onClick={() => { setActiveView('clients'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20}/>} label="Services" active={activeView === 'services'} onClick={() => { setActiveView('services'); setIsMobileMenuOpen(false); }} />
        </nav>'''
content = content.replace(old_nav, new_nav)

old_main = '''      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8 bg-gray-50">'''
new_main = '''      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-gray-50 w-full">'''
content = content.replace(old_main, new_main)

# Also ensure table containers have responsive overflow scroll.
old_table_container = '''<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">'''
new_table_container = '''<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-max">'''
content = content.replace(old_table_container, new_table_container)


open('src/components/AdminApp.tsx', 'w').write(content)
print('Done!')
