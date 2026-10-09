import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm ${className}`}>
      <Globe className="w-4 h-4 text-blue-900" />
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value as 'en' | 'ha')}
        className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="ha">Hausa</option>
      </select>
    </div>
  );
}
