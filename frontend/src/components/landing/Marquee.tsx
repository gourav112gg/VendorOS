import React from "react";
import { Sparkles, Shield, CheckCircle, Zap } from "lucide-react";

/**
 * Marquee: Infinite 14,000ms linear horizontal text loop of VendorOS product capabilities.
 * Replaces generic logo streams with honest product features.
 */
export const Marquee: React.FC = () => {
  const capabilities = [
    "Order Tracking",
    "AI Risk Scoring",
    "Delivery Tracking",
    "WhatsApp Alerts",
    "Trust Score",
    "UPI Payments",
  ];

  return (
    <div className="w-full overflow-hidden bg-[#141B2E]/60 border-y border-white/10 py-3 relative z-20">
      <div className="animate-marquee flex items-center space-x-8">
        {/* Repeat list twice to create seamless loop */}
        {[...capabilities, ...capabilities, ...capabilities].map((cap, idx) => (
          <div key={idx} className="flex items-center space-x-3 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            <span className="font-data text-xs text-white/80 uppercase tracking-widest font-semibold">
              {cap}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
