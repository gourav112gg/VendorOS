import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, Star, Zap } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(1); // Default 1 for unpinned or static

  useEffect(() => {
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
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

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] md:h-screen flex flex-col justify-center pt-28 pb-16 bg-[#09090B] text-white overflow-hidden"
    >
      {/* Background Globe Mesh Wireframe Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <div className="w-[800px] h-[800px] rounded-full border border-neutral-700/50 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full border border-neutral-700/40 flex items-center justify-center">
            <div className="w-[400px] h-[400px] rounded-full border border-neutral-700/30" />
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 text-center">
        {/* Release Announcement Badge */}
        <motion.div
          style={{
            opacity: Math.min(1, progress * 2.5),
            transform: `translateY(${(1 - Math.min(1, progress * 2.5)) * 20}px)`,
          }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#121215] border border-[#27272A] rounded-full text-xs font-mono text-neutral-300 mb-8 cursor-pointer hover:border-neutral-500 transition-colors shadow-lg"
          onClick={onGetStarted}
        >
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> VendorOS 2.0
          </span>
          <span className="text-neutral-500">•</span>
          <span>release announced</span>
          <span className="text-neutral-400 flex items-center gap-1 font-semibold">
            Learn more <ArrowRight className="w-3 h-3" />
          </span>
        </motion.div>

        {/* Display Heading */}
        <motion.h1
          style={{
            opacity: Math.min(1, progress * 2),
            transform: `translateY(${(1 - Math.min(1, progress * 2)) * 30}px)`,
          }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl mx-auto"
        >
          Unlock the Future <br />
          <span className="text-neutral-300">of Operations.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.15) * 2.2)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.15) * 2.2))) * 25}px)`,
          }}
          className="text-xs sm:text-sm font-sans text-neutral-400 max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          Streamline your company's field service orders, inventory tracking, dispatching, and AI-driven risk evaluation from your phone or desktop.
        </motion.p>

        {/* Work Email Input Form */}
        <motion.form
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.3) * 2.5)),
            transform: `translateY(${(1 - Math.min(1, Math.max(0, (progress - 0.3) * 2.5))) * 20}px)`,
          }}
          onSubmit={handleSubmitEmail}
          className="max-w-md mx-auto mb-8 flex items-center bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] focus-within:border-white/50 rounded-full p-1.5 transition-all shadow-xl"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email..."
            className="w-full bg-transparent px-4 py-2 text-xs font-sans text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center space-x-1.5 bg-white text-black hover:bg-neutral-200 px-4 py-2 rounded-full font-mono text-xs font-bold transition-colors shadow-md whitespace-nowrap cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.form>

        {/* Social Proof Badges */}
        <motion.div
          style={{
            opacity: Math.min(1, Math.max(0, (progress - 0.45) * 2)),
          }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400 font-mono"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Real-Time Fleet Dispatch</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI Risk Copilot</span>
          </div>
          <div className="flex items-center space-x-[2px] text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
            ))}
            <span className="text-neutral-300 text-[11px] font-bold ml-1">4.9/5 Rating</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
