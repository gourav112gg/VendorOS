"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import { ArrowLeft, Home, Sparkles, ShieldAlert, Compass } from "lucide-react";
import { motion } from "motion/react";

interface NotFoundPageProps {
  onNavigateHome?: () => void;
}

export function NotFoundPage({ onNavigateHome }: NotFoundPageProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    // Clean URL push and trigger state update
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0A0A0A] text-[#E5E5E5] transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto max-w-4xl"
      >
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center space-y-6">
            
            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{t("http404", "HTTP 404 • Resource Not Found")}</span>
            </div>

            {/* Dribbble Illustration Container with Dark/Light Blend */}
            <div
              className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[240px] sm:h-[320px] md:h-[380px] bg-center bg-no-repeat bg-contain rounded-lg relative overflow-hidden flex items-start justify-center"
              aria-hidden="true"
            >
              <h1 className="text-center font-serif text-6xl sm:text-7xl md:text-8xl pt-4 font-bold tracking-tighter opacity-90 select-none drop-shadow-md text-[#111111] dark:text-white">
                404
              </h1>
            </div>

            <div className="mt-[-30px] space-y-3">
              <h2 className="text-2xl sm:text-3xl font-serif italic text-white font-light tracking-tight">
                {t("lostTitle", "Looks like you're lost")}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-[#888888] max-w-md mx-auto leading-relaxed">
                {t(
                  "lostDesc",
                  "The operational dispatch, entity view, or route you are looking for is unavailable or has been archived."
                )}
              </p>

              {/* Action Buttons Trio */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  variant="default"
                  onClick={handleGoHome}
                  className="min-h-[42px] px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <Home className="w-4 h-4" />
                  {user ? t("returnDashboard", "Return to Dashboard") : t("goToHome", "Go to Home")}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleGoBack}
                  className="min-h-[42px] px-5 border-[#333333] bg-[#111111] hover:bg-[#1A1A1A] !text-white font-mono text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                  {t("goBack", "Go Back")}
                </Button>
              </div>

              {/* Helpful hint footer */}
              <div className="pt-6 border-t border-[#1C1C1C] flex items-center justify-center gap-2 text-xs font-mono text-[#666666]">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tip: Press <kbd className="px-1.5 py-0.5 bg-[#141414] border border-[#262626] rounded text-[#A1A1AA]">D</kbd> for Dashboard or <kbd className="px-1.5 py-0.5 bg-[#141414] border border-[#262626] rounded text-[#A1A1AA]">?</kbd> for shortcuts</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default NotFoundPage;
