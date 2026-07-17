
import React, { useState, useEffect } from "react";
import dbStore from "../services/store";
import { ActivityLog as ActivityLogType } from "../types";
import {
  Search,
  LogIn,
  LogOut,
  User,
  Settings,
  Shield,
  Activity,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  FileText,
} from "lucide-react";
import { motion } from "motion/react";

interface ActivityLogProps {
  companyId?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ companyId }) => {
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Load and subscribe to updates
  useEffect(() => {
    const loadLogs = () => {
      // Get logs for specific company if passed
      setLogs(dbStore.getActivityLogs(companyId));
    };

    loadLogs();
    const unsubscribe = dbStore.subscribe(loadLogs);
    return () => unsubscribe();
  }, [companyId]);

  // Unique actions for the filter dropdown
  const actionTypes = [
    "All",
    ...Array.from(new Set(logs.map((l) => l.action))),
  ];
  const roleTypes = ["All", "Owner", "Manager", "Worker", "Customer"];

  // Filter and sort logs
  const filteredLogs = logs
    .filter((log) => {
      const matchesSearch =
        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAction =
        selectedAction === "All" || log.action === selectedAction;
      const matchesRole =
        selectedRole === "All" || log.userRole === selectedRole;

      return matchesSearch && matchesAction && matchesRole;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // Action helper to get appropriate visual treatment
  const getActionStyles = (action: string) => {
    switch (action) {
      case "Login":
        return {
          icon: <LogIn className="w-3.5 h-3.5 text-emerald-400" />,
          bgColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        };
      case "Logout":
        return {
          icon: <LogOut className="w-3.5 h-3.5 text-slate-400" />,
          bgColor: "bg-slate-500/10 border-slate-500/20 text-slate-400",
        };
      case "User Registered":
        return {
          icon: <User className="w-3.5 h-3.5 text-amber-400" />,
          bgColor: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        };
      case "Profile Update":
        return {
          icon: <Settings className="w-3.5 h-3.5 text-blue-400" />,
          bgColor: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        };
      case "Security Update":
        return {
          icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
          bgColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
        };
      case "Role Revoked":
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-red-400" />,
          bgColor: "bg-red-500/10 border-red-500/20 text-red-400",
        };
      case "Domain Action":
        return {
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
          bgColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
        };
      case "Order Stage":
      case "Order Assignment":
        return {
          icon: <FileText className="w-3.5 h-3.5 text-indigo-400" />,
          bgColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5 text-[#888888]" />,
          bgColor: "bg-[#1A1A1A] border-[#222222] text-[#888888]",
        };
    }
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case "Owner":
        return "border border-red-500/20 bg-red-950/10 text-red-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono";
      case "Manager":
        return "border border-blue-500/20 bg-blue-950/10 text-blue-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono";
      case "Worker":
        return "border border-amber-500/20 bg-amber-950/10 text-amber-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono";
      case "Customer":
        return "border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono";
      default:
        return "border border-zinc-700 bg-zinc-800 text-zinc-400 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-mono";
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedAction("All");
    setSelectedRole("All");
    setSortOrder("desc");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Search and Filters Header */}
      <div className="bg-[#111111] p-6 border border-[#222222] rounded-sm shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-serif italic text-white font-light tracking-tight flex items-center">
              <Activity className="w-5 h-5 mr-2 text-[#888888]" />
              Audit Trail & Activity Log
            </h2>
            <p className="text-xs text-[#666666] font-mono uppercase tracking-wider mt-1">
              Secure operational logs monitoring critical claims and environment
              state changes
            </p>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClearFilters}
            className="self-start lg:self-auto text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-white flex items-center py-2 px-3 bg-[#1A1A1A] border border-[#222222] rounded-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3 mr-1.5" />
            Reset State Filter
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#555555]" />
            </span>
            <input
              type="text"
              placeholder="Search audit actions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#222222] text-xs text-white pl-10 pr-4 py-2.5 rounded-sm focus:outline-none focus:border-[#444444] transition-colors placeholder:text-[#444444]"
            />
          </div>

          {/* Action type Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#222222] text-xs text-white px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#444444] transition-colors cursor-pointer"
            >
              <option disabled>Filter by Action</option>
              {actionTypes.map((act) => (
                <option key={act} value={act}>
                  {act === "All" ? "All Actions" : act}
                </option>
              ))}
            </select>
          </div>

          {/* Role type Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#222222] text-xs text-white px-3 py-2.5 rounded-sm focus:outline-none focus:border-[#444444] transition-colors cursor-pointer"
            >
              <option disabled>Filter by Role</option>
              {roleTypes.map((role) => (
                <option key={role} value={role}>
                  {role === "All" ? "All Roles" : role}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting option */}
          <div className="relative flex bg-[#0A0A0A] border border-[#222222] rounded-sm p-1">
            {(
              [
                { id: "desc", label: "Newest" },
                { id: "asc", label: "Oldest" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                onClick={() => setSortOrder(s.id)}
                className={`relative flex-1 text-[10px] uppercase tracking-widest font-bold py-1.5 rounded-sm cursor-pointer ${
                  sortOrder === s.id
                    ? "text-black font-extrabold"
                    : "text-[#666666] hover:text-[#AAAAAA]"
                }`}
              >
                {sortOrder === s.id && (
                  <motion.span
                    layoutId="vos-activity-sort-pill"
                    className="absolute inset-0 -z-10 bg-white rounded-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logs View List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-[#111111] border border-[#222222] rounded-sm p-12 text-center">
            <AlertCircle className="w-8 h-8 text-[#444444] mx-auto mb-3" />
            <span className="font-mono text-[10px] text-[#666666] uppercase tracking-widest block">
              No Matching Audit Entries Found
            </span>
            <p className="text-xs text-[#444444] mt-1 max-w-sm mx-auto">
              Try updating the query filter parameters or recording new system
              operations to capture logs.
            </p>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#222222] rounded-sm divide-y divide-[#222222] overflow-hidden shadow-md">
            {filteredLogs.map((log, index) => {
              const styles = getActionStyles(log.action);
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: Math.min(index * 0.03, 0.3),
                  }}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#151515] transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Action Icon Circle */}
                    <div
                      className={`p-2.5 rounded-sm border shrink-0 mt-0.5 ${styles.bgColor}`}
                    >
                      {styles.icon}
                    </div>

                    <div className="space-y-1">
                      {/* Action Title and Details */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-white uppercase tracking-wider">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-slate-500">•</span>
                        <span className="text-xs text-white font-medium">
                          {log.userName}
                        </span>
                        <span className={getRoleBadgeStyles(log.userRole)}>
                          {log.userRole}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 font-sans leading-relaxed">
                        {log.details}
                      </p>

                      <div className="flex items-center space-x-2 text-[10px] font-mono text-[#555555]">
                        <span>ID: {log.id}</span>
                        <span>•</span>
                        <span>User UUID: {log.userId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp Right aligned */}
                  <div className="shrink-0 text-left sm:text-right">
                    <span className="text-[10px] font-mono font-medium text-[#888888] block uppercase tracking-widest">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono text-[#555555] block">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};
