import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Play,
  ArrowRight,
  Shield,
  User,
  Grid,
  Truck,
  ArrowDown,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // GSAP ScrollTrigger Pinning (100vh budget, 1:1 scrub)
  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setIsReducedMotion(reduced);

    if (reduced) {
      setProgress(1);
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=100%",
        pin: true,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Mouse Position tracking for living interactive diffuse glow
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isReducedMotion) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-[#09090B] text-white pt-24 pb-6 overflow-hidden"
    >
      {/* Inset Framed Hero Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative w-[92vw] max-w-7xl h-[84vh] min-h-[600px] bg-[#0A0F1F] border border-white/10 rounded-[28px] sm:rounded-[36px] md:rounded-[44px] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col justify-between p-6 sm:p-10 text-center select-none"
      >
        {/* Static Atmospheric Indigo/Violet Glow Patch */}
        <div className="absolute -top-20 -right-20 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#6366F1]/30 via-[#4F46E5]/15 to-transparent blur-3xl pointer-events-none z-0" />

        {/* Dynamic Cursor Diffuse Light Layer (Mix-Blend Screen Diffuse) */}
        {!isReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
            style={{
              background: `radial-gradient(650px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.28), transparent 70%)`,
              mixBlendMode: "screen",
              filter: "blur(40px)",
            }}
          />
        )}

        {/* Curved SVG Connector Lines Layer (Hidden on Mobile) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block">
          {/* Top-Left Connector (Owner -> Center) */}
          <path
            d="M 160 120 Q 320 140 460 220"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Top-Right Connector (Customer -> Center) */}
          <path
            d="M 980 140 Q 820 160 680 220"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Bottom-Left Connector (Manager -> Center) */}
          <path
            d="M 160 480 Q 320 460 460 380"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Bottom-Right Connector (Driver -> Center) */}
          <path
            d="M 980 480 Q 820 460 680 380"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* TOP-LEFT NODE: Owner */}
        <motion.div
          style={{
            opacity: Math.min(1, progress * 2.5),
            transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * -20}px)`,
          }}
          className="absolute top-8 left-8 hidden md:flex items-center space-x-3 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div className="text-left font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span className="text-xs font-bold text-white tracking-wide">Owner</span>
            </div>
            <span className="text-[10px] text-white/50 block">Active</span>
          </div>
        </motion.div>

        {/* TOP-RIGHT NODE: Customer */}
        <motion.div
          style={{
            opacity: Math.min(1, progress * 2.5),
            transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * -20}px)`,
          }}
          className="absolute top-8 right-8 hidden md:flex items-center space-x-3 z-20"
        >
          <div className="text-right font-mono">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Customer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            </div>
            <span className="text-[10px] text-white/50 block">Assigned</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* BOTTOM-LEFT NODE: Manager */}
        <motion.div
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.2) * 2.5)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.2) * 2.5))) * 20}px)`,
          }}
          className="absolute bottom-14 left-8 hidden md:flex items-center space-x-3 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <div className="text-left font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              <span className="text-xs font-bold text-white tracking-wide">Manager</span>
            </div>
            <span className="text-[10px] text-white/50 block">On Route</span>
          </div>
        </motion.div>

        {/* BOTTOM-RIGHT NODE: Driver */}
        <motion.div
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.2) * 2.5)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.2) * 2.5))) * 20}px)`,
          }}
          className="absolute bottom-14 right-8 hidden md:flex items-center space-x-3 z-20"
        >
          <div className="text-right font-mono">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Driver</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            </div>
            <span className="text-[10px] text-white/50 block">Online</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* CENTER STACKED COMPOSITION */}
        <div className="relative my-auto max-w-3xl mx-auto z-20 pt-4">
          {/* Small Circular Play Button Icon */}
          <motion.div
            style={{
              opacity: Math.min(1, progress * 3),
              transform: `scale(${0.8 + Math.min(1, progress * 3) * 0.2})`,
            }}
            onClick={onGetStarted}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-xl mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer"
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </motion.div>

          {/* Badge Pill */}
          <motion.div
            style={{
              opacity: Math.min(1, progress * 2.5),
              transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * 20}px)`,
            }}
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-mono text-neutral-200 mb-6 shadow-md cursor-pointer hover:border-white/40 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#6366F1] animate-pulse" />
            <span>See VendorOS in action →</span>
          </motion.div>

          {/* Large Centered Headline */}
          <motion.h1
            style={{
              opacity: Math.min(1, progress * 2),
              transform: `translateY(${(1 - Math.min(1, progress * 2)) * 30}px)`,
            }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-white leading-[1.08] mb-6 max-w-4xl mx-auto"
          >
            Unlock the Future <br className="hidden sm:inline" />
            of Operations.
          </motion.h1>

          {/* Centered Subcopy */}
          <motion.p
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.15) * 2.2)),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.15) * 2.2))) * 25}px)`,
            }}
            className="text-xs sm:text-sm font-sans text-white/60 max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Replace WhatsApp & Excel chaos with AI-driven work order dispatching, real-time fleet tracking, and automated field diagnostics.
          </motion.p>

          {/* Two CTA Buttons */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.3) * 2.5)),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.3) * 2.5))) * 20}px)`,
            }}
            className="flex flex-wrap items-center justify-center gap-4 mb-8"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="bg-white text-black hover:bg-neutral-200 px-7 py-3 rounded-full font-mono text-xs font-bold transition-all shadow-xl hover:scale-105 cursor-pointer"
            >
              Start Free
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3 rounded-full font-mono text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer flex items-center gap-1.5"
            >
              <span>Watch how it works</span>
              <ArrowRight className="w-3.5 h-3.5 -rotate-45" />
            </button>
          </motion.div>

          {/* Row of 3 Thin Vertical Glowing Lines */}
          <motion.div
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.4) * 2)),
            }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              animate={isReducedMotion ? {} : { height: ["24px", "44px", "24px"], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-[1.5px] h-8 bg-gradient-to-b from-white/90 to-transparent rounded-full"
            />
            <motion.div
              animate={isReducedMotion ? {} : { height: ["36px", "18px", "36px"], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-[1.5px] h-8 bg-gradient-to-b from-white/90 to-transparent rounded-full"
            />
            <motion.div
              animate={isReducedMotion ? {} : { height: ["20px", "40px", "20px"], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-[1.5px] h-8 bg-gradient-to-b from-white/90 to-transparent rounded-full"
            />
          </motion.div>
        </div>

        {/* BOTTOM CARD FOOTER CONTROLS */}
        <div className="relative z-20 flex items-center justify-between font-mono text-xs text-white/50 pt-4 border-t border-white/10">
          {/* Bottom Left: Circular Down-Arrow + Progress Pill */}
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-sm">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-medium tracking-wider text-neutral-300">
              02/03 · Scroll down
            </span>
          </div>

          {/* Bottom Right: Label + Horizontal Progress Bar */}
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-medium tracking-wider text-neutral-400 hidden sm:inline">
              Operations Ecosystem
            </span>
            <div className="w-16 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-white rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
