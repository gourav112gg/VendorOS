import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronRight } from "lucide-react";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-[200] transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0F17]/85 backdrop-blur-md border-b border-[#1E2836] py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-8 h-8 shrink-0 bg-white flex items-center justify-center rounded-sm text-black shadow-sm"
          >
            <span className="font-serif italic font-semibold text-[13px] leading-none">
              V
            </span>
          </motion.div>
          <span className="font-sans font-medium text-[15px] tracking-wide text-white">
            VendorOS
          </span>
        </a>

        <button
          onClick={onNavigateToPublic}
          className="hidden sm:flex items-center gap-2 rounded-full border border-[#26313F] bg-[#131A26]/60 px-4 py-2 text-[12px] font-mono uppercase tracking-widest text-[#B7C4DA] hover:text-white hover:border-[#3B4C6B] transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Find a Company
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLogin}
            className="whitespace-nowrap px-3 sm:px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-widest text-[#B7C4DA] hover:text-white transition-colors rounded-sm"
          >
            Log In
          </button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNavigateToSignUp}
            className="flex items-center gap-1.5 whitespace-nowrap bg-white hover:bg-[#F0EAD8] text-black text-[11px] font-bold uppercase tracking-widest px-3.5 sm:px-4 py-2.5 rounded-sm shadow-md transition-colors"
          >
            Get Started
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};
