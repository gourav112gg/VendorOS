import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeftRight, Clock, Layers, Sparkles } from "lucide-react";

export const AppIntegrationSection: React.FC = () => {
  const [val1, setVal1] = useState("1.0812");
  const [val2, setVal2] = useState("2.542");

  const handleSwap = () => {
    setVal1((prev) => (prev === "1.0812" ? "2.542" : "1.0812"));
    setVal2((prev) => (prev === "2.542" ? "1.0812" : "2.542"));
  };

  return (
    <section id="features" className="relative min-h-screen flex flex-col justify-center py-24 bg-[#E3E3E3] text-black">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Header */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-mono font-bold tracking-tight mb-4 text-neutral-900"
        >
          Integrate with popular apps
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs sm:text-sm font-mono text-neutral-600 max-w-2xl mx-auto mb-16"
        >
          Streamline your work order dispatching, invoicing, and real-time operational risk evaluation directly from your device.
        </motion.p>

        {/* 2-Column Showcase Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Left Card — Time Saving Automation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between"
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
