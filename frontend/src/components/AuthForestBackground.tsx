import React from "react";

export const AuthForestBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#7E858C]">
      {/* Grayscale Foggy Pine Forest Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125 opacity-40 mix-blend-multiply scale-105 transition-transform duration-1000"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=80')`,
        }}
      />

      {/* Atmospheric Mist Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#52575C] via-transparent to-[#B3B9C1] opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/30" />

      {/* Subtle Vignette Overlay */}
      <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.4)]" />
    </div>
  );
};
