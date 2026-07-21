import React from "react";
import { motion } from "motion/react";
import { Linkedin, Twitter } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#0B0F17] pt-16 pb-7 px-6 lg:px-8 border-t border-[#1E2836]"
    >
      <div className="max-w-[1240px] mx-auto">
        <div className="flex flex-wrap justify-between gap-10 pb-11 border-b border-[#1E2836]">
          <div className="max-w-[280px]">
            <a href="#top" className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 shrink-0 bg-white flex items-center justify-center rounded-sm text-black">
                <span className="font-serif italic font-semibold text-[13px] leading-none">
                  V
                </span>
              </div>
              <span className="font-sans font-medium text-[15px] text-white">
                VendorOS
              </span>
            </a>
            <p className="text-[13px] leading-relaxed text-[#7A8CA8]">
              Operations software for manufacturing and production teams — order
              tracking, workforce coordination, and delivery visibility in one
              workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-16">
            <div>
              <h5 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EDF1F8] mb-3.5">
                Company
              </h5>
              <a
                href="#"
                className="block text-[13px] text-[#7A8CA8] hover:text-white transition-colors mb-2.5"
              >
                About
              </a>
              <a
                href="#"
                className="block text-[13px] text-[#7A8CA8] hover:text-white transition-colors mb-2.5"
              >
                Contact
              </a>
            </div>
            <div>
              <h5 className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#EDF1F8] mb-3.5">
                Legal
              </h5>
              <a
                href="#"
                className="block text-[13px] text-[#7A8CA8] hover:text-white transition-colors mb-2.5"
              >
                Terms
              </a>
              <a
                href="#"
                className="block text-[13px] text-[#7A8CA8] hover:text-white transition-colors mb-2.5"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3.5 pt-6">
          <p className="text-[11px] font-mono text-[#4E5C70]">
            © 2026 VendorOS. All rights reserved.
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              aria-label="LinkedIn"
              className="w-[34px] h-[34px] rounded-[9px] bg-white/5 text-[#8A97AB] flex items-center justify-center hover:bg-[#D8A548] hover:text-black transition-colors"
            >
              <Linkedin className="w-[15px] h-[15px]" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="w-[34px] h-[34px] rounded-[9px] bg-white/5 text-[#8A97AB] flex items-center justify-center hover:bg-[#D8A548] hover:text-black transition-colors"
            >
              <Twitter className="w-[15px] h-[15px]" />
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
