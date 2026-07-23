import React from "react";
import { useTranslation } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Language } from "../i18n/translations";
import { Globe } from "lucide-react";
import { motion } from "motion/react";

const LANGUAGE_OPTIONS: { id: Language; label: string; code: string }[] = [
  { id: "en", label: "English", code: "EN" },
  { id: "hi", label: "हिन्दी", code: "HI" },
  { id: "pa", label: "ਪੰਜਾਬੀ", code: "PB" },
];

export const LanguageSwitcher: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const { language, setLanguage } = useTranslation();
  const { updatePreference } = useAuth();

  const currentOption =
    LANGUAGE_OPTIONS.find((o) => o.id === language) || LANGUAGE_OPTIONS[0];

  const handleCycleLanguage = () => {
    const currentIndex = LANGUAGE_OPTIONS.findIndex((o) => o.id === language);
    const nextIndex = (currentIndex + 1) % LANGUAGE_OPTIONS.length;
    const nextLang = LANGUAGE_OPTIONS[nextIndex].id;
    setLanguage(nextLang);
    if (updatePreference) {
      updatePreference("language", nextLang);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleCycleLanguage}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all cursor-pointer shadow-sm relative group"
        title={`Current Language: ${currentOption.label} (${currentOption.code}) — Click to switch`}
      >
        <Globe className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300" />
        <span className="absolute -bottom-1 -right-1 bg-black text-white border border-neutral-700 rounded-full text-[8px] font-mono font-bold px-1 py-0.2 leading-none shadow">
          {currentOption.code}
        </span>
      </motion.button>
    </div>
  );
};
