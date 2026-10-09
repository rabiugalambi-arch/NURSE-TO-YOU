import sys

content = open('src/components/AdminApp.tsx').read()

old_import = """import { ShieldAlert, ShieldCheck, Users, Activity, LogOut, CheckCircle, Clock, MapPin, XCircle, CreditCard, LayoutDashboard, Settings, Menu, X } from 'lucide-react';"""
new_import = """import { ShieldAlert, ShieldCheck, Users, Activity, LogOut, CheckCircle, Clock, MapPin, XCircle, CreditCard, LayoutDashboard, Settings, Menu, X, Store } from 'lucide-react';
import { PharmacyAdminApp } from './pharmacy/PharmacyAdminApp';"""
content = content.replace(old_import, new_import)

old_type = """type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications';"""
new_type = """type AdminView = 'dashboard' | 'providers' | 'clients' | 'bookings' | 'services' | 'applications' | 'pharmacy';"""
content = content.replace(old_type, new_type)

old_nav = """          <NavItem icon={<ShieldAlert size={20}/>} label="Applications" active={activeView === 'applications'} onClick={() => { setActiveView('applications'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20}/>} label="Services" active={activeView === 'services'} onClick={() => { setActiveView('services'); setIsMobileMenuOpen(false); }} />
        </nav>"""
new_nav = """          <NavItem icon={<ShieldAlert size={20}/>} label="Applications" active={activeView === 'applications'} onClick={() => { setActiveView('applications'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Settings size={20}/>} label="Services" active={activeView === 'services'} onClick={() => { setActiveView('services'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Store size={20}/>} label="Pharmacy" active={activeView === 'pharmacy'} onClick={() => { setActiveView('pharmacy'); setIsMobileMenuOpen(false); }} />
        </nav>"""
content = content.replace(old_nav, new_nav)

old_render = """        {activeView === 'dashboard' && renderDashboard()}"""
new_render = """        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'pharmacy' && (
          <div className="animate-in fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pharmacy Store Management</h2>
            <PharmacyAdminApp />
          </div>
        )}"""
content = content.replace(old_render, new_render)

open('src/components/AdminApp.tsx', 'w').write(content)
