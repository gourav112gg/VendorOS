import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AppIntegrationSection } from "../components/landing/AppIntegrationSection";
import { AutomationHubSection } from "../components/landing/AutomationHubSection";
import { BentoGridSection } from "../components/landing/BentoGridSection";
import { PricingSection } from "../components/landing/PricingSection";
import { LogoCloudSection } from "../components/landing/LogoCloudSection";
import { FooterSection } from "../components/landing/FooterSection";

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToPublic?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToPublic,
}) => {
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis + GSAP ScrollTrigger Global Synchronization on window & documentElement
  useEffect(() => {
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReducedMotion) return; // Disable smooth scroll & pinning loop when reduced motion is preferred

    const lenis = new Lenis({
      wrapper: window,
      content: document.documentElement,
      lerp: 0.1,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll updates with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <div
      id="top"
      className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-neutral-800 selection:text-white"
    >
      {/* 1. Floating Top Navbar */}
      <Navbar
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignUp={onNavigateToSignUp}
        onNavigateToPublic={onNavigateToPublic}
      />

      {/* 2. Hero Section (Dark Canvas) — Budget: +=100% */}
      <HeroSection onGetStarted={onNavigateToSignUp} />

      {/* 3. App Integration Dual Showcase Section — Budget: +=150% */}
      <AppIntegrationSection />

      {/* 4. Interactive Automation Node Network Section — Budget: +=150% */}
      <AutomationHubSection />

      {/* 5. Feature Bento Grid Section — Budget: +=100% */}
      <BentoGridSection />

      {/* 6. Glassmorphism Pricing Section — Budget: +=120% */}
      <PricingSection onSelectPlan={() => onNavigateToSignUp()} />

      {/* 7. Integration Logo Cloud Section */}
      <LogoCloudSection />

      {/* 8. Footer Section (NO PIN — Sticky Edge-to-Edge VENDOROS Scale) */}
      <FooterSection />
    </div>
  );
};
