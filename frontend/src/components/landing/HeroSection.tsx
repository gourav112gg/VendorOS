import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState("");

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  return (
    <section className="relative pt-32 pb-20 bg-[#09090B] text-white overflow-hidden">
      {/* Background Globe Mesh Wireframe Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border border-neutral-700/50 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full border border-neutral-700/40 flex items-center justify-center">
            <div className="w-[400px] h-[400px] rounded-full border border-neutral-700/30" />
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Release Announcement Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#121215] border border-[#27272A] rounded-full text-xs font-mono text-neutral-300 mb-8 cursor-pointer hover:border-neutral-500 transition-colors shadow-lg"
          onClick={onGetStarted}
        >
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> VendorOS 2.0
          </span>
          <span className="text-neutral-500">•</span>
          <span>release announced</span>
          <span className="text-neutral-400 flex items-center gap-1 font-semibold">
            Learn more <ArrowRight className="w-3 h-3" />
          </span>
        </motion.div>

        {/* Display Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl mx-auto"
        >
          Unlock the Future <br />
          <span className="text-neutral-300">of Operations.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xs sm:text-sm font-sans text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Streamline your company's field service orders, inventory tracking, dispatching, and AI-driven risk evaluation from your phone or desktop.
        </motion.p>

        {/* Work Email Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmitEmail}
          className="max-w-md mx-auto mb-8 flex items-center bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] focus-within:border-white/50 rounded-full p-1.5 transition-all shadow-xl"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email..."
            className="flex-grow bg-transparent px-4 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-white hover:bg-neutral-200 text-black text-xs font-mono font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <span>Join Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.form>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] font-mono text-neutral-400 mb-16"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-time AI Risk Analysis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Field Service Dispatch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trusted by 10k+ Operations</span>
          </div>
        </motion.div>

        {/* Phone Frame Showcase with Floating Tags */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-sm mx-auto"
        >
          {/* Left Floating Tag */}
          <div className="hidden sm:flex absolute -left-28 top-20 bg-[#121215]/90 backdrop-blur-md border border-[#27272A] rounded-xl px-3.5 py-2 text-[10px] font-mono text-neutral-300 shadow-2xl items-center gap-2 z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>24,000+ problem solved</span>
          </div>

          {/* Right Floating Tag */}
          <div className="hidden sm:flex absolute -right-28 top-20 bg-[#121215]/90 backdrop-blur-md border border-[#27272A] rounded-xl px-3.5 py-2 text-[10px] font-mono text-neutral-300 shadow-2xl flex-col items-start gap-1 z-20">
            <div className="flex items-center text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-amber-400" />
              ))}
            </div>
            <span className="text-[9px] text-neutral-400">Trusted by 10k+ teams with 4.9/5</span>
          </div>

          {/* Device Mockup */}
          <div className="relative mx-auto border-[10px] border-[#1C1C1E] rounded-[42px] overflow-hidden shadow-2xl bg-[#000000] aspect-[9/18] max-w-[280px]">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-[#1C1C1E] rounded-b-2xl z-30 flex items-center justify-center">
              <div className="w-16 h-3.5 bg-black rounded-full" />
            </div>

            {/* Screen Content */}
            <div className="p-4 pt-8 text-left font-mono space-y-4 text-white">
              {/* Header inside phone */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 pb-2 border-b border-neutral-800">
                <span>Total Monthly Value</span>
                <span className="text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded text-[8px]">
                  ↑ 12.5%
                </span>
              </div>

              {/* Big Metric */}
              <div>
                <span className="text-2xl font-bold text-white">$12,450</span>
                <span className="text-[10px] text-neutral-500 block">1,0812 pts</span>
              </div>

              {/* Sparkline Visual */}
              <div className="h-20 bg-[#121215] rounded-xl p-2 border border-neutral-800 flex items-end gap-1">
                {[40, 55, 35, 70, 60, 85, 95, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-grow bg-emerald-500/80 rounded-t"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Order Node Cards */}
              <div className="space-y-2 pt-2">
                <div className="bg-[#121215] border border-neutral-800 rounded-lg p-2 flex items-center justify-between text-[9px]">
                  <div>
                    <span className="text-white font-bold block">Dispatch #409</span>
                    <span className="text-neutral-500">Scheduled • 10:30 AM</span>
                  </div>
                  <span className="text-emerald-400 font-bold">$1,500</span>
                </div>
                <div className="bg-[#121215] border border-neutral-800 rounded-lg p-2 flex items-center justify-between text-[9px]">
                  <div>
                    <span className="text-white font-bold block">Leak Fix #210</span>
                    <span className="text-neutral-500">In Progress • Risk 22</span>
                  </div>
                  <span className="text-amber-400 font-bold">$850</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
