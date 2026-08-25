
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";
import {
  TrendingUp,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { Company, SpendIntelligenceRecord } from "../types";
import dbStore from "../services/store";
import { hasFeatureAccess } from "../services/subscriptionService";
import { NoDataPlaceholder } from "./NoDataPlaceholder";
import { useAuth } from "../context/AuthContext";

interface AnalyticsTabProps {
  company: Company;
  onNavigateToBilling: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  company,
  onNavigateToBilling,
}) => {
  const { preferences } = useAuth();
  const isDark = (preferences?.themeMode || "dark") !== "light";
  const gridColor = isDark ? "#1E293B" : "#E2E8F0";
  const axisColor = isDark ? "#64748B" : "#94A3B8";
  const tooltipBg = isDark ? "#0A0A0A" : "#FFFFFF";
  const tooltipBorder = isDark ? "#222222" : "#CBD5E1";
  const tooltipText = isDark ? "#FFFFFF" : "#0F172A";
  const primaryStroke = isDark ? "#FFFFFF" : "#0F172A";

  const access = hasFeatureAccess(company, "supplier_spend_intelligence");

  const [spendRecords, setSpendRecords] = useState<SpendIntelligenceRecord[]>(
    [],
  );

  useEffect(() => {
    const loadSpend = () => {
      setSpendRecords(dbStore.getSpendIntelligence(company.id));
    };
    loadSpend();
    const unsubscribe = dbStore.subscribe(loadSpend);
    return () => unsubscribe();
  }, [company]);

  if (!access.hasAccess) {
    return (
      <NoDataPlaceholder
        icon={<TrendingUp className="w-4 h-4" />}
        title="No data yet"
        message="Spend and performance analytics will appear here once enough order history has been recorded."
      />
    );
  }

  // Sample data for charts
  const spendData = [
    { name: "Jan", spend: 85000, optimized: 85000 },
    { name: "Feb", spend: 120000, optimized: 105000 },
    { name: "Mar", spend: 145000, optimized: 120000 },
    { name: "Apr", spend: 110000, optimized: 100000 },
    { name: "May", spend: 190000, optimized: 155000 },
    { name: "Jun", spend: 220000, optimized: 180000 },
  ];

  const supplierPerformanceData = [
    { name: "Apex Copper", delayHours: 4, fulfillmentRate: 98 },
    { name: "VoltCable Ind", delayHours: 12, fulfillmentRate: 92 },
    { name: "RapidHVAC Whsl", delayHours: 28, fulfillmentRate: 81 },
    { name: "National Piping", delayHours: 6, fulfillmentRate: 96 },
  ];

  const workerCompletionData = [
    { name: "Alice", avgHours: 3.2 },
    { name: "Bob", avgHours: 4.8 },
    { name: "Charlie", avgHours: 2.1 },
    { name: "Dave", avgHours: 5.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className="space-y-6"
      id="scale-analytics-dashboard"
    >
      {/* Top Headline Metrics Bar */}
      <div className="vos-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="bg-[#111111] border border-[#222222] p-5 rounded-sm shadow-md hover:border-[#333333] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block">
              Consolidated Category Spend
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold uppercase">
              Target Met
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-white mt-2 block">
            ₹2,20,000
          </span>
          <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> ▼ 12.5% vs Prior Month (AI Optimized)
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="bg-[#111111] border border-[#222222] p-5 rounded-sm shadow-md hover:border-[#333333] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block">
              Average Supplier Lead Delay
            </span>
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold uppercase">
              Alert Trigger
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-white mt-2 block">
            12.5 hrs
          </span>
          <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <AlertCircle className="w-3.5 h-3.5" /> ▲ 2.1 hrs above 10h SLA threshold
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="bg-[#111111] border border-[#222222] p-5 rounded-sm shadow-md hover:border-[#333333] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider block">
              Technician Job Response Speed
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-sm text-[10px] font-mono font-semibold uppercase">
              100% SLA
            </span>
          </div>
          <span className="text-2xl font-mono font-bold text-white mt-2 block">
            3.9 hrs
          </span>
          <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1 font-mono font-semibold">
            <CheckCircle className="w-3.5 h-3.5" /> 100% of dispatched orders within SLA bounds
          </p>
        </motion.div>
      </div>

      {/* Supplier Spend Intelligence & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Spend Chart */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
                Supplier Spend Analysis & Forecast
              </h3>
              <span className="text-xs text-[#888888] mt-1 block">
                Historical cost vectors comparing standard spend versus AI-optimized procurement.
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={spendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorOptimized"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    fontSize: "12px",
                    color: tooltipText,
                    borderRadius: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke={primaryStroke}
                  fillOpacity={1}
                  fill="url(#colorSpend)"
                  strokeWidth={2}
                  name="Regular Spend"
                />
                <Area
                  type="monotone"
                  dataKey="optimized"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorOptimized)"
                  strokeWidth={2}
                  name="Optimized Spend"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Spend Optimization Actions */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 shadow-md">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              AI Spend Optimization Feed
            </h3>
            <span className="text-xs text-[#888888] mt-1 block">
              Immediate actions to consolidate orders and eliminate procurement leakage.
            </span>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto divide-y divide-[#1D1D1D]">
            {spendRecords.map((rec) => (
              <div key={rec.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white block">
                    {rec.category}
                  </span>
                  <span
                    className={`text-xs font-mono font-bold ${rec.changePercent > 0 ? "text-amber-400" : "text-emerald-400"}`}
                  >
                    {rec.changePercent > 0
                      ? `+${rec.changePercent}%`
                      : `${rec.changePercent}%`}
                  </span>
                </div>
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] p-3 rounded-sm flex items-start gap-2.5 text-xs hover:border-[#2A2A2A] transition-colors">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[#E5E5E5] leading-relaxed">
                    {rec.suggestedAction}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Supplier Lead times and worker KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Lead Delay Chart */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 shadow-md">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              Supplier Lead Time Delays (Hours)
            </h3>
            <span className="text-xs text-[#888888] mt-1 block">
              Lower values indicate faster warehouse-to-site fulfillment cycles.
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={supplierPerformanceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    fontSize: "12px",
                    color: tooltipText,
                    borderRadius: "4px",
                  }}
                />
                <Bar
                  dataKey="delayHours"
                  fill={primaryStroke}
                  radius={[2, 2, 0, 0]}
                  name="Lead Delay (Hrs)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker SLA speeds */}
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 shadow-md">
          <div>
            <h3 className="text-xs font-mono font-bold text-[#A1A1AA] uppercase tracking-wider">
              Technician Average Job Completion (Hours)
            </h3>
            <span className="text-xs text-[#888888] mt-1 block">
              Speed benchmark per technician on completed work orders.
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workerCompletionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={11}
                  className="font-mono"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    fontSize: "12px",
                    color: tooltipText,
                    borderRadius: "4px",
                  }}
                />
                <Bar
                  dataKey="avgHours"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  name="Completion (Hrs)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default AnalyticsTab;
