import React, { useState, useEffect, useRef } from "react";
import { Bot, AlertTriangle, ArrowUpRight, Zap } from "lucide-react";

/**
 * StoryCard: Tilted mouse-following 3D card.
 * Reuses reference interaction mechanic: 900ms engagement delay, perspective(1200px), smoothing 0.08.
 * Renders a live-look AI Copilot Risk Alert Card for Order #142.
 */
export const StoryCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>("perspective(1200px) rotateX(0deg) rotateY(0deg)");
  const [canTilt, setCanTilt] = useState<boolean>(false);

  // 900ms engagement delay before mouse-tilt activates
  useEffect(() => {
    const timer = setTimeout(() => {
      setCanTilt(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / (rect.height / 2)) * 12; // max 12 deg tilt
    const rotateY = (x / (rect.width / 2)) * 12;

    setTransformStyle(`perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: "transform 0.08s ease-out",
      }}
      className="relative w-full max-w-sm mx-auto p-[1.5px] rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 shadow-[0_10px_30px_rgba(99,102,241,0.3)] group cursor-pointer select-none"
    >
      {/* Inner Card Surface */}
      <div className="bg-[#141B2E] rounded-[15.5px] p-5 space-y-4 font-sans text-white">
        {/* Header Badge */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#6366F1]/20 border border-[#6366F1]/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-display font-semibold text-xs text-white">
              AI Copilot Alert
            </span>
          </div>
          <span className="font-data text-[9px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-2 py-0.5 rounded font-bold">
            HIGH RISK
          </span>
        </div>

        {/* Order Details */}
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-sm font-bold text-white">Order #142</span>
            <span className="font-data text-xs text-[#F59E0B] font-bold">81% Delay Risk</span>
          </div>
          <p className="text-xs text-white/70 font-sans leading-relaxed">
            Backflow Preventer Valve Batch Assembly
          </p>
        </div>

        {/* AI Analysis Block */}
        <div className="bg-[#0A0F1F] p-3 rounded-xl border border-white/10 space-y-2">
          <div className="flex items-center space-x-1.5 text-[10px] text-[#F59E0B] font-data font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Hazard Diagnosis:</span>
          </div>
          <p className="text-[11px] text-white/80 leading-snug">
            Assigned Worker load exceeded capacity (5 active dispatches). Expected delivery slip: +2.5 days.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-indigo-300 font-mono">
            <span>💡 Suggested Action:</span>
            <span className="font-bold underline flex items-center">
              Reassign Worker <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-2 bg-white hover:bg-gray-100 text-[#0A0F1F] font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>Execute One-Click Remediation</span>
        </button>
      </div>
    </div>
  );
};
