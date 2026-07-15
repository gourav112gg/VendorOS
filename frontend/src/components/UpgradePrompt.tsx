import React from 'react';
import { ShieldAlert, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getFeatureRequiredTier, TIER_PRICING } from '../services/subscriptionService';

interface UpgradePromptProps {
  featureKey: string;
  featureName: string;
  featureDescription: string;
  onNavigateToBilling: () => void;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  featureKey,
  featureName,
  featureDescription,
  onNavigateToBilling,
}) => {
  const requiredTier = getFeatureRequiredTier(featureKey);
  const tierInfo = TIER_PRICING[requiredTier];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#111111] border border-amber-950/40 rounded-sm p-8 relative overflow-hidden max-w-2xl mx-auto my-8"
      id={`upgrade-prompt-${featureKey}`}
    >
      <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-[0.02]">
        <ShieldAlert className="w-92 h-92 text-amber-500" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-start gap-6">
        <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-sm text-amber-500 self-start">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="flex-grow space-y-4">
          <div>
            <span className="bg-amber-950/30 text-amber-400 px-2.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest border border-amber-900/40">
              Feature Locked • Upgrade Required
            </span>
            <h3 className="text-xl font-serif italic text-white mt-3 font-light">
              Unlock {featureName}
            </h3>
            <p className="text-xs text-[#888888] mt-1 leading-relaxed">
              {featureDescription}
            </p>
          </div>

          <div className="bg-[#0A0A0A] border border-[#222222] p-4 rounded-sm space-y-2.5">
            <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
              Required Subscription
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                {tierInfo.name}
              </span>
              <span className="text-xs font-mono text-[#888888]">
                ₹{tierInfo.price}/{tierInfo.period}
              </span>
            </div>
            
            <ul className="text-[11px] text-[#666666] space-y-1.5 pt-2 border-t border-[#1D1D1D]">
              {tierInfo.features.slice(1, 4).map((feat, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#444444] shrink-0" />
                  <span className="truncate">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onNavigateToBilling}
              className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              <span>Upgrade to {requiredTier}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-[#555555] uppercase tracking-widest">
              Cancel at any time • Pro-rated Instant Upgrades
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default UpgradePrompt;
