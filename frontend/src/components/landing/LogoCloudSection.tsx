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

  const listRightToLeft = [...techLogos, ...techLogos, ...techLogos, ...techLogos];
  const listLeftToRight = [...techLogos, ...techLogos, ...techLogos, ...techLogos];

  return (
    <section className="relative h-screen min-h-screen flex flex-col justify-between py-16 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300">
      {/* Title */}
      <div className="max-w-5xl mx-auto px-4 text-center z-30 pt-8">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-5xl font-mono font-bold tracking-tight mb-4 text-neutral-900"
        >
          Integrate with popular apps.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs sm:text-sm font-mono text-neutral-600 max-w-xl mx-auto"
        >
          Powered by enterprise infrastructure including Firebase, Google, MongoDB, Render, Vercel, and Razorpay.
        </motion.p>
      </div>

      {/* Bold Diagonal Crossing Strips Container */}
      <div className="relative w-full flex-grow flex items-center justify-center overflow-hidden my-auto">
        {/* Strip 1: Bold Tilted rotate-[12deg], Moving Right -> Left */}
        <div className="absolute w-[150vw] bg-black text-white py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform rotate-[12deg] z-20 border-y-2 border-amber-400 flex overflow-hidden select-none">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="flex items-center space-x-12 whitespace-nowrap font-mono text-base font-bold uppercase tracking-widest px-4"
          >
            {listRightToLeft.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 bg-neutral-900/90 border border-neutral-800 px-5 py-2 rounded-full shadow-md">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-white">{item.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Strip 2: Bold Tilted -rotate-[12deg], Moving Left -> Right */}
        <div className="absolute w-[150vw] bg-[#09090B] text-white py-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transform -rotate-[12deg] z-10 border-y-2 border-cyan-400 flex overflow-hidden select-none">
          <motion.div
            animate={{ x: ["-50%", "0%"] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="flex items-center space-x-12 whitespace-nowrap font-mono text-base font-bold uppercase tracking-widest px-4"
          >
            {listLeftToRight.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center space-x-3 bg-neutral-900/90 border border-neutral-800 px-5 py-2 rounded-full shadow-md">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-white">{item.name}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Center Intersection Glow Circle */}
        <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 blur-2xl z-25 pointer-events-none" />
      </div>
    </section>
  );
};
