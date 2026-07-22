import React from "react";
import { ArrowUp, Play, Youtube } from "lucide-react";

export const FooterSection: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative min-h-screen flex flex-col justify-center py-16 bg-[#E8E8E8] text-white">
      <div className="max-w-5xl mx-auto px-4">
        {/* Dark Rounded Container */}
        <div className="relative bg-[#09090B] border border-[#27272A] rounded-3xl p-8 sm:p-12 shadow-2xl overflow-hidden font-mono">
          {/* Giant Stylized Watermark Logo in Corner */}
          <div className="absolute -right-8 -top-8 text-[180px] font-bold text-white/5 pointer-events-none select-none leading-none">
            ✕
          </div>

          {/* Top Internal Navigation Header */}
          <div className="border-b border-[#222222] pb-6 mb-10">
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-neutral-200">
              <a href="#top" className="hover:text-white transition-colors">
                Home
              </a>
              <span>•</span>
              <a href="#features" className="hover:text-white transition-colors">
                Features
              </a>
              <span>•</span>
              <a href="#automation" className="hover:text-white transition-colors">
                Clients
              </a>
              <span>•</span>
              <a href="#bento" className="hover:text-white transition-colors">
                How it Works
              </a>
              <span>•</span>
              <a href="#pricing" className="hover:text-white transition-colors">
                Testimonials
              </a>
            </div>
          </div>

          {/* 3-Column Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-xs text-neutral-400">
            {/* Column 1: Contact & Address */}
            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">VendorOS Inc.</span>
              <p>1234 Operational Parkway, Suite 400</p>
              <p>San Francisco, CA 94107</p>
              <p className="text-neutral-300">sales@vendoros.com</p>
            </div>

            {/* Column 2: Navigation */}
            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">Platform</span>
              <a href="#features" className="block hover:text-white transition-colors">
                Customer Stories
              </a>
              <a href="#automation" className="block hover:text-white transition-colors">
                Integrations
              </a>
              <a href="#bento" className="block hover:text-white transition-colors">
                Frameworks & API
              </a>
            </div>

            {/* Column 3: Legal & Support */}
            <div className="space-y-2">
              <span className="text-white font-bold block mb-1">Resources</span>
              <a href="#pricing" className="block hover:text-white transition-colors">
                FAQ & Knowledge Base
              </a>
              <a href="#pricing" className="block hover:text-white transition-colors">
                Help Center
              </a>
              <a href="#pricing" className="block hover:text-white transition-colors">
                Security & Compliance
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-[#222222] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            {/* Logo & Social Icons */}
            <div className="flex items-center space-x-4">
              <div className="w-6 h-6 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
                ✕
              </div>
              <span>VendorOS Social Media</span>
            </div>

            {/* Back to top */}
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>

            {/* Copyright */}
            <div>
              © 2026 VendorOS Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
