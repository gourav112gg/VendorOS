import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Play,
  ArrowRight,
  Shield,
  User,
  Grid,
  Truck,
  Triangle,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 75, y: 30 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Scramble Text State for Headline
  const targetHeadline = "Unlock the Future of Operations.";
  const [scrambledText, setScrambledText] = useState(targetHeadline);
  const [hasScrambled, setHasScrambled] = useState(false);

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
        onUpdate: (self) => {
          setProgress(self.progress);
          if (self.progress > 0.05 && !hasScrambled) {
            triggerScramble();
            setHasScrambled(true);
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasScrambled]);

  // Scramble Text Animation Function
  const triggerScramble = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setScrambledText(
        targetHeadline
          .split("")
          .map((char, index) => {
            if (char === " " || char === ".") return char;
            if (index < iteration) {
              return targetHeadline[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= targetHeadline.length) {
        clearInterval(interval);
        setScrambledText(targetHeadline);
      }
      iteration += 1 / 2;
    }, 30);
  };

  // Initial Scramble on Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerScramble();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Mouse Position tracking for living interactive milky-white diffuse glow
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
      className="relative min-h-[100dvh] md:h-screen flex flex-col justify-center items-center bg-[#050505] text-white pt-20 pb-4 overflow-hidden font-sans"
    >
      {/* Inset Framed Hero Card Container */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative w-[94vw] max-w-7xl h-[86vh] min-h-[620px] bg-[#050507] border border-white/10 rounded-[28px] sm:rounded-[36px] md:rounded-[44px] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex flex-col justify-center p-6 sm:p-10 text-center select-none"
      >
        {/* Static Atmospheric Milky-White Light Patch (Reference Match) */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(750px circle at 78% 26%, rgba(255, 255, 255, 0.17) 0%, rgba(210, 215, 235, 0.07) 45%, transparent 75%)",
          }}
        />

        {/* Dynamic Cursor Diffuse Milky-White Light Layer (Mix-Blend Screen Diffuse) */}
        {!isReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
            style={{
              background: `radial-gradient(550px circle at ${mousePos.x}% ${mousePos.y}%, rgba(240, 245, 255, 0.22), transparent 70%)`,
              mixBlendMode: "screen",
              filter: "blur(35px)",
            }}
          />
        )}

        {/* SVG Powering Up & Powering Down Energy Connector Lines Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block">
          {/* Base Path: Top-Left (Owner) */}
          <path
            d="M 0 110 L 180 110 Q 280 110 440 230"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
          />
          {/* Animated Energy Pulse: Top-Left */}
          <motion.path
            d="M 0 110 L 180 110 Q 280 110 440 230"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="2"
            strokeDasharray="14 28"
            animate={isReducedMotion ? {} : { strokeDashoffset: [0, -120] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Base Path: Top-Right (Customer) */}
          <path
            d="M 1280 110 L 1100 110 Q 1000 110 840 230"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
          />
          {/* Animated Energy Pulse: Top-Right */}
          <motion.path
            d="M 1280 110 L 1100 110 Q 1000 110 840 230"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="2"
            strokeDasharray="14 28"
            animate={isReducedMotion ? {} : { strokeDashoffset: [0, 120] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />

          {/* Base Path: Bottom-Left (Manager) */}
          <path
            d="M 0 510 L 180 510 Q 280 510 440 390"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
          />
          {/* Animated Energy Pulse: Bottom-Left */}
          <motion.path
            d="M 0 510 L 180 510 Q 280 510 440 390"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="2"
            strokeDasharray="14 28"
            animate={isReducedMotion ? {} : { strokeDashoffset: [0, -120] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
          />

          {/* Base Path: Bottom-Right (Driver) */}
          <path
            d="M 1280 510 L 1100 510 Q 1000 510 840 390"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1.5"
          />
          {/* Animated Energy Pulse: Bottom-Right */}
          <motion.path
            d="M 1280 510 L 1100 510 Q 1000 510 840 390"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="2"
            strokeDasharray="14 28"
            animate={isReducedMotion ? {} : { strokeDashoffset: [0, 120] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* SHIFTED NODE 1: Owner (Shifted onto Upper-Left SVG Curve Circle) */}
        <motion.div
          style={{
            opacity: Math.min(1, progress * 2.5),
            transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * -20}px)`,
          }}
          className="absolute top-[18%] left-[20%] hidden md:flex items-center space-x-3 z-20"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-md">
            <Triangle className="w-3 h-3 text-white fill-white" />
          </div>
          <div className="text-left font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] animate-ping" />
              <span className="text-xs font-bold text-white tracking-wide">Owner</span>
            </div>
            <span className="text-[10px] text-white/50 block">Active</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Shield className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* SHIFTED NODE 2: Customer (Shifted onto Upper-Right SVG Curve Circle - Share Icon Removed) */}
        <motion.div
          style={{
            opacity: Math.min(1, progress * 2.5),
            transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * -20}px)`,
          }}
          className="absolute top-[18%] right-[20%] hidden md:flex items-center space-x-3 z-20"
        >
          <div className="text-right font-mono">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Customer</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
            </div>
            <span className="text-[10px] text-white/50 block">Assigned</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <User className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* SHIFTED NODE 3: Manager (Shifted onto Lower-Left SVG Curve Circle) */}
        <motion.div
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.2) * 2.5)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.2) * 2.5))) * 20}px)`,
          }}
          className="absolute bottom-[22%] left-[20%] hidden md:flex items-center space-x-3 z-20"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <div className="text-left font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
              <span className="text-xs font-bold text-white tracking-wide">Manager</span>
            </div>
            <span className="text-[10px] text-white/50 block">On Route</span>
          </div>
        </motion.div>

        {/* SHIFTED NODE 4: Driver (Shifted onto Lower-Right SVG Curve Circle) */}
        <motion.div
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.2) * 2.5)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.2) * 2.5))) * 20}px)`,
          }}
          className="absolute bottom-[22%] right-[20%] hidden md:flex items-center space-x-3 z-20"
        >
          <div className="text-right font-mono">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="text-xs font-bold text-white tracking-wide">Driver</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8]" />
            </div>
            <span className="text-[10px] text-white/50 block">Online</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
            <Truck className="w-4 h-4 text-white" />
          </div>
        </motion.div>

        {/* CENTER STACKED COMPOSITION */}
        <div className="relative max-w-3xl mx-auto z-20 pt-4">
          {/* Small Circular Play Button Icon */}
          <motion.div
            style={{
              opacity: Math.min(1, progress * 3),
              transform: `scale(${0.85 + Math.min(1, progress * 3) * 0.15})`,
            }}
            onClick={onGetStarted}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-2xl mx-auto mb-4 hover:scale-110 transition-transform cursor-pointer"
          >
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </motion.div>

          {/* Badge Pill with Icon Badge on Left */}
          <motion.div
            style={{
              opacity: Math.min(1, progress * 2.5),
              transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * 20}px)`,
            }}
            onClick={onGetStarted}
            className="inline-flex items-center space-x-2.5 px-4 py-1.5 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full text-xs font-mono text-neutral-200 mb-6 shadow-lg cursor-pointer hover:border-white/40 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
              ⚡
            </div>
            <span>See VendorOS in action →</span>
          </motion.div>

          {/* Large Centered Stark White Headline with Scramble Text Animation */}
          <motion.h1
            style={{
              opacity: Math.min(1, progress * 2),
              transform: `translateY(${(1 - Math.min(1, progress * 2)) * 30}px)`,
            }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.06] mb-6 max-w-4xl mx-auto drop-shadow-md font-mono"
          >
            {scrambledText}
          </motion.h1>

          {/* Centered Subcopy */}
          <motion.p
            style={{
              opacity: Math.min(1, Math.max(0, (progress - 0.15) * 2.2)),
              transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.15) * 2.2))) * 25}px)`,
            }}
            className="text-xs sm:text-sm font-sans text-white/70 max-w-xl mx-auto mb-8 leading-relaxed tracking-normal"
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
              className="bg-white text-black hover:bg-neutral-200 px-7 py-3 rounded-full font-mono text-xs font-bold transition-all shadow-2xl hover:scale-105 cursor-pointer"
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
            className="flex items-center justify-center gap-2 pt-2"
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

        {/* BOTTOM FOOTER BAR HAS BEEN ENTIRELY REMOVED AS REQUESTED */}
      </div>
    </section>
  );
};
