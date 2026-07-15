import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Building, User, Layers, Shield, Settings, Briefcase, Users } from 'lucide-react';

interface NavigationProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabs?: { id: string; label: string; icon: React.ReactNode }[];
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, tabs = [] }) => {
  const { user, company, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="bg-[#111111] border-b border-[#222222] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Company Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-sm">
              <span className="text-black font-bold text-xs">V/OS</span>
            </div>
            <div>
              <span className="font-sans font-light text-sm tracking-widest text-white block uppercase leading-tight">
                VendorOS
              </span>
              <span className="text-[10px] font-mono font-medium text-slate-500 flex items-center space-x-1.5 mt-0.5">
                <span className="bg-[#1A1A1A] text-[#888888] px-1.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest border border-[#222222]">
                  {user.role}
                </span>
                {company && (
                  <>
                    <span className="text-slate-700">•</span>
                    <span className="flex items-center text-slate-400 font-sans max-w-[150px] truncate">
                      <Building className="w-3 h-3 mr-1 text-[#444444]" />
                      {company.name}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (if passed) */}
          {tabs.length > 0 && setActiveTab && (
            <div className="hidden md:flex space-x-6 items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 text-[10px] uppercase tracking-widest font-bold transition-all border-b-2 h-full ${
                    activeTab === tab.id
                      ? 'border-white text-white font-extrabold'
                      : 'border-transparent text-[#666666] hover:text-[#888888]'
                  }`}
                >
                  <span className="mr-2 opacity-70">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-white font-medium">{user.name}</span>
              <span className="block text-[10px] text-[#666666] font-mono truncate max-w-[180px]">{user.email}</span>
            </div>

            <div className="border-l border-[#222222] h-8"></div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs uppercase tracking-widest font-semibold text-[#888888] hover:text-red-500 transition-colors py-2 px-3 rounded-sm hover:bg-red-950/10"
              title="Logout from VendorOS"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      {tabs.length > 0 && setActiveTab && (
        <div className="md:hidden flex justify-around border-t border-[#222222] bg-[#111111] p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center flex-1 py-1.5 transition-colors text-[9px] uppercase tracking-widest font-bold min-w-[70px] ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-[#666666] hover:text-[#888888]'
              }`}
            >
              <span className="mb-1 opacity-75">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
