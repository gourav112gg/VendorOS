import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronRight, Layers, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useTranslation } from "../../context/LanguageContext";

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToPublic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToPublic,
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-4 z-[200] max-w-5xl mx-auto px-4"
    >
      {/* Floating Glass Pill Bar */}
      <nav className="bg-[#141B2E]/80 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between">
        {/* Brand & Status Indicator */}
        <a href="#top" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0F1F] font-serif-italic text-lg font-bold shadow-md group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="font-display font-semibold text-sm tracking-wide text-white flex items-center gap-1.5">
              VendorOS
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" title="Systems Operational" />
            </span>
          </div>
        </a>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-white/70">
          <a href="#operations" className="hover:text-white transition-colors">
            Operations
          </a>
          <a href="#copilot" className="hover:text-white transition-colors">
            AI Copilot
          </a>
          <a href="#built-on" className="hover:text-white transition-colors">
            Built On
          </a>
          <button
            onClick={onNavigateToPublic}
            className="flex items-center space-x-1.5 hover:text-white transition-colors text-white/60 font-data text-[10px]"
          >
            <Search className="w-3 h-3 text-[#6366F1]" />
            <span>Search Vendor</span>
          </button>
        </div>

        {/* Right CTA Group */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />

          <button
            onClick={onNavigateToLogin}
            className="hidden sm:block text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 transition-colors"
          >
            {t("signIn", "Sign In")}
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToSignUp}
            className="bg-white hover:bg-gray-100 text-[#0A0F1F] text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Start Company</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/80 hover:text-white p-1"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="md:hidden mt-2 bg-[#141B2E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 font-sans text-sm"
          >
            <a
              href="#operations"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/80 hover:text-white py-1"
            >
              Operations Overview
            </a>
            <a
              href="#copilot"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/80 hover:text-white py-1"
            >
              AI Copilot
            </a>
            <a
              href="#built-on"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white/80 hover:text-white py-1"
            >
              Built On
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateToPublic();
              }}
              className="w-full text-left text-white/80 hover:text-white py-1 flex items-center space-x-2"
            >
              <Search className="w-4 h-4 text-[#6366F1]" />
              <span>Search Vendor Registry</span>
            </button>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToLogin();
                }}
                className="text-white font-semibold text-xs"
              >
                {t("signIn", "Sign In")}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToSignUp();
                }}
                className="bg-white text-[#0A0F1F] font-semibold text-xs px-4 py-2 rounded-full"
              >
                Start Company
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
