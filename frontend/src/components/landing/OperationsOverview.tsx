import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { CheckCircle2, AlertTriangle, PackageCheck, TrendingUp } from "lucide-react";

/**
 * OperationsOverview: Section 2
 * Left Column: Progress bars with strict semantic colors (Emerald = On Track, Amber = At Risk, White = Delivered).
 * Right Column: Scroll-triggered count-up statistics using requestAnimationFrame and IntersectionObserver.
 */
export const OperationsOverview: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Count-up state numbers
  const [ordersTracked, setOrdersTracked] = useState(0);
  const [fulfillmentRate, setFulfillmentRate] = useState(0);
  const [hoursSaved, setHoursSaved] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCountUp();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateCountUp = () => {
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    const targetOrders = 14850;
    const targetRate = 99.4;
    const targetHours = 120;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setOrdersTracked(Math.floor(targetOrders * easeProgress));
      setFulfillmentRate(Number((targetRate * easeProgress).toFixed(1)));
      setHoursSaved(Math.floor(targetHours * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <section id="operations" ref={sectionRef} className="py-20 bg-[#0A0F1F] text-white border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="space-y-3">
          <span className="font-data text-xs text-[#6366F1] bg-[#6366F1]/10 px-3 py-1 rounded-full border border-[#6366F1]/20">
            OPERATIONS OVERVIEW
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Real-time pipeline visibility across every factory floor.
          </h2>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: Progress Indicators */}
          <div className="bg-[#141B2E] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-display font-semibold text-lg text-white">
                This Week's Operations
              </h3>
              <span className="font-data text-[10px] text-white/60">Live Snapshot</span>
            </div>

            {/* Progress Item 1: On Track (Emerald) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#10B981] font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Orders On Track
                </span>
                <span className="text-white font-bold">128 Orders (78%)</span>
              </div>
              <div className="w-full h-3 bg-[#0A0F1F] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000 w-[78%]" />
              </div>
            </div>

            {/* Progress Item 2: At Risk (Amber) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Orders At Risk (SLA Slippage)
                </span>
                <span className="text-white font-[#F59E0B] font-bold">24 Orders (15%)</span>
              </div>
              <div className="w-full h-3 bg-[#0A0F1F] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-[#F59E0B] rounded-full transition-all duration-1000 w-[15%]" />
              </div>
            </div>

            {/* Progress Item 3: Delivered (Neutral White) */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-white font-bold flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-gray-300" />
                  Orders Delivered
                </span>
                <span className="text-white font-bold">12 Orders (7%)</span>
              </div>
              <div className="w-full h-3 bg-[#0A0F1F] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-white rounded-full transition-all duration-1000 w-[7%]" />
              </div>
            </div>
          </div>

          {/* Right Card: Scroll-Triggered Animated Stats */}
          <div className="bg-[#141B2E] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="font-display font-semibold text-lg text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#6366F1]" />
                System Performance Impact
              </h3>
              <span className="font-data text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-center my-auto">
              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-bold text-white block">
                  {ordersTracked.toLocaleString()}+
                </span>
                <span className="font-data text-[10px] text-white/60 uppercase">Orders Tracked</span>
              </div>

              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-bold text-[#10B981] block">
                  {fulfillmentRate}%
                </span>
                <span className="font-data text-[10px] text-white/60 uppercase">On-Time SLA</span>
              </div>

              <div className="space-y-1">
                <span className="font-display text-3xl sm:text-4xl font-bold text-indigo-400 block">
                  {hoursSaved}+
                </span>
                <span className="font-data text-[10px] text-white/60 uppercase">Hours Saved / Mo</span>
              </div>
            </div>

            <p className="text-xs text-white/60 font-sans text-center border-t border-white/10 pt-4">
              Illustrative platform metrics based on active dispatch pipelines.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
