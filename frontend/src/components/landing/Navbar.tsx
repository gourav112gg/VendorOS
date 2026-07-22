import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, ChevronDown, Check, Menu, X as CloseIcon } from "lucide-react";
import { useTranslation } from "../../context/LanguageContext";
import { Language } from "../../i18n/translations";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToPublic?: () => void;
}

const LANDING_LANGUAGES: { id: Language; label: string; code: string }[] = [
  { id: "en", label: "English", code: "EN" },
  { id: "hi", label: "हिन्दी", code: "HI" },
  { id: "pa", label: "ਪੰਜਾਬੀ", code: "PB" },
];

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
}) => {
  const { language, setLanguage } = useTranslation();
  const { updatePreference } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLang =
    LANDING_LANGUAGES.find((l) => l.id === language) || LANDING_LANGUAGES[0];

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (updatePreference) {
      updatePreference("language", lang);
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
      <nav className="landing-nav bg-[#000000]/90 backdrop-blur-xl border border-[#333333]/50 rounded-full px-5 py-2.5 shadow-2xl flex items-center justify-between text-white">
        {/* Brand Identity */}
        <a href="#top" className="flex items-center space-x-2.5 group">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-black font-mono text-sm font-extrabold shadow-md group-hover:scale-105 transition-transform">
            ✕
          </div>
          <span className="font-mono font-bold text-sm tracking-tight text-white">
            VendorOS
          </span>
        </a>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-6 text-[11px] font-mono tracking-wider text-neutral-400">
          <a href="#top" className="hover:text-white transition-colors">
            Home
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#automation" className="hover:text-white transition-colors">
            Clients
          </a>
          <a href="#bento" className="hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>

        {/* Right CTA & Controls Group */}
        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#111111] hover:bg-[#222222] border border-[#333333] rounded-full text-[10px] text-white transition-all cursor-pointer font-mono"
            >
              <Globe className="w-3 h-3 text-neutral-400" />
              <span className="font-bold text-[9px] uppercase tracking-wider text-white">
                {currentLang.code}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-neutral-400 transition-transform ${
                  langDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {langDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-32 bg-[#111111] border border-[#333333] rounded-xl shadow-2xl py-1 z-[250] font-mono"
                >
                  {LANDING_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleSelectLanguage(lang.id)}
                      className={`w-full px-3 py-1.5 text-left text-[10px] flex items-center justify-between hover:bg-[#222222] transition-colors ${
                        language === lang.id
                          ? "text-white font-bold"
                          : "text-neutral-400"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.id && (
                        <Check className="w-3 h-3 text-emerald-400" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login Button */}
          <button
            onClick={onNavigateToLogin}
            className="hidden sm:inline-block text-xs font-mono text-neutral-300 hover:text-white transition-colors cursor-pointer px-2 py-1"
          >
            Login
          </button>

          {/* Start for Free CTA */}
          <button
            onClick={onNavigateToSignUp}
            className="bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold rounded-full px-4 py-1.5 shadow-lg transition-all cursor-pointer transform hover:scale-105 active:scale-95"
          >
            Start for Free
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-neutral-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-2 bg-[#09090B] border border-[#333333] rounded-2xl p-4 shadow-2xl font-mono text-xs text-neutral-300 space-y-3"
          >
            <a
              href="#top"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-white"
            >
              Home
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-white"
            >
              Features
            </a>
            <a
              href="#automation"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-white"
            >
              Clients
            </a>
            <a
              href="#bento"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-white"
            >
              How it Works
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1 hover:text-white"
            >
              Pricing
            </a>
            <div className="pt-2 border-t border-[#222222] flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToLogin();
                }}
                className="w-full py-2 bg-[#1A1A1A] border border-[#333333] rounded-lg text-white font-bold"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToSignUp();
                }}
                className="w-full py-2 bg-white text-black font-bold rounded-lg"
              >
                Start for Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
