
import React from 'react';
import { LayoutDashboard, MailOpen, Send, FilePlus, Settings, School } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: MailOpen },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send },
    { id: 'buat-surat', label: 'Buat Surat Baru', icon: FilePlus },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col h-screen fixed lg:relative z-40">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <School size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">ArsipSurat</h1>
          <p className="text-xs text-slate-400">Digital SD App</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'settings' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Settings size={20} />
          <span className="font-medium">Pengaturan</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
