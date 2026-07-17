
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Share2,
  Star,
  TrendingUp,
  CheckCircle,
  HelpCircle,
  Activity,
  Globe,
} from "lucide-react";
import { motion } from "motion/react";
import { Company, TrustScoreRecord } from "../types";
import dbStore from "../services/store";
import { hasFeatureAccess } from "../services/subscriptionService";
import NoDataPlaceholder from "./NoDataPlaceholder";

interface TrustScoreTabProps {
  company: Company;
  onNavigateToBilling: () => void;
}

export const TrustScoreTab: React.FC<TrustScoreTabProps> = ({
  company,
  onNavigateToBilling,
}) => {
  const access = hasFeatureAccess(company, "public_trust_score");

  const [record, setRecord] = useState<TrustScoreRecord | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadScore = () => {
      const records = dbStore.getTrustScores(company.id);
      if (records.length > 0) {
        setRecord(records[0]);
      } else {
        // Fallback default
        setRecord({
          id: "ts_default",
          companyId: company.id,
          score: 80,
          factors: {
            orderCompletionRate: 85,
            inventoryLevelRating: 70,
            workerActivityScore: 85,
          },
          updatedAt: new Date().toISOString(),
        });
      }
    };
    loadScore();
    const unsubscribe = dbStore.subscribe(loadScore);
    return () => unsubscribe();
  }, [company]);

  const handleCopyLink = () => {
    const link = `https://vendoros.com/public/trust/${company.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!access.hasAccess) {
    return (
      <NoDataPlaceholder
        icon={<ShieldCheck className="w-4 h-4" />}
        title="No data yet"
        message="Your trust score will appear here once enough order and activity history has been recorded."
      />
    );
  }

  if (!record) return null;

  const score = record.score;

  const getScoreDescription = (s: number) => {
    if (s >= 90)
      return {
        label: "Excellent Credibility",
        text: "Highly trustworthy",
        color: "text-emerald-400",
      };
    if (s >= 75)
      return {
        label: "Good Credibility",
        text: "Solid operational reliability",
        color: "text-emerald-500",
      };
    return {
      label: "Standard Rating",
      text: "Baseline trust indicators",
      color: "text-amber-500",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
      id="trust-score-dashboard"
    >
      {/* Top Banner and Score Indicator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
        {/* Visual Badge */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#0A0A0A] border border-[#222222] rounded-sm text-center">
          <div className="relative w-28 h-28 flex items-center justify-center mb-1">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#1D1D1D"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                className={getScoreDescription(score).color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100),
                }}
                transition={{
                  duration: 1,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.15,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-0.5" />
              <span className="text-2xl font-mono font-extrabold text-white leading-none">
                {score}%
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
            VendorOS trust index
          </span>
          <span
            className={`text-[10px] font-mono uppercase font-bold tracking-widest mt-2 ${getScoreDescription(score).color}`}
          >
            {getScoreDescription(score).label}
          </span>
        </div>

        {/* Factors list */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-1.5">
              Live Reputation Analytics
            </h3>
            <p className="text-xs text-[#888888] leading-relaxed">
              Calculated dynamically on the server by evaluating order dispatch
              speeds, stock consistency, and worker job response latencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#0A0A0A] p-3 border border-[#1D1D1D] rounded-sm hover:border-[#333333] transition-colors">
              <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                Fulfillment Rate
              </span>
              <span className="text-lg font-mono font-bold text-white mt-1 block">
                {record.factors.orderCompletionRate}%
              </span>
            </div>

            <div className="bg-[#0A0A0A] p-3 border border-[#1D1D1D] rounded-sm hover:border-[#333333] transition-colors">
              <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                Inventory Balance
              </span>
              <span className="text-lg font-mono font-bold text-white mt-1 block">
                {record.factors.inventoryLevelRating}%
              </span>
            </div>

            <div className="bg-[#0A0A0A] p-3 border border-[#1D1D1D] rounded-sm hover:border-[#333333] transition-colors">
              <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                Worker Engagement
              </span>
              <span className="text-lg font-mono font-bold text-white mt-1 block">
                {record.factors.workerActivityScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Trust Link Sharing Card */}
      <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
        <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-2 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5" /> Standalone Public Profile Profile
        </h3>
        <p className="text-xs text-[#555555] leading-relaxed mb-4">
          Enable external clients, general contractors, or banks to view your
          certified operations credentials directly.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 font-mono text-xs">
          <div className="flex-grow bg-[#0A0A0A] border border-[#222222] px-4 py-3 rounded-sm text-[#888888] flex items-center select-all truncate">
            https://vendoros.com/public/trust/{company.id}
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyLink}
            className="px-5 py-3 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-md transition-colors cursor-pointer shrink-0 flex items-center justify-center space-x-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "Copied!" : "Copy Public URL"}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
export default TrustScoreTab;
