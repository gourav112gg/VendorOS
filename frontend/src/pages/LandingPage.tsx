import React from "react";
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { OperationsOverview } from "../components/landing/OperationsOverview";
import { CopilotGrid } from "../components/landing/CopilotGrid";
import { BuiltOnStrip } from "../components/landing/BuiltOnStrip";
import { Footer } from "../components/landing/Footer";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToPublic: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToSignUp,
  onNavigateToPublic,
}) => {
  return (
    <div className="min-h-screen bg-[#0A0F1F] text-white font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation Floating Pill Bar */}
      <Navbar
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignUp={onNavigateToSignUp}
        onNavigateToPublic={onNavigateToPublic}
      />

      {/* Hero Section */}
      <Hero onGetStarted={onNavigateToSignUp} />

      {/* Operations Overview Section */}
      <OperationsOverview />

      {/* AI Operations Copilot 3-Card Grid */}
      <CopilotGrid />

      {/* Technology Attribution Strip */}
      <BuiltOnStrip />

      {/* Footer */}
      <Footer />
    </div>
  );
};
