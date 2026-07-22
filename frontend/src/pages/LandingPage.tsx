import React, { useEffect } from "react";
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
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div id="top" className="min-h-screen bg-[#09090B] text-white font-sans selection:bg-neutral-800 selection:text-white">
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
