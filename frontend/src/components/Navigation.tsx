
import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut, Building } from "lucide-react";
import { motion } from "motion/react";

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

  if (!user) return null;

  return (
    <nav className="bg-[#111111]/95 backdrop-blur-md border-b border-[#222222] sticky top-0 z-30 supports-[backdrop-filter]:bg-[#111111]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Company Profile */}
          <div className="flex items-center space-x-3 min-w-0">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-9 h-9 shrink-0 bg-white flex items-center justify-center rounded-sm text-black shadow-sm"
            >
              <span className="font-serif italic font-semibold text-[13px] leading-none">
                V
              </span>
            </motion.div>
            <div className="min-w-0">
              <span className="font-sans font-medium text-sm tracking-wide text-white block leading-tight">
                VendorOS
              </span>
              <span className="text-[10px] font-mono font-medium flex items-center space-x-1.5 mt-0.5">
                <span className="bg-[#1A1A1A] text-[#888888] px-1.5 py-0.5 rounded-xs text-[9px] font-mono uppercase tracking-widest border border-[#222222]">
                  {user.role}
                </span>
                {company && (
                  <>
                    <span className="text-[#444444]">•</span>
                    <span className="flex items-center text-[#888888] font-sans max-w-[150px] truncate normal-case tracking-normal">
                      <Building className="w-3 h-3 mr-1 text-[#555555]" />
                      {company.name}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Navigation Tabs (if passed) */}
          {tabs.length > 0 && setActiveTab && (
            <div className="hidden md:flex space-x-1 items-center">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center px-3 py-2 my-2 text-[10px] uppercase tracking-widest font-semibold rounded-sm transition-colors cursor-pointer ${
                      isActive
                        ? "text-white"
                        : "text-[#666666] hover:text-[#AAAAAA] hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className="mr-2 opacity-80">{tab.icon}</span>
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="vos-nav-active-pill"
                        className="absolute inset-0 -z-10 rounded-sm bg-white/[0.06] border border-white/[0.08]"
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
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-white font-medium">
                {user.name}
              </span>
              <span className="block text-[10px] text-[#666666] font-mono truncate max-w-[180px]">
                {user.email}
              </span>
            </div>

            <div className="border-l border-[#222222] h-8"></div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs uppercase tracking-widest font-semibold text-[#888888] hover:text-red-400 transition-colors py-2 px-3 rounded-sm hover:bg-red-500/[0.08] cursor-pointer"
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
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center flex-1 py-1.5 rounded-sm transition-colors text-[9px] uppercase tracking-widest font-bold min-w-[70px] cursor-pointer ${
                  isActive
                    ? "text-white bg-white/[0.06]"
                    : "text-[#666666] hover:text-[#AAAAAA]"
                }`}
              >
                <span className="mb-1 opacity-80">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
