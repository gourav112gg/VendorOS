import React from "react";
import { motion } from "motion/react";

export const LogoCloudSection: React.FC = () => {
  const logosRow1 = ["Wellnex", "mavence", "SMITH", "Botanic", "VEDOO"];
  const logosRow2 = ["dropstack", "Wolfram", "mavence", "SYNTH", "Rader"];
  const logosRow3 = ["Wellnex", "mavence", "SMITH", "Rader", "Veega"];

  return (
    <section className="relative py-24 bg-[#E8E8E8] text-black overflow-hidden border-t border-neutral-300">
      <div className="max-w-5xl mx-auto px-4 text-center">
        {/* Title */}
        <h2 className="text-2xl sm:text-4xl font-mono font-bold tracking-tight mb-16 text-neutral-900">
          Integrate with popular apps.
        </h2>

        {/* Logo Cloud Layout with Floating Center Badge */}
        <div className="relative max-w-4xl mx-auto space-y-8 font-mono text-sm sm:text-base font-bold text-neutral-400">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
            {logosRow1.map((logo, idx) => (
              <span key={idx} className="hover:text-black transition-colors cursor-pointer select-none">
                {logo}
              </span>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
            {logosRow2.map((logo, idx) => (
              <span key={idx} className="hover:text-black transition-colors cursor-pointer select-none">
                {logo}
              </span>
            ))}
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-70">
            {logosRow3.map((logo, idx) => (
              <span key={idx} className="hover:text-black transition-colors cursor-pointer select-none">
                {logo}
              </span>
            ))}
          </div>

          {/* Centered Floating Watermark Badge */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center text-xl font-bold font-mono shadow-2xl border border-neutral-700"
            >
              ✕
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
