import React, { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface PricingSectionProps {
  onSelectPlan?: (tier: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [isYearly, setIsYearly] = useState(true);

  const handlePlanClick = (tier: string) => {
    if (onSelectPlan) {
      onSelectPlan(tier);
    }
  };

  return (
    <section id="pricing" className="relative min-h-screen flex flex-col justify-center py-28 bg-[#000000] text-white overflow-hidden">
      {/* Giant Backdrop Text: Pricing (Positioned directly centered behind the glassmorphism cards) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <span className="text-[clamp(70px,18vw,360px)] font-display font-extrabold text-white/40 tracking-tighter select-none leading-none opacity-100 filter drop-shadow-2xl">
          Pricing
        </span>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 z-10">
        {/* 3 Glassmorphism Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-12 mb-12">
          {/* Card 1 — Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="bg-white/[0.04] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:bg-white/[0.08] hover:border-white/35 transition-all"
          >
            <div>
              <span className="text-xs font-mono text-neutral-400 block mb-2 font-medium">
                Free Plan
              </span>
              <div className="text-4xl font-display font-bold text-white mb-8 drop-shadow">
                Free
              </div>

              {/* Feature List */}
              <ul className="space-y-4 text-xs font-sans text-neutral-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Send up to 2 transfers per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Basic transaction history</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Limited currency support (USD, EUR, GBP)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Basic security features</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanClick("free")}
              className="w-full py-3 bg-[#0A0A0C]/80 hover:bg-black border border-white/20 rounded-full text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-lg text-center"
            >
              Get Started
            </button>
          </motion.div>

          {/* Card 2 — Standard Plan (Featured Center Card) */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/[0.08] backdrop-blur-3xl border border-white/30 rounded-3xl p-8 flex flex-col justify-between shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative transform md:-translate-y-2 hover:bg-white/[0.12] transition-all"
          >
            <div>
              <span className="text-xs font-mono text-neutral-200 block mb-2 font-semibold">
                Standard Plan
              </span>
              <div className="text-4xl font-display font-bold text-white mb-8 drop-shadow">
                {isYearly ? "$9.99/m" : "$12.99/m"}
              </div>

              {/* Feature List */}
              <ul className="space-y-4 text-xs font-sans text-neutral-200 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Unlimited transfers</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Transaction history with export options</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Expanded currency support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Advanced security features</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanClick("growth")}
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-xl text-center"
            >
              Get Started
            </button>
          </motion.div>

          {/* Card 3 — Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/[0.04] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:bg-white/[0.08] hover:border-white/35 transition-all"
          >
            <div>
              <span className="text-xs font-mono text-neutral-400 block mb-2 font-medium">
                Enterprise Plan
              </span>
              <div className="text-4xl font-display font-bold text-white mb-8 drop-shadow">
                {isYearly ? "$19.99/m" : "$24.99/m"}
              </div>

              {/* Feature List */}
              <ul className="space-y-4 text-xs font-sans text-neutral-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Unlimited transfers with priority processing</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Comprehensive transaction analytics</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>24/7 priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Full currency support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Enhanced security features</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handlePlanClick("scale")}
              className="w-full py-3 bg-[#0A0A0C]/80 hover:bg-black border border-white/20 rounded-full text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-lg text-center"
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Bottom Toggle: Billed Yearly */}
        <div className="flex items-center space-x-3 font-mono text-xs text-neutral-300">
          <button
            type="button"
            onClick={() => setIsYearly(!isYearly)}
            className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
              isYearly ? "bg-white justify-end" : "bg-[#222222] justify-start"
            }`}
          >
            <motion.div
              layout
              className={`w-4 h-4 rounded-full ${isYearly ? "bg-black" : "bg-white"}`}
            />
          </button>
          <span>Billed Yearly</span>
        </div>
      </div>
    </section>
  );
};
