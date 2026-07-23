import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeftRight, Clock, Layers } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const AppIntegrationSection: React.FC = () => {
  const [val1, setVal1] = useState("1.0812");
  const [val2, setVal2] = useState("2.542");
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

  const handleSwap = () => {
    setVal1((prev) => (prev === "1.0812" ? "2.542" : "1.0812"));
    setVal2((prev) => (prev === "2.542" ? "1.0812" : "2.542"));
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative min-h-[100dvh] md:h-screen flex flex-col justify-center py-16 bg-[#E3E3E3] text-black overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 text-center w-full">
        {/* Header */}
        <motion.h2
          style={{
            opacity: Math.min(1, progress * 3),
            transform: `translateY(${(1 - Math.min(1, progress * 3)) * 30}px)`,
          }}
          className="text-3xl sm:text-5xl font-mono font-bold tracking-tight mb-4 text-neutral-900"
        >
          Integrate with popular apps
        </motion.h2>

        <motion.p
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.1) * 3)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.1) * 3))) * 25}px)`,
          }}
          className="text-xs sm:text-sm font-mono text-neutral-600 max-w-2xl mx-auto mb-12"
        >
          Streamline your work order dispatching, invoicing, and real-time operational risk evaluation directly from your device.
        </motion.p>

        {/* 2-Column Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Left Card — Time Saving Automation */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.2) * 2.5)),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.2) * 2.5))) * 50}px) scale(${
                0.9 + Math.min(1, Math.max(0, (progress - 0.2) * 2.5)) * 0.1
              })`,
            }}
            className="living-card bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-mono mb-6">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Time-Saving Automation</span>
              </div>

              {/* Interactive Value Swap Preview */}
              <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3">
                  <span className="text-xs font-mono font-bold text-neutral-900">{val1}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Rate A</span>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shadow-md"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-xl p-3">
                  <span className="text-xs font-mono font-bold text-neutral-900">{val2}</span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">Rate B</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Title */}
            <div>
              <h3 className="text-lg font-mono font-bold text-neutral-900 leading-snug">
                With automated reports and post scheduling
              </h3>
            </div>
          </motion.div>

          {/* Right Card — All-in-One Field Solution */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.35) * 2.5)),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.35) * 2.5))) * 50}px) scale(${
                0.9 + Math.min(1, Math.max(0, (progress - 0.35) * 2.5)) * 0.1
              })`,
            }}
            className="living-card bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-black text-white rounded-full text-[10px] font-mono mb-6">
                <Layers className="w-3 h-3 text-blue-400" />
                <span>All-in-One Field Solution</span>
              </div>

              {/* Mobile Dashboard Preview Card */}
              <div className="bg-[#09090B] text-white border border-neutral-800 rounded-2xl p-4 mb-6 font-mono space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-[10px] text-neutral-400">
                  <span>VendorOS Field Live</span>
                  <span className="text-emerald-400">● Operational</span>
                </div>
                <div>
                  <span className="text-xl font-bold">$12,450</span>
                  <span className="text-[9px] text-neutral-400 block">Active Dispatch Stream</span>
                </div>
                <div className="h-14 bg-neutral-900 rounded-lg p-2 flex items-end gap-1">
                  {[30, 50, 45, 80, 65, 90, 100].map((h, idx) => (
                    <div key={idx} className="flex-grow bg-white/80 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Card Title */}
            <div>
              <h3 className="text-lg font-mono font-bold text-neutral-900 leading-snug">
                Overview of the process to give users an idea
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
