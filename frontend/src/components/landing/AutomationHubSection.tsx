import React, { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle } from "lucide-react";

export const AutomationHubSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"performance" | "automation" | "status">("automation");

  return (
    <section id="automation" className="relative h-screen min-h-screen flex flex-col justify-center py-16 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300">
      <div className="max-w-5xl mx-auto px-4 w-full">
        {/* 3-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Column — Navigation Menu Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6 }}
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
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="relative py-12 flex items-center justify-center"
          >
            {/* Rotating Outer Ring & Node Badges Container */}
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 rounded-full border-2 border-dashed border-neutral-400 flex items-center justify-center relative shadow-inner"
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
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bg-black text-white border border-neutral-700 px-6 py-2.5 rounded-full font-mono text-xs font-bold shadow-2xl flex items-center gap-2 z-10"
              >
                <span>&lt; Automation &gt;</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Column — Feature Details Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.6 }}
            className="font-mono bg-white border border-neutral-300 rounded-3xl p-6 sm:p-8 shadow-xl"
          >
            <h3 className="text-xl font-bold text-neutral-900 mb-3">
              {activeTab === "performance"
                ? "AI Performance Monitoring"
                : activeTab === "automation"
                ? "AI Task Automation"
                : "AI Status Command"}
            </h3>

            <p className="text-xs text-neutral-600 leading-relaxed mb-6">
              {activeTab === "performance"
                ? "Continuously audit technician response times, job value metrics, and operational SLAs in real-time."
                : activeTab === "automation"
                ? "Streamline your field work order assignments, dispatch schedules, and inventory tracking with zero manual effort."
                : "Execute voice-driven and natural-language commands to trigger instant dispatches across your entire field network."}
            </p>

            <a
              href="#bento"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-black hover:text-neutral-700 transition-colors"
            >
              <span>Explore Features</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
