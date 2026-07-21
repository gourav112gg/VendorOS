import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Language } from '../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGE_OPTIONS: { id: Language; label: string; code: string }[] = [
  { id: 'en', label: 'English', code: 'EN' },
  { id: 'hi', label: 'हिन्दी', code: 'HI' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', code: 'PB' },
];

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useTranslation();
  const { updatePreference } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (updatePreference) {
      updatePreference('language', lang);
    }
    setIsOpen(false);
  };

  const currentOption = LANGUAGE_OPTIONS.find((o) => o.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-black/5 dark:bg-[#161616] hover:bg-black/10 dark:hover:bg-[#222222] border border-black/15 dark:border-[#2A2A2A] hover:border-black/30 dark:hover:border-[#444444] rounded-sm text-xs text-slate-800 dark:text-white transition-all cursor-pointer select-none font-mono"
        title="Switch Platform Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-[#7FA0C4]" />
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-900 dark:text-white">{currentOption.code}</span>
        <span className="hidden sm:inline text-[11px] font-sans font-medium text-slate-700 dark:text-slate-200">{currentOption.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 dark:text-[#777777] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#2A2A2A] rounded-sm shadow-2xl z-50 py-1 divide-y divide-slate-100 dark:divide-[#222222]"
          >
            <div className="px-3 py-1.5 text-[9px] font-mono font-bold text-slate-500 dark:text-[#666666] uppercase tracking-widest">
              Select Language / ਭਾਸ਼ਾ
            </div>

            <div className="py-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectLanguage(opt.id)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    language === opt.id
                      ? 'bg-blue-50 dark:bg-[#1F2B3A] text-blue-700 dark:text-white font-semibold'
                      : 'text-slate-700 dark:text-[#A0A0A0] hover:bg-slate-100 dark:hover:bg-[#1A1A1A] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#222222] text-slate-600 dark:text-[#888888]">
                      {opt.code}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {language === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-emerald-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
