import React from "react";
import { ServiceOrder } from "../types";
import { MapPin, AlertTriangle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface OrderCardProps {
  order: ServiceOrder;
  onViewDetails: (order: ServiceOrder) => void;
  currency?: "INR" | "USD";
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onViewDetails,
  currency = "USD",
}) => {
  const riskInfo = (() => {
    if (order.riskScore === undefined || order.riskScore === null) {
      return {
        label: "Not scored",
        dot: "bg-[#333333]",
        text: "text-[#555555]",
      };
    }
    if (order.riskScore < 35)
      return {
        label: "Low risk",
        dot: "bg-emerald-500",
        text: "text-emerald-400",
      };
    if (order.riskScore < 70)
      return {
        label: "Moderate risk",
        dot: "bg-amber-500",
        text: "text-amber-400",
      };
    return { label: "High risk", dot: "bg-rose-500", text: "text-rose-400" };
  })();

  const statusStyles: Record<ServiceOrder["stage"], string> = {
    Unscheduled: "bg-[#2D220D] text-amber-400 border border-amber-950/40",
    Scheduled: "bg-[#1D122D] text-purple-400 border border-purple-950/40",
    Dispatched: "bg-[#0D1D2D] text-blue-400 border border-blue-950/40",
    "In Progress": "bg-[#0D1D2D] text-blue-400 border border-blue-950/40",
    Completed: "bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40",
  };

  const deliveryDateLabel = order.deliveryDate
    ? new Date(order.deliveryDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Not set";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={() => onViewDetails(order)}
      className={`bg-[#111111] border rounded-sm p-4 cursor-pointer shadow-md hover:border-[#333333] transition-colors ${
        order.belowMinimumThreshold ? "border-amber-950/40" : "border-[#222222]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] text-[#666666]">
              {order.id}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${riskInfo.dot}`}
              title={riskInfo.label}
            />
            {order.belowMinimumThreshold && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[8px] font-mono font-bold uppercase">
                <AlertTriangle className="w-2.5 h-2.5" /> Below Min
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white mt-1.5 truncate">
            {order.title}
          </h4>
          <p className="text-xs text-[#888888] mt-0.5 truncate">
            {order.customerName}
          </p>
        </div>

        <span
          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest font-semibold ${statusStyles[order.stage]}`}
        >
          {order.stage}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono text-[#555555] mt-3 pt-3 border-t border-[#1D1D1D]">
        <span className="flex items-center">
          <MapPin className="w-3 h-3 mr-1" /> {order.address || "No address"}
        </span>
        <span>
          DELIVERY: <span className="text-[#888888]">{deliveryDateLabel}</span>
        </span>
        {order.quantity !== undefined && (
          <span>
            QTY: <span className="text-[#888888]">{order.quantity}</span>
          </span>
        )}
        <span>
          {currency === "INR" ? "₹" : "$"}
          {order.value.toLocaleString()}
        </span>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(order);
        }}
        className="mt-3 w-full flex items-center justify-center gap-1 text-[9px] uppercase font-bold font-mono tracking-widest bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#333333] text-[#888888] hover:text-white px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer"
      >
        View Details <ChevronRight className="w-3 h-3" />
      </button>
    </motion.div>
  );
};

export default OrderCard;
