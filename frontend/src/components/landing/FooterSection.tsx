import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative min-h-screen flex flex-col justify-between pt-16 pb-6 bg-[#000000] text-white overflow-hidden border-t border-neutral-900 font-mono">
      {/* Top Header Columns Container matching Codezen layout */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-xs tracking-wider">
          {/* Column 1: IDENTIFICATION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="text-neutral-500 font-bold block text-[10px] uppercase tracking-widest border-b border-neutral-800 pb-2">
              IDENTIFICATION
            </span>
            <div className="space-y-1">
              <span className="text-white font-bold text-sm block">VENDOROS</span>
              <p className="text-neutral-400">INTELLIGENT FIELD OPERATIONS PLATFORM</p>
              <p className="text-neutral-500">ENTERPRISE DISPATCH ECOSYSTEM</p>
            </div>
          </motion.div>

          {/* Column 2: CHANNELS */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <span className="text-neutral-500 font-bold block text-[10px] uppercase tracking-widest border-b border-neutral-800 pb-2">
              CHANNELS
            </span>
            <div className="space-y-2 text-neutral-300">
              <a href="mailto:sales@vendoros.com" className="flex items-center space-x-1 hover:text-white transition-colors">
                <span>EMAIL</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
              <a href="#top" className="flex items-center space-x-1 hover:text-white transition-colors">
                <span>LINKEDIN</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
              <a href="#top" className="flex items-center space-x-1 hover:text-white transition-colors">
                <span>GITHUB</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            </div>
          </motion.div>

          {/* Column 3: COLOPHON */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-neutral-500 font-bold block text-[10px] uppercase tracking-widest border-b border-neutral-800 pb-2">
              COLOPHON
            </span>
            <div className="space-y-1 text-neutral-400">
              <p>COMMUNITY: 10,000+ ENTERPRISES / 100+ TEAMS</p>
              <p>DOMAINS: DISPATCH / RISK AI / INVENTORY</p>
              <p>FOCUS: AUTOMATION / SCALABILITY / AI</p>
              <p className="text-white font-bold pt-1">2026</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Giant Full-Width Display Typography: VENDOROS (Codezen Style) */}
      <div className="w-full text-center overflow-hidden my-auto pt-12 select-none">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.25 }}
          transition={{ duration: 0.8 }}
          className="text-[100px] sm:text-[180px] md:text-[240px] font-black tracking-tighter leading-none text-white uppercase text-center filter drop-shadow-2xl select-none"
        >
          VENDOROS
        </motion.h1>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto px-6 w-full flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-900 pt-4">
        <span>© 2026 VENDOROS INC. ALL RIGHTS RESERVED.</span>
        <span>INTELLIGENT FIELD OPERATIONS PLATFORM</span>
      </div>
    </footer>
  );
};
