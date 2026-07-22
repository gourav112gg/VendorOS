import React from "react";
import { motion } from "motion/react";
import { ChevronRight, ShieldCheck, Zap } from "lucide-react";
import { HeroVisual } from "./HeroVisual";
import { StoryCard } from "./StoryCard";
import { Marquee } from "./Marquee";

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section id="top" className="relative pt-32 pb-16 overflow-hidden bg-[#0A0F1F] text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6366F1]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-12 relative z-10">
        {/* Main Headline Group */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#141B2E] border border-white/10 text-xs font-mono text-indigo-300"
          >
            <Zap className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>AI-POWERED FIELD & FACTORY OPERATIONS COPILOT</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white"
          >
            Know which order is about to go{" "}
            <span className="font-serif-italic text-[#F59E0B] font-normal italic px-1">
              wrong
            </span>{" "}
            before your customer does.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-sans text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            VendorOS unifies Owners, Managers, and Field Workers into one real-time operational engine — using Stacking ML models to flag delay risks before SLAs slip.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-100 text-[#0A0F1F] font-semibold text-sm rounded-full shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer font-sans"
            >
              <span>Launch VendorOS Free</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <a
              href="#copilot"
              className="w-full sm:w-auto px-6 py-3.5 bg-[#141B2E] hover:bg-[#1D2740] border border-white/10 text-white font-medium text-sm rounded-full transition-all flex items-center justify-center space-x-2 font-sans"
            >
              <ShieldCheck className="w-4 h-4 text-[#6366F1]" />
              <span>Explore AI Risk Engine</span>
            </a>
          </motion.div>
        </div>

        {/* Visual Engine & Mouse-Tilt Story Card Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <HeroVisual />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-5"
          >
            <StoryCard />
          </motion.div>
        </div>
      </div>

      {/* Infinite Horizontal Text Loop */}
      <div className="mt-16">
        <Marquee />
      </div>
    </section>
  );
};
