import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { Navbar } from "../components/landing/Navbar";
import { HeroSection } from "../components/landing/HeroSection";
import { AppIntegrationSection } from "../components/landing/AppIntegrationSection";
import { AutomationHubSection } from "../components/landing/AutomationHubSection";
import { BentoGridSection } from "../components/landing/BentoGridSection";
import { PricingSection } from "../components/landing/PricingSection";
import { LogoCloudSection } from "../components/landing/LogoCloudSection";
import { FooterSection } from "../components/landing/FooterSection";

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

  // Lenis smooth scroll initialization with reduced motion check
  useEffect(() => {
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isReducedMotion) return; // Skip Lenis smooth scroll if user prefers reduced motion

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Intersection Observer for 50% entrance queueing & 66.67% (2/3) velocity-gated animation triggering
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section, footer")
    );
    const debounceTimers = new Map<HTMLElement, NodeJS.Timeout>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const ratio = entry.intersectionRatio;
          const target = entry.target as HTMLElement;

          // 50% Scroll Threshold: Queue Section Entrance
          if (ratio >= 0.5) {
            target.classList.add("section-entrance-queued");
          }

          // 66.67% (2/3) Scroll Threshold: Velocity-Gated Full Timeline Activation
          if (ratio >= 0.667) {
            const currentVelocity = Math.abs(
              lenisRef.current?.velocity || 0
            );

            // If user is scrolling rapidly (velocity > 2), debounce 150ms to prevent rushed/skipped timelines
            if (currentVelocity > 2) {
              if (debounceTimers.has(target)) {
                clearTimeout(debounceTimers.get(target)!);
              }
              const timer = setTimeout(() => {
                target.classList.add("section-animation-active");
              }, 150);
              debounceTimers.set(target, timer);
            } else {
              target.classList.add("section-animation-active");
            }
          }
        });
      },
      {
        threshold: [0.5, 0.667],
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      observer.disconnect();
      debounceTimers.forEach((timer) => clearTimeout(timer));
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

      {/* 2. Hero Section (Dark Canvas) */}
      <HeroSection onGetStarted={onNavigateToSignUp} />

      {/* 3. App Integration Dual Showcase Section (Light Slate Canvas) */}
      <AppIntegrationSection />

      {/* 4. Interactive Automation Node Network Section (Light Slate Canvas) */}
      <AutomationHubSection />

      {/* 5. Feature Bento Grid Section (Light Slate Canvas) */}
      <BentoGridSection />

      {/* 6. Glassmorphism Pricing Section (Substituting News & Articles) */}
      <PricingSection onSelectPlan={() => onNavigateToSignUp()} />

      {/* 7. Integration Logo Cloud Section (Light Slate Canvas) */}
      <LogoCloudSection />

      {/* 8. Footer Section (Dark Rounded Card Container) */}
      <FooterSection />
    </div>
  );
};
