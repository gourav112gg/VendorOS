import React from "react";
import { motion } from "motion/react";
import { Linkedin, Twitter, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0F1F] pt-16 pb-8 px-6 lg:px-8 border-t border-white/10 text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4 max-w-sm">
            <a href="#top" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#0A0F1F] font-serif-italic text-lg font-bold">
                V
              </div>
              <span className="font-display font-semibold text-base text-white tracking-wide">
                VendorOS
              </span>
            </a>
            <p className="text-xs text-white/60 leading-relaxed font-sans">
              Operations software for manufacturing and production teams — real-time order tracking, workforce coordination, and SLA risk prediction in one unified engine.
            </p>
          </div>

          {/* Nav & Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 font-mono text-xs">
            <div className="space-y-3">
              <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold block">
                Platform
              </span>
              <a href="#operations" className="block text-white/70 hover:text-white transition-colors">
                Operations
              </a>
              <a href="#copilot" className="block text-white/70 hover:text-white transition-colors">
                AI Copilot
              </a>
              <a href="#built-on" className="block text-white/70 hover:text-white transition-colors">
                Built On Stack
              </a>
            </div>

            <div className="space-y-3">
              <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold block">
                System Status
              </span>
              <div className="flex items-center space-x-2 text-emerald-400 font-data text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Systems Operational</span>
              </div>
              <span className="block text-[10px] text-white/50">Stacking ML Engine v1.0</span>
            </div>

            <div className="space-y-3">
              <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold block">
                Legal & Governance
              </span>
              <a href="#" className="block text-white/70 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="block text-white/70 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-white/40">
          <p>© 2026 VendorOS Systems Inc. All rights reserved.</p>
          <div className="flex items-center space-x-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Multi-Tenant Architecture
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
