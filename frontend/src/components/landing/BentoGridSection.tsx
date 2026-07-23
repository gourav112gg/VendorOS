import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Lock, ShieldCheck } from "lucide-react";

export const BentoGridSection: React.FC = () => {
  return (
    <section id="bento" className="relative h-screen min-h-screen flex flex-col justify-center py-16 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300">
      <div className="max-w-5xl mx-auto px-4 w-full">
        {/* 3-Column Bento Grid Container */}
        <div className="living-card-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Left Column (Stack of 2 Cards) */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Top Left Card — Dark Matrix Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.5 }}
              className="living-card relative overflow-hidden bg-[#09090B] text-white border border-neutral-800 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col justify-between min-h-[200px]"
            >
              {/* Matrix Binary Graphic Background Overlay */}
              <div className="absolute right-2 top-2 font-mono text-[9px] text-neutral-700/40 select-none pointer-events-none text-right leading-tight">
                01010011<br />
                11010101<br />
                00101101<br />
                10101110
              </div>

              <div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-mono font-bold text-white mb-2">
                  Actionable Analytics Insights
                </h3>
              </div>

              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Provides clear, personalized risk plan and strategy to improve your performance.
              </p>
            </motion.div>

            {/* Bottom Left Card — White Clock Automation Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="living-card bg-white border border-neutral-300 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between min-h-[200px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-black" />
                </div>
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-mono font-bold text-neutral-900 mb-2">
                  Time-Saving Automation
                </h3>
                <p className="text-xs font-mono text-neutral-600 leading-relaxed">
                  All-in-One field operations report and task scheduling save 20+ hours every month.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Center Column — Tall White Card with Phone & App Badges */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="living-card bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between text-center items-center"
          >
            {/* Phone Frame Mockup */}
            <div className="w-full max-w-[200px] border-[8px] border-[#1C1C1E] rounded-[32px] overflow-hidden bg-[#09090B] text-white p-3 font-mono text-left shadow-2xl space-y-3">
              <div className="text-[9px] text-neutral-400 border-b border-neutral-800 pb-1 flex justify-between">
                <span>Onboarding</span>
                <span className="text-emerald-400 font-bold">1.0812</span>
              </div>
              <div className="bg-[#121215] border border-neutral-800 rounded-lg p-2 space-y-1">
                <span className="text-[10px] font-bold block text-white">VendorOS Dispatch</span>
                <span className="text-[8px] text-neutral-400 block">$2,542 active volume</span>
              </div>
            </div>

            {/* Download Now PWA / Web App Button */}
            <div className="w-full pt-6 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if ('serviceWorker' in navigator && (window as any).deferredPwaPrompt) {
                    (window as any).deferredPwaPrompt.prompt();
                  } else {
                    alert("Downloading VendorOS Application... Google Play auto-verification initialized.");
                  }
                }}
                className="w-full max-w-[200px] py-2.5 px-4 bg-black text-white hover:bg-neutral-800 border border-neutral-700 rounded-2xl font-mono text-[10px] font-bold flex items-center justify-center space-x-2 shadow-xl transition-all cursor-pointer hover:scale-105"
              >
                <span>⚡</span>
                <span>Download Now</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column (Stack of 2 Cards) */}
          <div className="space-y-6 flex flex-col justify-between">
            {/* Top Right Card — White Grow Solution Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="living-card bg-white border border-neutral-300 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between min-h-[200px]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-black" />
                </div>
                <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-mono font-bold text-neutral-900 mb-2">
                  All-in-One Grow Solution
                </h3>
                <p className="text-xs font-mono text-neutral-600 leading-relaxed">
                  Overview of the process to give users an idea of how it is to get started.
                </p>
              </div>
            </motion.div>

            {/* Bottom Right Card — Dark Matrix Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="living-card relative overflow-hidden bg-[#09090B] text-white border border-neutral-800 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col justify-between min-h-[200px]"
            >
              {/* Matrix Binary Graphic Background Overlay */}
              <div className="absolute right-2 top-2 font-mono text-[9px] text-neutral-700/40 select-none pointer-events-none text-right leading-tight">
                11010011<br />
                00101101<br />
                10101110<br />
                01010101
              </div>

              <div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-base font-mono font-bold text-white mb-2">
                  Actionable Analytics Insights
                </h3>
              </div>

              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Provides clear, personalized risk plan and strategy to improve your performance.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
