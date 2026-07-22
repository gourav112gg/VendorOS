import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, LineChart, GitBranch, MessageSquare, AlertTriangle, ArrowRight } from "lucide-react";

/**
 * CopilotGrid: Section 3 — AI Operations Copilot
 * 3-Card Grid:
 * 1. Rotating Q&A Card (4000ms interval cycling through factory owner queries).
 * 2. Risk Prediction Chart Card (SVG area graph with 1400ms mask reveal).
 * 3. Order-Flow Card (SVG bezier paths with traveling animated dots Owner → Manager → Worker → Delivery).
 */
export const CopilotGrid: React.FC = () => {
  // Q&A cycling index
  const [qaIndex, setQaIndex] = useState(0);

  const qaList = [
    {
      q: "Which order is most at risk this week?",
      a: "Order #142 (81% Delay Risk). Worker capacity is currently exceeded on Stage 3.",
    },
    {
      q: "Why is Order #142 flagged?",
      a: "Delivery is due in 24 hours with 2 incomplete verification checklist stages remaining.",
    },
    {
      q: "What should I do about it?",
      a: "Reassign Technician Rahul to complete Stage 2 assembly to prevent a 2.5-day SLA slip.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQaIndex((prev) => (prev + 1) % qaList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="copilot" className="py-20 bg-[#0A0F1F] text-white border-b border-white/10 relative">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-12">
        {/* Section Title */}
        <div className="space-y-3">
          <span className="font-data text-xs text-[#6366F1] bg-[#6366F1]/10 px-3 py-1 rounded-full border border-[#6366F1]/20">
            AI OPERATIONS COPILOT
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Intelligent risk scoring before SLAs slip.
          </h2>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Rotating Q&A Card */}
          <div className="bg-[#141B2E] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#6366F1]" />
                <span className="font-display font-semibold text-sm text-white">
                  Live Copilot Q&A
                </span>
              </div>
              <span className="font-data text-[9px] text-white/50">Auto-Cycles 4s</span>
            </div>

            {/* Q&A Content with Fade Transition */}
            <div className="min-h-[140px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={qaIndex}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.4 }}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <p className="font-mono text-xs font-semibold text-white">
                      "{qaList[qaIndex].q}"
                    </p>
                  </div>

                  <div className="bg-[#0A0F1F] p-3 rounded-xl border border-white/10 space-y-1">
                    <span className="font-data text-[9px] text-[#6366F1] font-bold block">
                      VendorOS AI Answer:
                    </span>
                    <p className="font-sans text-xs text-white/80 leading-relaxed">
                      {qaList[qaIndex].a}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center space-x-1.5 pt-2">
              {qaList.map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === qaIndex ? "bg-[#6366F1] w-4" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Mask-Revealed Risk Chart Card */}
          <div className="bg-[#141B2E] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <LineChart className="w-5 h-5 text-[#F59E0B]" />
                <span className="font-display font-semibold text-sm text-white">
                  Risk Score Trajectory
                </span>
              </div>
              <span className="font-data text-[9px] text-[#F59E0B] font-bold">1400ms Reveal</span>
            </div>

            {/* SVG Area Chart with Mask Width Animation */}
            <div className="relative h-36 flex items-center justify-center my-auto">
              <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="none">
                {/* Mask for Reveal */}
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
                <line x1="0" y1="70" x2="300" y2="70" stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                {/* Animated Chart Area */}
                <motion.g
                  initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" }}
                  whileInView={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <path
                    d="M 0 90 Q 60 70 120 85 T 240 40 L 300 20 L 300 120 L 0 120 Z"
                    fill="url(#chartGrad)"
                  />
                  <path
                    d="M 0 90 Q 60 70 120 85 T 240 40 L 300 20"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                  />
                  <circle cx="300" cy="20" r="5" fill="#F59E0B" className="animate-ping" />
                </motion.g>
              </svg>

              <div className="absolute top-2 right-2 bg-[#F59E0B]/20 border border-[#F59E0B] px-2 py-0.5 rounded font-data text-[10px] text-[#F59E0B]">
                Peak Risk: 81%
              </div>
            </div>

            <p className="text-[11px] text-white/60 font-sans border-t border-white/10 pt-2">
              Predictive Stacking ML calculates risk progression across stages.
            </p>
          </div>

          {/* Card 3: Order-Flow Lifecycle Card */}
          <div className="bg-[#141B2E] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-emerald-400" />
                <span className="font-display font-semibold text-sm text-white">
                  Lifecycle Order Flow
                </span>
              </div>
              <span className="font-data text-[9px] text-[#10B981]">Owner → Delivery</span>
            </div>

            {/* Bezier Path Animated Nodes */}
            <div className="relative h-36 flex items-center justify-center my-auto">
              <svg className="w-full h-full" viewBox="0 0 280 100">
                <path
                  id="flowPath"
                  d="M 20 50 Q 90 10 140 50 T 260 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Animated Node Circle moving along path */}
                <circle r="6" fill="#10B981">
                  <animateMotion repeatCount="indefinite" dur="3s" path="M 20 50 Q 90 10 140 50 T 260 50" />
                </circle>

                {/* Stage Markers */}
                <circle cx="20" cy="50" r="8" fill="#6366F1" />
                <circle cx="140" cy="50" r="8" fill="#F59E0B" />
                <circle cx="260" cy="50" r="8" fill="#10B981" />
              </svg>

              <div className="absolute bottom-1 w-full flex justify-between px-2 font-data text-[9px] text-white/70">
                <span>Owner</span>
                <span className="text-[#F59E0B]">Manager (Flagged)</span>
                <span className="text-[#10B981]">Delivery</span>
              </div>
            </div>

            <p className="text-[11px] text-white/60 font-sans border-t border-white/10 pt-2">
              Live dot-on-path vector animation representing actual order progression.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
