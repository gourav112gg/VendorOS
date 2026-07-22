import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Globe, Menu, X as CloseIcon } from "lucide-react";
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

  const currentLang =
    LANDING_LANGUAGES.find((l) => l.id === language) || LANDING_LANGUAGES[0];

  const handleCycleLanguage = () => {
    const currentIndex = LANDING_LANGUAGES.findIndex((l) => l.id === language);
    const nextIndex = (currentIndex + 1) % LANDING_LANGUAGES.length;
    const nextLang = LANDING_LANGUAGES[nextIndex].id;
    setLanguage(nextLang);
    if (updatePreference) {
      updatePreference("language", nextLang);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="landing-header fixed inset-x-0 top-4 z-[200] max-w-5xl mx-auto px-4"
    >
      {/* Heavy Ultra-Frosted Glassmorphism Floating Pill Bar */}
      <nav className="landing-nav bg-black/40 backdrop-blur-3xl border border-white/25 rounded-full px-5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] ring-1 ring-white/10 flex items-center justify-between text-white">
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
        <div className="hidden md:flex items-center space-x-6 text-[11px] font-mono tracking-wider text-neutral-300">
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
          {/* Circular Globe Language Toggle Button */}
          <button
            type="button"
            onClick={handleCycleLanguage}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 group"
            title={`Language: ${currentLang.label} (Click to switch)`}
          >
            <Globe className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
          </button>

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
            className="md:hidden mt-2 bg-[#09090B]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-2xl font-mono text-xs text-neutral-300 space-y-3"
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
