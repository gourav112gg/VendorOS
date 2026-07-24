import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const AutomationHubSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"performance" | "automation" | "status">("automation");
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
      setProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Cycle activeTab automatically based on pinned scroll progress
  useEffect(() => {
    if (progress < 0.35) {
      setActiveTab("performance");
    } else if (progress < 0.7) {
      setActiveTab("automation");
    } else {
      setActiveTab("status");
    }
  }, [progress]);

  return (
    <section
      id="automation"
      ref={sectionRef}
      className="relative min-h-[100dvh] lg:h-screen flex flex-col justify-center py-12 lg:py-16 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300"
    >
      <div className="max-w-5xl mx-auto px-4 w-full">
        {/* 3-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column — Navigation Menu Tabs */}
          <motion.div
            style={{
              opacity: Math.min(1, progress * 3),
              transform: `translateX(${(1 - Math.min(1, progress * 3)) * -40}px)`,
            }}
            className="space-y-3 font-mono"
          >
            <button
              onClick={() => setActiveTab("performance")}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                activeTab === "performance"
                  ? "bg-black text-white shadow-lg"
                  : "bg-white/80 hover:bg-white text-neutral-700 border border-neutral-300"
              }`}
            >
              <span>AI Performance Monitoring</span>
              {activeTab === "performance" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab("automation")}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                activeTab === "automation"
                  ? "bg-black text-white shadow-lg"
                  : "bg-white/80 hover:bg-white text-neutral-700 border border-neutral-300"
              }`}
            >
              <span>AI Task Automation</span>
              {activeTab === "automation" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => setActiveTab("status")}
              className={`w-full text-left px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                activeTab === "status"
                  ? "bg-black text-white shadow-lg"
                  : "bg-white/80 hover:bg-white text-neutral-700 border border-neutral-300"
              }`}
            >
              <span>AI Status Command</span>
              {activeTab === "status" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            </button>
          </motion.div>

          {/* Center Column — Circular Hub & Spoke Node Visual */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.1) * 3)),
              transform: `scale(${0.8 + Math.min(1, Math.max(0, (progress - 0.1) * 3)) * 0.2})`,
            }}
            className="relative py-8 lg:py-12 flex items-center justify-center"
          >
            {/* Rotating Outer Ring & Node Badges Container */}
            <div className="relative flex items-center justify-center">
              <motion.div
                style={{ rotate: progress * 360 }}
                className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-neutral-400 flex items-center justify-center relative shadow-inner"
              >
                {/* Radial Nodes */}
                <div className="absolute -top-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  🐙
                </div>
                <div className="absolute top-10 -right-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  ❖
                </div>
                <div className="absolute bottom-10 -right-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  💬
                </div>
                <div className="absolute -bottom-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  
                </div>
                <div className="absolute bottom-10 -left-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  ⚡
                </div>
                <div className="absolute top-10 -left-4 w-10 h-10 rounded-full bg-white border border-neutral-300 shadow-md flex items-center justify-center text-xs font-bold font-mono">
                  ⚙️
                </div>
              </motion.div>

              {/* Fixed Upright Center Automation Pill */}
              <motion.div
                className="absolute bg-black text-white border border-neutral-700 px-6 py-2.5 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 z-10"
              >
                <span>&lt; Automation &gt;</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column — Q&A Dynamic Card Details */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.25) * 2.5)),
              transform: `translateX(${(1 - Math.min(1, Math.max(0, (progress - 0.25) * 2.5))) * 40}px)`,
            }}
            className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl font-mono space-y-6"
          >
            {activeTab === "performance" && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-widest">
                  MODULE 01
                </span>
                <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                  AI Performance Diagnostics
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Real-time telemetry algorithms evaluate technician dispatch velocity and job completion rates with predictive risk scoring.
                </p>
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between text-[10px] text-neutral-500 font-bold">
                    <span>Dispatch Velocity</span>
                    <span>94.8%</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "94.8%" }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-black rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "automation" && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-widest">
                  MODULE 02
                </span>
                <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                  Zero-Touch Dispatch Rules
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Auto-route work orders to closest qualified workers based on inventory stock, traffic models, and skill certificates.
                </p>
              </div>
            )}

            {activeTab === "status" && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-widest">
                  MODULE 03
                </span>
                <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                  Natural Language Command
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Query operational status, issue invoices, and trigger emergency stock re-orders using simple voice or text prompts.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
