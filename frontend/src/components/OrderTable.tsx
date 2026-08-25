import React, { useState } from "react";
import { ServiceOrder } from "../types";
import { Clock, MapPin, CheckCircle, Search } from "lucide-react";

interface OrderTableProps {
  orders: ServiceOrder[];
  onViewOrder?: (order: ServiceOrder) => void;
  onEditStages?: (order: ServiceOrder) => void;
  onDispatchOrder?: (order: ServiceOrder) => void;
  onCompleteJob?: (order: ServiceOrder) => void;
  currency?: "INR" | "USD";
  showStageAction?: boolean;
  showDispatchAction?: boolean;
  userRole?: string;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewOrder,
  onEditStages,
  onDispatchOrder,
  onCompleteJob,
  currency = "INR",
  showStageAction = false,
  showDispatchAction = false,
  userRole = "Manager",
}) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const formatCurrency = (val: number) => {
    return currency === "INR" ? `₹${val.toLocaleString()}` : `$${val.toLocaleString()}`;
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      o.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (o.workerName && o.workerName.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStage = stageFilter === "all" || o.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#888888] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search orders, clients, ID..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white placeholder-[#888888] text-xs font-mono rounded-sm focus:outline-none focus:border-white"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
          >
            <option value="all">All Stages ({orders.length})</option>
            <option value="Created">Created</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-[#222222] rounded-sm">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#111111] text-[#888888] border-b border-[#222222] uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Order / Title</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Assigned Specialist</th>
              <th className="p-3.5">Value</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A] bg-[#0A0A0A]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#888888] font-mono text-xs">
                  No service orders found matching criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-3.5">
                    <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ord.title}
                    </div>
                    <div className="text-[10px] text-[#666666] flex items-center space-x-2 mt-0.5">
                      <span>{ord.id}</span>
                      {ord.address && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[200px] flex items-center">
                            <MapPin className="w-2.5 h-2.5 mr-0.5 inline shrink-0" />
                            {ord.address}
                          </span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-[#AAAAAA]">{ord.customerName || "Walk-in"}</td>
                  <td className="p-3.5">
                    {ord.workerName ? (
                      <span className="text-white bg-[#1A1A1A] px-2 py-0.5 rounded-sm border border-[#2A2A2A]">
                        {ord.workerName}
                      </span>
                    ) : (
                      <span className="text-[#666666] italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-white">{formatCurrency(ord.value || 0)}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-bold border ${
                        ord.stage === "Completed"
                          ? "bg-[#0D2A1D] text-emerald-400 border-emerald-950/40"
                          : ord.stage === "In Progress"
                          ? "bg-[#0D1D2D] text-blue-400 border-blue-950/40"
                          : ord.stage === "Assigned"
                          ? "bg-[#2D1F0D] text-amber-400 border-amber-950/40"
                          : "bg-[#1A1A1A] text-[#888888] border-[#262626]"
                      }`}
                    >
                      {ord.stage}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    {showStageAction && onEditStages && (
                      <button
                        onClick={() => onEditStages(ord)}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333333] text-white text-[10px] uppercase tracking-wider rounded-sm cursor-pointer transition-colors"
                      >
                        Stages ({ord.stages?.length || 0})
                      </button>
                    )}
                    {showDispatchAction && onDispatchOrder && ord.stage !== "Completed" && (
                      <button
                        onClick={() => onDispatchOrder(ord)}
                        className="px-2.5 py-1 bg-white hover:bg-zinc-200 text-black font-bold text-[10px] uppercase tracking-wider rounded-sm cursor-pointer transition-colors"
                      >
                        Dispatch
                      </button>
                    )}
                    {onViewOrder && (
                      <button
                        onClick={() => onViewOrder(ord)}
                        className="px-2.5 py-1 bg-[#141414] hover:bg-[#1E1E1E] border border-[#2E2E2E] text-slate-300 text-[10px] uppercase tracking-wider rounded-sm cursor-pointer transition-colors"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
