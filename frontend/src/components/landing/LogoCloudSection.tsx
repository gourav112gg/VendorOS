import React from "react";
import { motion } from "motion/react";
import { Database, Flame, Globe, Server, Shield, Zap } from "lucide-react";

export const LogoCloudSection: React.FC = () => {
  const techLogos = [
    { name: "Firebase", icon: Flame, color: "text-amber-400" },
    { name: "Google", icon: Globe, color: "text-blue-400" },
    { name: "MongoDB", icon: Database, color: "text-emerald-400" },
    { name: "Render", icon: Server, color: "text-purple-400" },
    { name: "Vercel", icon: Zap, color: "text-white" },
    { name: "Razorpay", icon: Shield, color: "text-cyan-400" },
  ];

  // Repeat logos for seamless infinite loop
  const listRightToLeft = [...techLogos, ...techLogos, ...techLogos, ...techLogos];
  const listLeftToRight = [...techLogos, ...techLogos, ...techLogos, ...techLogos];

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300">
      <div className="max-w-5xl mx-auto px-4 text-center mb-16 z-10">
        <h2 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight mb-4 text-neutral-900">
          Integrate with popular apps.
        </h2>
        <p className="text-xs sm:text-sm font-mono text-neutral-600 max-w-xl mx-auto">
          Powered by enterprise infrastructure including Firebase, Google, MongoDB, Render, Vercel, and Razorpay.
        </p>
      </div>

      {/* Diagonal Crossed Strips Area */}
      <div className="relative w-full py-16 flex items-center justify-center overflow-hidden">
        {/* Strip 1: Tilted rotate-3, Scrolling Right -> Left */}
        <div className="absolute w-[120%] bg-black text-white py-4 shadow-2xl transform rotate-3 z-20 border-y-2 border-amber-400/80 flex overflow-hidden select-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex items-center space-x-12 whitespace-nowrap font-mono text-base font-bold uppercase tracking-widest px-4"
          >
            {listRightToLeft.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 bg-neutral-900/80 border border-neutral-800 px-4 py-1.5 rounded-full">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-white">{item.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Strip 2: Tilted -rotate-3, Scrolling Left -> Right */}
        <div className="absolute w-[120%] bg-neutral-950 text-white py-4 shadow-2xl transform -rotate-3 z-10 border-y-2 border-neutral-700 flex overflow-hidden select-none">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex items-center space-x-12 whitespace-nowrap font-mono text-base font-bold uppercase tracking-widest px-4"
          >
            {listLeftToRight.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 bg-neutral-900/80 border border-neutral-800 px-4 py-1.5 rounded-full">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-white">{item.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
