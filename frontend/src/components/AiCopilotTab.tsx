
import React, { useState } from "react";
import {
  Bot,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Company, ServiceOrder } from "../types";
import { hasFeatureAccess } from "../services/subscriptionService";
import NoDataPlaceholder from "./NoDataPlaceholder";

interface AiCopilotTabProps {
  company: Company;
  orders: ServiceOrder[];
  onNavigateToBilling: () => void;
}

interface CopilotResult {
  score: number;
  reason: string;
  action: string;
}

export const AiCopilotTab: React.FC<AiCopilotTabProps> = ({
  company,
  orders,
  onNavigateToBilling,
}) => {
  const access = hasFeatureAccess(company, "ai_copilot");

  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<CopilotResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState("");
  const [error, setError] = useState("");

  const loadingTips = [
    "Parsing field service parameters...",
    "Consulting Gemini 3.5 model...",
    "Analyzing safety and location vectors...",
    "Formulating suggested mitigation protocols...",
  ];

  const handleRunAnalysis = async () => {
    if (!selectedOrderId) return;
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!order) return;

    setLoading(true);
    setError("");
    setAnalysisResult(null);

    // Dynamic loader tips
    let tipIdx = 0;
    setLoadingTip(loadingTips[0]);
    const tipInterval = setInterval(() => {
      tipIdx = (tipIdx + 1) % loadingTips.length;
      setLoadingTip(loadingTips[tipIdx]);
    }, 1200);

    try {
      const response = await fetch("/api/copilot/risk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order,
          subscription: company.subscription,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to complete analysis.");
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      clearInterval(tipInterval);
      setLoading(false);
    }
  };

  if (!access.hasAccess) {
    return (
      <NoDataPlaceholder
        icon={<Bot className="w-4 h-4" />}
        title="No data yet"
        message="AI Copilot analysis will appear here once you run your first risk check on a work order."
      />
    );
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Helper to determine score color
  const getScoreColor = (score: number) => {
    if (score < 35)
      return {
        border: "border-emerald-500/30",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10",
        glow: "shadow-[0_0_15px_rgba(16,185,129,0.1)]",
      };
    if (score < 70)
      return {
        border: "border-amber-500/30",
        text: "text-amber-400",
        bg: "bg-amber-500/10",
        glow: "shadow-[0_0_15px_rgba(245,158,11,0.1)]",
      };
    return {
      border: "border-rose-500/30",
      text: "text-rose-400",
      bg: "bg-rose-500/10",
      glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
      id="ai-copilot-panel"
    >
      <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
              AI OPERATIONS COPILOT COMMAND CENTER
            </h3>
            <p className="text-xs text-[#555555] mt-1">
              Select an active field service order to evaluate operational
              hazards with real-time AI.
            </p>
          </div>
          <span className="bg-[#1D120D] text-amber-500 border border-amber-950 px-2.5 py-1 rounded-sm text-[9px] font-mono uppercase tracking-widest flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Live Gemini Analysis Enabled
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow space-y-1.5 w-full">
            <label className="text-[9px] font-mono text-[#555555] uppercase tracking-widest">
              Select Work Order
            </label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value);
                setAnalysisResult(null);
                setError("");
              }}
              className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0A0A0A] text-white text-xs font-mono focus:outline-none focus:border-[#444444]"
            >
              <option value="">-- Choose an active order --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  [{o.id}] {o.title} - Valued{" "}
                  {company.subscription?.tier === "free"
                    ? `₹${o.value}`
                    : `₹${o.value}`}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ y: selectedOrderId && !loading ? -1 : 0 }}
            whileTap={{ scale: selectedOrderId && !loading ? 0.97 : 1 }}
            onClick={handleRunAnalysis}
            disabled={!selectedOrderId || loading}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-[#F0EAD8] text-black disabled:bg-[#1A1A1A] disabled:text-[#444444] disabled:border-[#222222] border border-transparent rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-md transition-colors shrink-0 cursor-pointer flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
            <span>Analyze operational Risk</span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-[#111111] border border-[#222222] p-12 text-center rounded-sm space-y-4 shadow-md"
          >
            <div className="flex justify-center">
              <Bot className="w-8 h-8 text-white animate-bounce" />
            </div>
            <p className="text-xs text-white font-mono font-semibold">
              {loadingTip}
            </p>
            <p className="text-[9px] text-[#444444] uppercase tracking-widest font-mono">
              Leveraging Gemini flash context parsing
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-950/10 border border-red-900/40 p-4 rounded-sm text-red-400 text-xs flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold uppercase text-[9px] tracking-wider block">
                Analysis Failed
              </span>
              <p className="mt-1 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {analysisResult && selectedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            id="ai-analysis-results"
          >
            {/* Risk Gauge Card */}
            <div
              className={`bg-[#111111] border rounded-sm p-6 flex flex-col items-center justify-center text-center shadow-md ${getScoreColor(analysisResult.score).border} ${getScoreColor(analysisResult.score).glow}`}
            >
              <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block mb-4">
                Operational risk Index
              </span>

              <div className="relative flex items-center justify-center w-28 h-28">
                {/* SVG Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#161616"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                    animate={{
                      strokeDashoffset:
                        2 * Math.PI * 48 * (1 - analysisResult.score / 100),
                    }}
                    transition={{
                      duration: 1,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1,
                    }}
                    className={getScoreColor(analysisResult.score).text}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-3xl font-mono font-extrabold ${getScoreColor(analysisResult.score).text}`}
                  >
                    {analysisResult.score}
                  </span>
                  <span className="text-[8px] font-mono text-[#444444] uppercase tracking-widest">
                    of 100
                  </span>
                </div>
              </div>

              <span
                className={`mt-4 inline-flex px-2.5 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest font-bold ${getScoreColor(analysisResult.score).bg} ${getScoreColor(analysisResult.score).text}`}
              >
                {analysisResult.score < 35
                  ? "Low Hazard"
                  : analysisResult.score < 70
                    ? "Moderate Alert"
                    : "Severe Hazard"}
              </span>
            </div>

            {/* AI Explanation and Mitigation Protocol */}
            <div className="lg:col-span-2 bg-[#111111] border border-[#222222] rounded-sm p-6 flex flex-col justify-between shadow-md">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                    AI Copilot Diagnosis
                  </span>
                  <p className="text-sm text-white italic font-serif leading-relaxed mt-2 pl-4 border-l border-[#333333]">
                    "{analysisResult.reason}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1D1D1D]">
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                    Recommended Mitigation Step
                  </span>
                  <div className="bg-[#0A0A0A] border border-[#1D1D1D] p-3 rounded-sm mt-2 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-[#888888] leading-relaxed">
                      {analysisResult.action}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1D1D1D] flex items-center justify-between text-[10px] text-[#444444] font-mono uppercase tracking-widest">
                <span>Evaluated order: {selectedOrder.id}</span>
                <span>Powered by Gemini 3.5 Flash</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
export default AiCopilotTab;
