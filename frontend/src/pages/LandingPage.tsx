import React from "react";
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { Walkthrough } from "../components/landing/Walkthrough";
import { ProductDemo } from "../components/landing/ProductDemo";
import { HowItWorks } from "../components/landing/HowItWorks";
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
    <div className="min-h-screen bg-[#121924]">
      <Navbar
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToSignUp={onNavigateToSignUp}
        onNavigateToPublic={onNavigateToPublic}
      />
      <Hero onGetStarted={onNavigateToSignUp} />
      <Features />
      <Walkthrough />
      <ProductDemo />
      <HowItWorks />
      <Footer />
    </div>
  );
};
