import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronRight, Menu, X, Globe, Check, ChevronDown } from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";
import { Language } from "../../i18n/translations";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToPublic: () => void;
}

const LANDING_LANGUAGES: { id: Language; label: string; code: string }[] = [
  { id: 'en', label: 'English', code: 'EN' },
  { id: 'hi', label: 'हिन्दी', code: 'HI' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', code: 'PB' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToPublic,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const { updatePreference } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLang = LANDING_LANGUAGES.find((l) => l.id === language) || LANDING_LANGUAGES[0];

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (updatePreference) {
      updatePreference('language', lang);
    }
    setLangDropdownOpen(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="landing-header fixed inset-x-0 top-4 z-[200] max-w-5xl mx-auto px-4"
    >
      {/* Dark Floating Glass Pill Bar */}
      <nav className="landing-nav !bg-[#141B2E]/90 backdrop-blur-xl !border !border-white/10 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between !text-white">
        {/* Brand Identity & Live Operational Status */}
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
            className="flex items-center space-x-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-white/70 hover:text-white font-data text-[10px]"
          >
            <Search className="w-3 h-3 text-[#6366F1]" />
            <span>Search Vendor</span>
          </button>
        </div>

        {/* Right CTA & Controls Group */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#0A0F1F] hover:bg-white/10 border border-white/15 rounded-full text-xs text-white transition-all cursor-pointer font-mono"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider text-white">{currentLang.code}</span>
              <span className="hidden sm:inline text-[11px] font-sans font-medium text-white/80">{currentLang.label}</span>
              <ChevronDown className={`w-3 h-3 text-white/60 transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  className="absolute right-0 mt-2 w-40 bg-[#141B2E] border border-white/15 rounded-xl shadow-2xl z-50 py-1.5 text-white"
                >
                  <div className="px-3 py-1 text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest border-b border-white/10 mb-1">
                    Language / ਭਾਸ਼ਾ
                  </div>
                  {LANDING_LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleSelectLanguage(l.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                        language === l.id ? 'text-[#10B981] font-bold bg-white/5' : 'text-white/80'
                      }`}
                    >
                      <span className="font-sans">{l.label} ({l.code})</span>
                      {language === l.id && <Check className="w-3.5 h-3.5 text-[#10B981]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign In Button */}
          <button
            onClick={onNavigateToLogin}
            className="hidden sm:block text-xs font-semibold text-white/80 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
          >
            {t("signIn", "Sign In")}
          </button>

          {/* Start Company CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToSignUp}
            className="bg-white hover:bg-gray-100 text-[#0A0F1F] text-xs font-semibold px-4 py-2 rounded-full shadow-lg transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>Start Company</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#0A0F1F]" />
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
            className="md:hidden mt-2 bg-[#141B2E]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4 font-sans text-sm text-white"
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
