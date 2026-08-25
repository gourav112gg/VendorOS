
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogOut, Building } from "lucide-react";
import { motion } from "motion/react";

import { OfflineConnectivityMonitor } from "./OfflineConnectivityMonitor";
import { VendorOSLogo } from "./VendorOSLogo";

interface NavigationProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  tabs?: { id: string; label: string; icon: React.ReactNode }[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  tabs = [],
}) => {
  const { user, company, logout } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <nav 
      className="bg-[#111111]/95 backdrop-blur-md border-b border-[#222222] sticky top-0 z-30 supports-[backdrop-filter]:bg-[#111111]/80"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Company Profile */}
          <div className="flex items-center space-x-3 min-w-0">
            <VendorOSLogo size="md" textColor="text-white" />
            <div className="min-w-0">
              <span className="text-xs font-mono font-medium flex items-center space-x-1.5 mt-0.5">
                <span className="bg-[#1A1A1A] text-[#A1A1AA] px-2 py-0.5 rounded-sm text-[11px] font-mono uppercase tracking-wider border border-[#262626]">
                  {user.role}
                </span>
                {company && (
                  <>
                    <span className="text-[#666666]">•</span>
                    <span className="flex items-center text-[#A1A1AA] font-sans text-xs max-w-[160px] truncate normal-case tracking-normal">
                      <Building className="w-3.5 h-3.5 mr-1 text-[#888888] shrink-0" />
                      {company.name}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          {tabs.length > 0 && setActiveTab && (
            <div 
              role="tablist" 
              aria-label="Dashboard views" 
              className="hidden md:flex space-x-1 items-center"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center px-3.5 py-2 my-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 ${
                      isActive
                        ? "text-white"
                        : "text-[#888888] hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="mr-2 opacity-90">{tab.icon}</span>
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="vos-nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-sm bg-white/[0.08] border border-white/[0.12]"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            <OfflineConnectivityMonitor />
            {/* Multi-Language Switcher */}
            <LanguageSwitcher />

            <div className="text-right hidden sm:block">
              <span className="block text-xs text-white font-medium">
                {user.name}
              </span>
              <span className="block text-[11px] text-[#888888] font-mono truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            <div className="border-l border-[#222222] h-8"></div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs font-semibold text-[#888888] hover:text-red-400 transition-colors py-2 px-3 rounded-sm hover:bg-red-500/[0.08] cursor-pointer min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/80"
              title="Sign out of VendorOS"
              aria-label="Sign out of VendorOS"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      {tabs.length > 0 && setActiveTab && (
        <div 
          role="tablist" 
          aria-label="Mobile Navigation" 
          className="md:hidden flex justify-around border-t border-[#222222] bg-[#111111] p-1.5 overflow-x-auto gap-1"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-sm transition-colors text-[11px] font-semibold min-w-[72px] min-h-[48px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 ${
                  isActive
                    ? "text-white bg-white/[0.08] font-bold"
                    : "text-[#888888] hover:text-white"
                }`}
              >
                <span className="mb-1 opacity-90">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
