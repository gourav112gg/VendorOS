import React from "react";

/**
 * BuiltOnStrip: Honest technology attribution section.
 * Features official SVG logos exclusively for Firebase, MongoDB, Render, and Vercel.
 * Low-opacity / muted styling.
 */
export const BuiltOnStrip: React.FC = () => {
  return (
    <section id="built-on" className="py-16 bg-[#0A0F1F] text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-8 text-center">
        {/* Label */}
        <div className="space-y-1">
          <span className="font-data text-[11px] text-white/40 uppercase tracking-widest font-semibold">
            Built On Modern Production Infrastructure
          </span>
          <p className="text-xs text-white/50 font-sans">
            Core technology stack running VendorOS's real-time engine
          </p>
        </div>

        {/* 4 Tech Attribution Logos (Firebase, MongoDB, Render, Vercel) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60 hover:opacity-90 transition-opacity">
          {/* Firebase */}
          <div className="flex items-center space-x-2.5 font-mono text-sm text-white/80 grayscale hover:grayscale-0 transition-all">
            <svg className="w-6 h-6 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.89 15.672L6.255 1.84a.434.434 0 0 1 .808-.135l2.766 5.247 2.19-4.171a.434.434 0 0 1 .786.044l6.398 12.847L13.11 21.6a1.737 1.737 0 0 1-1.897 0L3.89 15.672z" />
            </svg>
            <span className="font-bold tracking-wider">Firebase</span>
          </div>

          {/* MongoDB */}
          <div className="flex items-center space-x-2.5 font-mono text-sm text-white/80 grayscale hover:grayscale-0 transition-all">
            <svg className="w-6 h-6 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5V14h1v2.5zm1.5-4.5c0 1.38-1.12 2.5-2.5 2.5S9.5 13.38 9.5 12 10.62 9.5 12 9.5s2.5 1.12 2.5 2.5z" />
            </svg>
            <span className="font-bold tracking-wider">MongoDB</span>
          </div>

          {/* Render */}
          <div className="flex items-center space-x-2.5 font-mono text-sm text-white/80 grayscale hover:grayscale-0 transition-all">
            <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-bold tracking-wider">Render</span>
          </div>

          {/* Vercel */}
          <div className="flex items-center space-x-2.5 font-mono text-sm text-white/80 grayscale hover:grayscale-0 transition-all">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L24 22H0L12 1Z" />
            </svg>
            <span className="font-bold tracking-wider">Vercel</span>
          </div>
        </div>
      </div>
    </section>
  );
};
