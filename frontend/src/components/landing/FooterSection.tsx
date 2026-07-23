import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative min-h-screen md:h-screen flex flex-col justify-between pt-10 md:pt-12 pb-6 bg-[#000000] text-white overflow-hidden border-t border-neutral-900 font-mono">
      {/* Top Header Columns Container matching Codezen layout */}
      <div className="max-w-7xl mx-auto px-6 w-full pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-xs tracking-wider">
          {/* Column 1: IDENTIFICATION */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
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
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
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
              <a
                href="https://www.linkedin.com/in/gourav-garg-418926304/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <span>LINKEDIN</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
              <a
                href="https://github.com/gourav112gg/VendorOS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <span>GITHUB</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500" />
              </a>
            </div>
          </motion.div>

          {/* Column 3: CORE PLATFORM (Replacing COLOPHON with Project Content) */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <span className="text-neutral-500 font-bold block text-[10px] uppercase tracking-widest border-b border-neutral-800 pb-2">
              CORE PLATFORM
            </span>
            <div className="space-y-1 text-neutral-400">
              <p>REAL-TIME DISPATCH ENGINE</p>
              <p>AI RISK COPILOT & DIAGNOSTICS</p>
              <p>INVENTORY & FLEET TRACKING</p>
              <p>MULTI-TENANT VENDOR PORTAL</p>
              <p className="text-white font-bold pt-1">2026</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edge-to-Edge Display Typography: VENDOROS (Codezen Style) */}
      <div className="w-full text-center overflow-hidden my-auto py-4 select-none px-0">
        <motion.h1
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[clamp(60px,18.5vw,340px)] font-black tracking-tighter leading-none text-white uppercase text-center filter drop-shadow-2xl select-none block w-full px-0 mx-0 whitespace-nowrap"
        >
          VENDOROS
        </motion.h1>
      </div>

      {/* Bottom Legal Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-7xl mx-auto px-6 w-full flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-500 border-t border-neutral-900 pt-4"
      >
        <span>© 2026 VENDOROS INC. ALL RIGHTS RESERVED.</span>
        <span>INTELLIGENT FIELD OPERATIONS PLATFORM</span>
      </motion.div>
    </footer>
  );
};
