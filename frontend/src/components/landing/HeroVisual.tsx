import React from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Clock, User, ShieldCheck } from "lucide-react";

/**
 * HeroVisual: Self-built vector SVG animation illustrating real-time order node flows
 * through VendorOS's multi-tier stages (Owner → Manager → Worker → Delivery)
 * with an active risk alert flag. Zero external image/video dependencies.
 */
export const HeroVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-72 sm:h-80 bg-[#141B2E] border border-white/10 rounded-2xl p-6 overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6366F1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      {/* Header Bar */}
      <div className="flex justify-between items-center z-10 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
          <span className="font-data text-[10px] text-white/70">
            Realtime Order Flow Pipeline
          </span>
        </div>
        <span className="font-data text-[10px] text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded border border-[#6366F1]/20">
          Live Simulation
        </span>
      </div>

      {/* Vector Pipeline Scene */}
      <div className="relative flex-1 flex items-center justify-between px-4 z-10">
        {/* SVG Connecting Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 60 120 Q 200 60 340 120 T 600 120"
            fill="none"
            stroke="rgba(99, 102, 241, 0.2)"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          {/* Pulsing Risk Flow Line */}
          <path
            d="M 60 120 Q 200 60 340 120"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            opacity="0.6"
          />
        </svg>

        {/* Stage 1: Owner Dispatch */}
        <div className="flex flex-col items-center space-y-2 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white shadow-lg"
          >
            <ShieldCheck className="w-6 h-6 text-[#6366F1]" />
          </motion.div>
          <span className="font-data text-[9px] text-white/60">1. Owner</span>
          <span className="font-mono text-[10px] text-white font-semibold">Dispatch</span>
        </div>

        {/* Stage 2: Manager Assembly */}
        <div className="flex flex-col items-center space-y-2 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white shadow-lg relative"
          >
            <User className="w-6 h-6 text-indigo-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#10B981]" />
          </motion.div>
          <span className="font-data text-[9px] text-white/60">2. Manager</span>
          <span className="font-mono text-[10px] text-emerald-400 font-semibold">Stage Built</span>
        </div>

        {/* Stage 3: Worker Production (FLAGGED AT RISK) */}
        <div className="flex flex-col items-center space-y-2 z-10 relative">
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-14 h-14 rounded-xl bg-[#F59E0B]/10 border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.3)] relative"
          >
            <AlertTriangle className="w-7 h-7 text-[#F59E0B]" />
            <span className="absolute -top-2 -right-2 bg-[#F59E0B] text-black font-data font-bold text-[9px] px-1.5 py-0.5 rounded shadow">
              81% Risk
            </span>
          </motion.div>
          <span className="font-data text-[9px] text-[#F59E0B]">3. Worker</span>
          <span className="font-mono text-[10px] text-[#F59E0B] font-bold">Order #142 Flagged</span>
        </div>

        {/* Stage 4: Delivery */}
        <div className="flex flex-col items-center space-y-2 z-10">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-white/5 border border-white/20 flex items-center justify-center text-white shadow-lg opacity-60"
          >
            <Clock className="w-6 h-6 text-white/50" />
          </motion.div>
          <span className="font-data text-[9px] text-white/40">4. Delivery</span>
          <span className="font-mono text-[10px] text-white/50">Pending</span>
        </div>
      </div>

      {/* Footer Banner */}
      <div className="bg-[#0A0F1F]/80 border border-white/10 rounded-lg p-2.5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span className="text-xs font-sans text-white/80">
            AI Copilot detected worker task overload on Stage 3.
          </span>
        </div>
        <span className="font-data text-[9px] text-[#F59E0B] underline cursor-pointer">
          View Remediation →
        </span>
      </div>
    </div>
  );
};
