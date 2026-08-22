import React, { useState } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { NumberRoll } from "./NumberRoll";

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
    <section
      id="pricing"
      className="relative min-h-[100dvh] md:h-screen flex flex-col justify-center py-28 bg-[#000000] text-white overflow-hidden"
    >
      {/* Giant Backdrop Text: Pricing */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
      >
        <span className="text-[clamp(70px,18vw,360px)] font-display font-extrabold text-white/40 tracking-tighter select-none leading-none opacity-100 filter drop-shadow-2xl">
          Pricing
        </span>
      </motion.div>

      <div className="relative max-w-6xl mx-auto px-4 z-10">
        {/* 3 Glassmorphism Cards Grid */}
        <div className="living-card-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-12 mb-12">
          {/* Card 1 — Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="living-card bg-white/[0.04] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:bg-white/[0.08] hover:border-white/35 transition-all"
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
              type="button"
              onClick={() => handlePlanClick("free")}
              className="w-full py-3 bg-[#0A0A0C]/80 hover:bg-black border border-white/20 rounded-full text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-lg text-center"
            >
              Get Started
            </button>
          </motion.div>

          {/* Card 2 — Standard Plan (Featured Center Card) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="living-card bg-white/[0.08] backdrop-blur-3xl border border-white/30 rounded-3xl p-8 flex flex-col justify-between shadow-[0_25px_60px_rgba(0,0,0,0.9)] relative transform md:-translate-y-2 hover:bg-white/[0.12] transition-all"
          >
            <div>
              <span className="text-xs font-mono text-neutral-200 block mb-2 font-semibold">
                Standard Plan
              </span>
              <div className="text-4xl font-display font-bold text-white mb-8 drop-shadow">
                {isYearly ? (
                  <>
                    <NumberRoll value={9.99} prefix="$" decimals={2} />
                    <span className="text-xs font-normal">/m</span>
                  </>
                ) : (
                  <>
                    <NumberRoll value={12.99} prefix="$" decimals={2} />
                    <span className="text-xs font-normal">/m</span>
                  </>
                )}
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
              type="button"
              onClick={() => handlePlanClick("growth")}
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-xl text-center"
            >
              Get Started
            </button>
          </motion.div>

          {/* Card 3 — Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="living-card bg-white/[0.04] backdrop-blur-3xl border border-white/20 rounded-3xl p-8 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:bg-white/[0.08] hover:border-white/35 transition-all"
          >
            <div>
              <span className="text-xs font-mono text-neutral-400 block mb-2 font-medium">
                Enterprise Plan
              </span>
              <div className="text-4xl font-display font-bold text-white mb-8 drop-shadow">
                Custom
              </div>

              {/* Feature List */}
              <ul className="space-y-4 text-xs font-sans text-neutral-300 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Unlimited transfers with dedicated limits</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Custom analytics and reporting</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>24/7 dedicated account manager</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Global currency and payout support</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>Enterprise-grade SLA & security</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handlePlanClick("enterprise")}
              className="w-full py-3 bg-[#0A0A0C]/80 hover:bg-black border border-white/20 rounded-full text-xs font-mono font-bold text-white transition-all cursor-pointer shadow-lg text-center"
            >
              Get Started
            </button>
          </motion.div>
        </div>

        {/* Monthly vs Yearly Toggle Pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-full flex items-center gap-1 shadow-2xl font-mono text-xs">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer ${
                !isYearly ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isYearly ? "bg-white text-black shadow-md" : "text-neutral-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="bg-emerald-500 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

