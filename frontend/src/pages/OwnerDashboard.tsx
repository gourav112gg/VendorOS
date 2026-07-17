import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import dbStore from "../services/store";
import { Domain, UserProfile, ServiceOrder } from "../types";
import {
  Building,
  Users,
  Layers,
  Activity,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  UserMinus,
  Info,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign,
  Calendar,
  Settings,
  Bot,
  FileText,
  BarChart2,
  ShieldAlert,
  List,
  CalendarDays,
  TrendingDown,
  UserCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { SettingsPanel } from "../components/SettingsPanel";
import { ActivityLog } from "../components/ActivityLog";
import { ShortcutBadge } from "../components/ShortcutBadge";
import { OrderCard } from "../components/OrderCard";
import { CalendarView } from "../components/CalendarView";

// Subscription Gated Tabs
import { AiCopilotTab } from "../components/AiCopilotTab";
import { InvoicesTab } from "../components/InvoicesTab";
import { TrustScoreTab } from "../components/TrustScoreTab";
import { AnalyticsTab } from "../components/AnalyticsTab";

export const OwnerDashboard: React.FC = () => {
  const { user, company, preferences } = useAuth();

  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<
    | "overview"
    | "domains"
    | "team"
    | "orders"
    | "copilot"
    | "invoices"
    | "trust-score"
    | "analytics"
    | "billing"
    | "activity"
    | "settings"
  >("overview");

  // Domains state
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isDomainFormOpen, setIsDomainFormOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [domainName, setDomainName] = useState("");
  const [domainType, setDomainType] = useState("Plumbing");
  const [domainStatus, setDomainStatus] = useState<"Active" | "Inactive">(
    "Active",
  );

  // Team state
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [removingMember, setRemovingMember] = useState<UserProfile | null>(
    null,
  );
  const [typedConfirmationName, setTypedConfirmationName] = useState("");
  const [removeError, setRemoveError] = useState("");

  // Orders state
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [dispatchingOrder, setDispatchingOrder] = useState<ServiceOrder | null>(
    null,
  );

  // Manual order states
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [newOrderDesc, setNewOrderDesc] = useState("");
  const [newOrderCustName, setNewOrderCustName] = useState("");
  const [newOrderCustEmail, setNewOrderCustEmail] = useState("");
  const [newOrderAddr, setNewOrderAddr] = useState("");
  const [newOrderValue, setNewOrderValue] = useState(1500);
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState("");

  // Selected order for detail view
  const [viewingOrder, setViewingOrder] = useState<ServiceOrder | null>(null);

  // Overview tab: view mode + filters (§2.2 in skeleton spec)
  const [overviewView, setOverviewView] = useState<"list" | "calendar">("list");
  const [overviewManagerFilter, setOverviewManagerFilter] =
    useState<string>("all");
  const [overviewStatusFilter, setOverviewStatusFilter] =
    useState<string>("all");
  const [overviewRiskFilter, setOverviewRiskFilter] = useState<string>("all");

  // Load and subscribe to DB changes
  useEffect(() => {
    if (!user || !user.companyId) return;

    const loadData = () => {
      const compId = user.companyId!;
      setDomains(dbStore.getDomains(compId));
      const freshOrders = dbStore.getOrders(compId);
      setOrders(freshOrders);

      const allUsers = dbStore.getUsers();
      // Filter users of same company, excluding self (the owner)
      setTeamMembers(
        allUsers.filter((u) => u.companyId === compId && u.id !== user.id),
      );

      // Sync active viewing order
      if (viewingOrder) {
        const freshViewing = freshOrders.find((o) => o.id === viewingOrder.id);
        if (freshViewing) {
          setViewingOrder(freshViewing);
        }
      }
    };

    loadData();
    // Subscribe to store updates (so changes elsewhere sync instantly)
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [user, viewingOrder]);

  // Handle power user quick navigation shortcut custom events
  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetTab = customEvent.detail;
      const validTabs = [
        "overview",
        "domains",
        "team",
        "orders",
        "copilot",
        "invoices",
        "trust-score",
        "analytics",
        "billing",
        "activity",
        "settings",
      ];
      if (validTabs.includes(targetTab)) {
        setActiveSubTab(targetTab as any);
      }
    };
    window.addEventListener("vendoros-nav", handleNav);
    return () => window.removeEventListener("vendoros-nav", handleNav);
  }, []);

  if (!user || !company) return null;

  // --- Domains Actions ---
  const handleOpenAddDomain = () => {
    setEditingDomain(null);
    setDomainName("");
    setDomainType("Plumbing");
    setDomainStatus("Active");
    setIsDomainFormOpen(true);
  };

  const handleOpenEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setDomainName(domain.name);
    setDomainType(domain.type);
    setDomainStatus(domain.status);
    setIsDomainFormOpen(true);
  };

  const handleSaveDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainName.trim()) return;

    if (editingDomain) {
      dbStore.updateDomain(
        editingDomain.id,
        domainName,
        domainType,
        domainStatus,
        user.id,
      );
    } else {
      dbStore.addDomain(
        user.companyId!,
        domainName,
        domainType,
        domainStatus,
        user.id,
      );
    }

    setIsDomainFormOpen(false);
    setEditingDomain(null);
  };

  const handleDeleteDomain = (id: string) => {
    if (confirm("Are you sure you want to delete this operational domain?")) {
      dbStore.deleteDomain(id, user.id);
    }
  };

  // --- Team Actions ---
  const handleRemoveMemberClick = (member: UserProfile) => {
    setRemovingMember(member);
    setTypedConfirmationName("");
    setRemoveError("");
  };

  const handleConfirmRemoveMember = () => {
    if (!removingMember) return;

    if (
      typedConfirmationName.trim().toLowerCase() !==
      removingMember.name.trim().toLowerCase()
    ) {
      setRemoveError("Typed name doesn't match the team member's exact name.");
      return;
    }

    // Trigger simulated backend: delete record & session revocation
    dbStore.removeUser(removingMember.id);
    setRemovingMember(null);
    setTypedConfirmationName("");
    setRemoveError("");
  };

  // --- Orders Dispatch Actions ---
  const handleAssignWorker = (orderId: string, workerId: string) => {
    const worker = teamMembers.find((t) => t.id === workerId);
    if (worker) {
      dbStore.assignWorker(orderId, worker.id, worker.name, user.id);
    } else if (workerId === "") {
      dbStore.assignWorker(orderId, undefined, undefined, user.id);
    }
    setDispatchingOrder(null);
  };

  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newOrderTitle.trim() ||
      !newOrderCustName.trim() ||
      !newOrderCustEmail.trim() ||
      !newOrderAddr.trim()
    )
      return;

    // First ensure customer exists
    const allUsers = dbStore.getUsers();
    let clientCust = allUsers.find(
      (u) =>
        u.email.trim().toLowerCase() ===
          newOrderCustEmail.trim().toLowerCase() && u.role === "Customer",
    );
    if (!clientCust) {
      clientCust = dbStore.registerCustomer(
        newOrderCustName.trim(),
        newOrderCustEmail.trim().toLowerCase(),
      );
    }

    dbStore.addOrder({
      companyId: user.companyId!,
      title: newOrderTitle.trim(),
      description: newOrderDesc.trim(),
      customerId: clientCust.id,
      customerName: clientCust.name,
      stage: "Unscheduled",
      address: newOrderAddr.trim(),
      latitude: 47.6062 + (Math.random() - 0.5) * 0.05,
      longitude: -122.3321 + (Math.random() - 0.5) * 0.05,
      value: Number(newOrderValue),
      quantity: Number(newOrderQty) || 1,
      deliveryDate: newOrderDeliveryDate || undefined,
    });

    // Reset Form
    setNewOrderTitle("");
    setNewOrderDesc("");
    setNewOrderCustName("");
    setNewOrderCustEmail("");
    setNewOrderAddr("");
    setNewOrderValue(1500);
    setNewOrderQty(1);
    setNewOrderDeliveryDate("");
    setIsAddOrderOpen(false);
  };

  const handleAssignManager = (orderId: string, managerId: string) => {
    const mgr = teamMembers.find((t) => t.id === managerId);
    if (mgr) {
      dbStore.assignManager(orderId, mgr.id, mgr.name, user.id);
    } else {
      dbStore.assignManager(orderId, undefined, undefined, user.id);
    }
  };

  const handleApproveRejectThreshold = (
    orderId: string,
    status: "Approved" | "Rejected",
  ) => {
    dbStore.approveOrRejectThreshold(orderId, status, user.id);
  };

  // Count helper
  const activeDomainsCount = domains.filter(
    (d) => d.status === "Active",
  ).length;
  const managers = teamMembers.filter((t) => t.role === "Manager");
  const workers = teamMembers.filter((t) => t.role === "Worker");

  const formatCurrency = (amount: number) => {
    if (preferences.currency === "INR") {
      return `₹${amount}`;
    }
    return `$${amount}`;
  };

  // ---- Owner Main Dashboard / Overview derived data (skeleton spec §2.2) ----
  const activeOrders = orders.filter((o) => o.stage !== "Completed");
  // riskScore is currently unpopulated by the backend (stubbed in types.ts) —
  // this will just read 0 until a real risk-scoring endpoint starts writing
  // it onto orders. Threshold matches the AI Copilot's "Severe Hazard" cutoff.
  const atRiskOrders = orders.filter(
    (o) => o.riskScore !== undefined && o.riskScore >= 70,
  );
  const belowMinOrders = orders.filter((o) => o.belowMinimumThreshold);
  // Pending Owner-approval signups (skeleton spec §2.1) — not enforced by the
  // backend yet (see UserProfile.approvalStatus in types.ts), so this reads
  // 0 today and will start counting real requests once that's wired in.
  const pendingApprovalsCount = teamMembers.filter(
    (t) => t.approvalStatus === "Pending",
  ).length;

  const overviewFilteredOrders = orders.filter((o) => {
    if (
      overviewManagerFilter !== "all" &&
      o.managerId !== overviewManagerFilter
    )
      return false;
    if (overviewStatusFilter !== "all" && o.stage !== overviewStatusFilter)
      return false;
    if (
      overviewRiskFilter === "high" &&
      !(o.riskScore !== undefined && o.riskScore >= 70)
    )
      return false;
    if (
      overviewRiskFilter === "moderate" &&
      !(o.riskScore !== undefined && o.riskScore >= 35 && o.riskScore < 70)
    )
      return false;
    if (
      overviewRiskFilter === "low" &&
      !(o.riskScore !== undefined && o.riskScore < 35)
    )
      return false;
    if (overviewRiskFilter === "unscored" && o.riskScore !== undefined)
      return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* If sidebar mode, we use a grid layout. Otherwise, standard flow. */}
      <div
        className={
          preferences.navStyle === "sidebar"
            ? "grid grid-cols-1 lg:grid-cols-12 gap-8"
            : ""
        }
      >
        {/* Sidebar Navigation Menu (only shown in sidebar mode) */}
        {preferences.navStyle === "sidebar" && (
          <div className="lg:col-span-3 space-y-4">
            <div>
              <h1 className="text-2xl font-serif italic font-light text-white tracking-tight flex items-center">
                <Building className="w-6 h-6 mr-2 text-[#666666]" />
                {company.name}
              </h1>
              <p className="text-[#666666] mt-1 text-[10px] font-mono uppercase tracking-widest">
                Owner Dashboard
              </p>
            </div>

            <div className="flex flex-col bg-[#111111] p-1.5 border border-[#222222] rounded-sm space-y-1 shadow-md">
              {(
                [
                  "overview",
                  "domains",
                  "team",
                  "orders",
                  "copilot",
                  "invoices",
                  "trust-score",
                  "analytics",
                  "billing",
                  "activity",
                  "settings",
                ] as const
              ).map((tab) => (
                <motion.button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  whileHover={{ x: activeSubTab === tab ? 0 : 2 }}
                  className={`relative w-full text-left px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest cursor-pointer flex items-center justify-between group ${
                    activeSubTab === tab
                      ? "text-black font-extrabold"
                      : "text-[#666666] hover:text-[#AAAAAA]"
                  }`}
                >
                  {activeSubTab === tab && (
                    <motion.span
                      layoutId="vos-owner-sidebar-pill"
                      className="absolute inset-0 -z-10 bg-white rounded-sm shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span>
                    {tab === "orders"
                      ? "dispatch"
                      : tab === "activity"
                        ? "activity log"
                        : tab === "copilot"
                          ? "ai copilot"
                          : tab === "trust-score"
                            ? "trust score"
                            : tab === "billing"
                              ? "pricing & billing"
                              : tab}
                  </span>
                  <ShortcutBadge
                    tab={tab}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area (spans 9 columns in sidebar mode, or full width in horizontal mode) */}
        <div
          className={
            preferences.navStyle === "sidebar"
              ? "lg:col-span-9 space-y-8"
              : "space-y-8"
          }
        >
          {/* Horizontal Header (only shown in horizontal mode) */}
          {preferences.navStyle !== "sidebar" && (
            <div
              className={`flex flex-col md:flex-row mb-8 pb-4 border-b border-[#222222] ${
                preferences.navAlignment === "left"
                  ? "md:items-start md:flex-col space-y-4"
                  : "md:items-center md:justify-between"
              }`}
            >
              <div>
                <h1 className="text-3xl font-serif italic font-light text-white tracking-tight flex items-center">
                  <Building className="w-8 h-8 mr-3 text-[#666666]" />
                  {company.name} Operational Hub
                </h1>
                <p className="text-[#666666] mt-1.5 text-xs font-mono uppercase tracking-widest">
                  Vendor Portal • High-fidelity operations control panel.
                </p>
              </div>

              <div className="flex bg-[#111111] p-1.5 border border-[#222222] rounded-sm mt-4 md:mt-0 space-x-1 flex-wrap gap-y-1 shadow-md">
                {(
                  [
                    "overview",
                    "domains",
                    "team",
                    "orders",
                    "copilot",
                    "invoices",
                    "trust-score",
                    "analytics",
                    "billing",
                    "activity",
                    "settings",
                  ] as const
                ).map((tab) => (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`relative px-3 py-1.5 text-[10px] font-bold rounded-sm uppercase tracking-widest cursor-pointer flex items-center gap-1.5 group ${
                      activeSubTab === tab
                        ? "text-black font-extrabold"
                        : "text-[#666666] hover:text-[#AAAAAA]"
                    }`}
                  >
                    {activeSubTab === tab && (
                      <motion.span
                        layoutId="vos-owner-topnav-pill"
                        className="absolute inset-0 -z-10 bg-white rounded-sm shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                      />
                    )}
                    <span>
                      {tab === "orders"
                        ? "dispatch"
                        : tab === "activity"
                          ? "activity log"
                          : tab === "copilot"
                            ? "ai copilot"
                            : tab === "trust-score"
                              ? "trust score"
                              : tab === "billing"
                                ? "billing"
                                : tab}
                    </span>
                    <ShortcutBadge
                      tab={tab}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeSubTab === "settings" && (
            <SettingsPanel initialTab="profile" />
          )}

          {/* ACTIVITY LOG TAB */}
          {activeSubTab === "activity" && (
            <ActivityLog companyId={user.companyId} />
          )}

          {/* AI COPILOT TAB */}
          {activeSubTab === "copilot" && (
            <AiCopilotTab
              company={company}
              orders={orders}
              onNavigateToBilling={() => setActiveSubTab("billing")}
            />
          )}

          {/* INVOICES TAB */}
          {activeSubTab === "invoices" && (
            <InvoicesTab
              company={company}
              currentUser={user}
              orders={orders}
              onNavigateToBilling={() => setActiveSubTab("billing")}
            />
          )}

          {/* TRUST SCORE TAB */}
          {activeSubTab === "trust-score" && (
            <TrustScoreTab
              company={company}
              onNavigateToBilling={() => setActiveSubTab("billing")}
            />
          )}

          {/* ANALYTICS TAB */}
          {activeSubTab === "analytics" && (
            <AnalyticsTab
              company={company}
              onNavigateToBilling={() => setActiveSubTab("billing")}
            />
          )}

          {/* BILLING TAB */}
          {activeSubTab === "billing" && (
            <SettingsPanel initialTab="subscription" />
          )}

          {/* OVERVIEW TAB — rebuilt per skeleton spec §2.2 "Owner Main Dashboard" */}
          {activeSubTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Summary stat tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111111] border border-[#222222] rounded-sm p-5">
                  <span className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-widest block">
                    Total Active Orders
                  </span>
                  <span className="text-3xl font-sans font-extrabold text-white block mt-2">
                    {activeOrders.length}
                  </span>
                  <span className="text-[10px] font-mono text-[#555555] mt-1 block">
                    of {orders.length} total company-wide
                  </span>
                </div>
                <div
                  className={`rounded-sm p-5 border ${atRiskOrders.length > 0 ? "bg-[#1D120D] border-rose-950/40" : "bg-[#111111] border-[#222222]"}`}
                >
                  <span className="text-[9px] font-mono font-bold text-[#888888] uppercase tracking-widest block">
                    Orders At Risk
                  </span>
                  <span
                    className={`text-3xl font-sans font-extrabold block mt-2 ${atRiskOrders.length > 0 ? "text-rose-400" : "text-white"}`}
                  >
                    {atRiskOrders.length}
                  </span>
                  <span className="text-[10px] font-mono text-[#555555] mt-1 block">
                    Risk score ≥ 70
                  </span>
                </div>
                <div
                  className={`rounded-sm p-5 border ${belowMinOrders.length > 0 ? "bg-[#2D220D] border-amber-950/40" : "bg-[#111111] border-[#222222]"}`}
                >
                  <span className="text-[9px] font-mono font-bold text-[#888888] uppercase tracking-widest block">
                    Below Min. Threshold
                  </span>
                  <span
                    className={`text-3xl font-sans font-extrabold block mt-2 ${belowMinOrders.length > 0 ? "text-amber-400" : "text-white"}`}
                  >
                    {belowMinOrders.length}
                  </span>
                  <span className="text-[10px] font-mono text-[#555555] mt-1 block">
                    vs {formatCurrency(company.minOrderValue ?? 2000)} minimum
                  </span>
                </div>
                <div className="bg-[#111111] border border-[#222222] rounded-sm p-5">
                  <span className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-widest block">
                    Pending Approvals
                  </span>
                  <span className="text-3xl font-sans font-extrabold text-white block mt-2">
                    {pendingApprovalsCount}
                  </span>
                  <span className="text-[10px] font-mono text-[#555555] mt-1 block">
                    Manager / Worker signups
                  </span>
                </div>
              </div>

              {/* Risk flags banner — high-risk orders surfaced at top */}
              {atRiskOrders.length > 0 && (
                <div className="bg-[#1D120D] border border-rose-950/40 rounded-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                      {atRiskOrders.length} order
                      {atRiskOrders.length === 1 ? "" : "s"} flagged high risk
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {atRiskOrders.map((o) => (
                      <OrderCard
                        key={o.id}
                        order={o}
                        onViewDetails={setViewingOrder}
                        currency={
                          preferences.currency === "INR" ? "INR" : "USD"
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Toolbar: New Order + List/Calendar toggle + filters */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsAddOrderOpen(true)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest font-mono transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Order</span>
                  </motion.button>

                  <select
                    value={overviewManagerFilter}
                    onChange={(e) => setOverviewManagerFilter(e.target.value)}
                    className="px-3 py-2 bg-[#111111] border border-[#222222] text-[10px] font-mono uppercase tracking-widest text-[#888888] rounded-sm focus:outline-none focus:border-[#444444] cursor-pointer"
                  >
                    <option value="all">All Managers</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={overviewStatusFilter}
                    onChange={(e) => setOverviewStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-[#111111] border border-[#222222] text-[10px] font-mono uppercase tracking-widest text-[#888888] rounded-sm focus:outline-none focus:border-[#444444] cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    {(
                      [
                        "Unscheduled",
                        "Scheduled",
                        "Dispatched",
                        "In Progress",
                        "Completed",
                      ] as const
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={overviewRiskFilter}
                    onChange={(e) => setOverviewRiskFilter(e.target.value)}
                    className="px-3 py-2 bg-[#111111] border border-[#222222] text-[10px] font-mono uppercase tracking-widest text-[#888888] rounded-sm focus:outline-none focus:border-[#444444] cursor-pointer"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="high">High Risk</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="low">Low Risk</option>
                    <option value="unscored">Not Yet Scored</option>
                  </select>
                </div>

                <div className="flex bg-[#111111] p-1 border border-[#222222] rounded-sm space-x-1">
                  <button
                    onClick={() => setOverviewView("list")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer flex items-center gap-1.5 transition-colors ${
                      overviewView === "list"
                        ? "bg-white text-black"
                        : "text-[#666666] hover:text-white"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" /> List
                  </button>
                  <button
                    onClick={() => setOverviewView("calendar")}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm cursor-pointer flex items-center gap-1.5 transition-colors ${
                      overviewView === "calendar"
                        ? "bg-white text-black"
                        : "text-[#666666] hover:text-white"
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" /> Calendar
                  </button>
                </div>
              </div>

              {/* Full order list/grid (company-wide) OR calendar */}
              {overviewView === "list" ? (
                overviewFilteredOrders.length === 0 ? (
                  <div className="bg-[#111111] border border-[#222222] rounded-sm p-12 text-center text-[#666666] text-xs font-mono uppercase tracking-widest">
                    No orders match the current filters.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {overviewFilteredOrders.map((o) => (
                      <OrderCard
                        key={o.id}
                        order={o}
                        onViewDetails={setViewingOrder}
                        currency={
                          preferences.currency === "INR" ? "INR" : "USD"
                        }
                      />
                    ))}
                  </div>
                )
              ) : (
                <CalendarView
                  orders={overviewFilteredOrders}
                  onSelectOrder={setViewingOrder}
                  currency={preferences.currency === "INR" ? "INR" : "USD"}
                />
              )}
            </motion.div>
          )}

          {/* DOMAINS MANAGEMENT TAB */}
          {activeSubTab === "domains" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
            >
              <div className="p-6 border-b border-[#222222] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0A0A0A]">
                <div>
                  <h2 className="text-lg font-serif italic font-light text-white">
                    Registered Operational Domains
                  </h2>
                  <p className="text-xs text-[#666666] mt-1">
                    Owners define the fields of service the company provides to
                    customers.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddDomain}
                  className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all self-start sm:self-center cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Domain</span>
                </button>
              </div>

              {/* Domains list */}
              {domains.length === 0 ? (
                <div className="p-12 text-center text-[#666666]">
                  <Layers className="w-10 h-10 text-[#333333] mx-auto mb-4" />
                  <p className="font-semibold text-sm">
                    No domains registered yet
                  </p>
                  <p className="text-xs text-[#555555] max-w-xs mx-auto mt-1">
                    Click "Create Domain" to register your first operational
                    category.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0D0D0D] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                        <th className="px-6 py-4">Domain Name</th>
                        <th className="px-6 py-4">Type / Tag</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Created Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A] text-xs">
                      {domains.map((domain) => (
                        <tr
                          key={domain.id}
                          className="hover:bg-[#0D0D0D] transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-white">
                            {domain.name}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-[#1A1A1A] text-[#888888] px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest border border-[#222222]">
                              {domain.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest ${
                                domain.status === "Active"
                                  ? "bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40"
                                  : "bg-[#1A1A1A] text-[#666666] border border-[#222222]"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${domain.status === "Active" ? "bg-emerald-500" : "bg-slate-500"}`}
                              ></span>
                              {domain.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#666666] font-mono">
                            {new Date(domain.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleOpenEditDomain(domain)}
                              className="p-1.5 hover:bg-[#1A1A1A] text-[#666666] hover:text-white rounded-sm transition-all cursor-pointer"
                              title="Edit Domain"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDomain(domain.id)}
                              className="p-1.5 hover:bg-red-950/20 text-[#666666] hover:text-red-500 rounded-sm transition-all cursor-pointer"
                              title="Delete Domain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Slide panel / Modal overlay for Domain Add/Edit */}
              {isDomainFormOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111111] rounded-sm border border-[#222222] max-w-md w-full overflow-hidden"
                  >
                    <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
                      <h3 className="font-serif italic font-light text-base text-white">
                        {editingDomain
                          ? "Edit Operational Domain"
                          : "Create New Domain"}
                      </h3>
                      <button
                        onClick={() => setIsDomainFormOpen(false)}
                        className="p-1 text-[#666666] hover:text-white rounded-sm hover:bg-[#1A1A1A]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveDomain} className="p-6 space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                          Domain Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={domainName}
                          onChange={(e) => setDomainName(e.target.value)}
                          placeholder="e.g. Premium Heating & Boiler Service"
                          className="w-full px-4 py-2 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono placeholder-[#333333]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                          Domain Category / Type
                        </label>
                        <select
                          value={domainType}
                          onChange={(e) => setDomainType(e.target.value)}
                          className="w-full px-4 py-2 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono"
                        >
                          <option value="Plumbing">Plumbing</option>
                          <option value="Electrical">Electrical</option>
                          <option value="HVAC">HVAC</option>
                          <option value="Sewer/Drain">Sewer/Drain</option>
                          <option value="Appliance Repair">
                            Appliance Repair
                          </option>
                          <option value="Carpentry/General">
                            Carpentry/General
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                          Operational Status
                        </label>
                        <div className="flex space-x-4 mt-1">
                          <label className="flex items-center space-x-2 text-xs text-[#888888] cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="Active"
                              checked={domainStatus === "Active"}
                              onChange={() => setDomainStatus("Active")}
                              className="w-3.5 h-3.5 text-white focus:ring-0"
                            />
                            <span>Active</span>
                          </label>
                          <label className="flex items-center space-x-2 text-xs text-[#888888] cursor-pointer">
                            <input
                              type="radio"
                              name="status"
                              value="Inactive"
                              checked={domainStatus === "Inactive"}
                              onChange={() => setDomainStatus("Inactive")}
                              className="w-3.5 h-3.5 text-white focus:ring-0"
                            />
                            <span>Inactive</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#222222] flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsDomainFormOpen(false)}
                          className="px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest text-[#666666] hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                        >
                          {editingDomain ? "Save Changes" : "Create Domain"}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* TEAM MEMBERS TAB */}
          {activeSubTab === "team" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Informational banner */}
              <div className="bg-[#2D220D] border border-amber-950/40 rounded-sm p-4 flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-500 leading-relaxed">
                  <p className="font-mono font-bold uppercase tracking-widest text-[10px]">
                    Simulated Session Revocation Trigger
                  </p>
                  <p className="mt-1 text-amber-500/80">
                    Removing a team member from this panel is handled via
                    simulated triggers. Confirming deletions removes their
                    database record and immediately revokes their active login
                    session, forcing that worker/manager to log out in
                    real-time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Managers List */}
                <div className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md">
                  <div className="p-5 border-b border-[#222222] bg-[#0A0A0A]">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-white flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-2 inline-block"></span>
                      Managers ({managers.length})
                    </h3>
                    <p className="text-[10px] text-[#666666] uppercase tracking-wider mt-0.5">
                      Can view domains, assign workers to service orders.
                    </p>
                  </div>

                  {managers.length === 0 ? (
                    <div className="p-8 text-center text-[#666666] text-xs">
                      No managers in this company.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#1A1A1A]">
                      {managers.map((member) => (
                        <li
                          key={member.id}
                          className="p-5 flex items-center justify-between hover:bg-[#0D0D0D] transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-white block text-sm">
                              {member.name}
                            </span>
                            <span className="text-xs font-mono text-[#666666] block">
                              {member.email}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveMemberClick(member)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-sm border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/20 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Workers List */}
                <div className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md">
                  <div className="p-5 border-b border-[#222222] bg-[#0A0A0A]">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-white flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 inline-block"></span>
                      Workers ({workers.length})
                    </h3>
                    <p className="text-[10px] text-[#666666] uppercase tracking-wider mt-0.5">
                      Assigned to complete and log field service orders.
                    </p>
                  </div>

                  {workers.length === 0 ? (
                    <div className="p-8 text-center text-[#666666] text-xs">
                      No workers registered under this company.
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#1A1A1A]">
                      {workers.map((member) => (
                        <li
                          key={member.id}
                          className="p-5 flex items-center justify-between hover:bg-[#0D0D0D] transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-white block text-sm">
                              {member.name}
                            </span>
                            <span className="text-xs font-mono text-[#666666] block">
                              {member.email}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveMemberClick(member)}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-sm border border-red-950/40 text-red-400 hover:text-white hover:bg-red-950/20 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Typing confirmation overlay */}
              {removingMember && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111111] rounded-sm border border-[#222222] max-w-md w-full overflow-hidden p-6 space-y-4"
                  >
                    <div className="flex items-center space-x-3 text-red-400">
                      <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                      <div>
                        <h3 className="font-serif italic font-light text-base text-white">
                          Confirm Deletion & Revocation
                        </h3>
                        <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">
                          High-risk administrative removal action.
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-[#888888] leading-relaxed">
                      You are deleting{" "}
                      <strong className="text-white">
                        {removingMember.name}
                      </strong>{" "}
                      from your vendor database. This will also permanently
                      revoke their active sessions and instantly log them out.
                    </p>

                    <div className="bg-[#0D0D0D] p-3 rounded-sm border border-[#222222] text-center">
                      <p className="text-[9px] text-[#444444] uppercase tracking-widest font-mono font-bold">
                        Type the team member's exact name to confirm:
                      </p>
                      <p className="text-base font-bold font-mono text-white select-all mt-1">
                        {removingMember.name}
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={typedConfirmationName}
                        onChange={(e) => {
                          setTypedConfirmationName(e.target.value);
                          if (removeError) setRemoveError("");
                        }}
                        placeholder="Type name here..."
                        className="w-full px-4 py-2 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-red-500 text-xs font-mono placeholder-[#333333]"
                      />
                      {removeError && (
                        <p className="text-xs text-red-400 mt-1.5 font-semibold flex items-center font-mono">
                          <X className="w-3 h-3 mr-1" />
                          {removeError}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                      <button
                        onClick={() => setRemovingMember(null)}
                        className="px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest text-[#666666] hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmRemoveMember}
                        disabled={
                          typedConfirmationName.trim().toLowerCase() !==
                          removingMember.name.trim().toLowerCase()
                        }
                        className="px-4 py-2 bg-red-950 border border-red-900/50 text-red-400 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Confirm & Logout User
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* SERVICE ORDERS TAB */}
          {activeSubTab === "orders" && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
              >
                <div className="p-6 border-b border-[#222222] bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif italic font-light text-white">
                      Current Field Service Orders
                    </h2>
                    <p className="text-xs text-[#666666] mt-1">
                      Track customer requests, assign managers to build delivery
                      stages, and monitor fulfillment.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddOrderOpen(true)}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest font-mono transition-all cursor-pointer self-start sm:self-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Manual Order</span>
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center text-[#666666] text-xs font-mono">
                    No orders logged for this company.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#0D0D0D] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Title / Request</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Assigned Manager</th>
                          <th className="px-6 py-4">Assigned Tech</th>
                          <th className="px-6 py-4">Stage</th>
                          <th className="px-6 py-4">Value</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1A1A1A] text-xs">
                        {orders.map((order) => {
                          const isGated =
                            order.belowMinimumThreshold &&
                            order.thresholdApprovalStatus === "Pending";
                          return (
                            <tr
                              key={order.id}
                              className={`hover:bg-[#0D0D0D] transition-colors cursor-pointer ${
                                isGated
                                  ? "bg-[#1A1208]/20 hover:bg-[#1A1208]/40"
                                  : ""
                              }`}
                              onClick={() => setViewingOrder(order)}
                            >
                              <td className="px-6 py-4 font-mono text-xs text-[#666666]">
                                <div className="flex items-center space-x-1.5">
                                  <span>{order.id}</span>
                                  {order.belowMinimumThreshold && (
                                    <span
                                      className="w-2 h-2 rounded-full bg-amber-500"
                                      title="Below Minimum Threshold"
                                    />
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-white block">
                                  {order.title}
                                </span>
                                <span className="text-xs text-[#666666] flex items-center mt-0.5 font-mono">
                                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#444444]" />{" "}
                                  {order.address}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-[#888888]">
                                {order.customerName}
                              </td>
                              <td className="px-6 py-4">
                                {order.managerId ? (
                                  <span className="font-mono text-xs text-white bg-[#222222] border border-[#333333] px-2 py-0.5 rounded-sm">
                                    {order.managerName}
                                  </span>
                                ) : (
                                  <span className="font-mono text-xs text-[#555555] italic">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {order.workerId ? (
                                  <span className="font-mono font-bold text-emerald-400 bg-[#0D2A1D] border border-emerald-950/40 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest">
                                    {order.workerName}
                                  </span>
                                ) : (
                                  <span className="font-mono font-bold text-[#555555] bg-[#111111] border border-[#222222] px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest font-semibold ${
                                    order.stage === "Completed"
                                      ? "bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40"
                                      : order.stage === "In Progress"
                                        ? "bg-[#0D1D2D] text-blue-400 border border-blue-950/40"
                                        : order.stage === "Scheduled"
                                          ? "bg-[#1D122D] text-purple-400 border border-purple-950/40"
                                          : "bg-[#2D220D] text-amber-400 border border-amber-950/40"
                                  }`}
                                >
                                  {order.stage}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono font-semibold text-white">
                                {formatCurrency(order.value)}
                              </td>
                              <td
                                className="px-6 py-4 text-right"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => setViewingOrder(order)}
                                  className="text-[10px] uppercase font-mono tracking-wider bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-[#222222] hover:border-[#444444] text-[#888888] hover:text-white font-semibold px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* MANUAL ORDER ENTRY POPUP MODAL */}
              {isAddOrderOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111111] border border-[#222222] rounded-sm max-w-lg w-full overflow-hidden shadow-2xl"
                  >
                    <div className="p-6 bg-[#0A0A0A] border-b border-[#222222] flex justify-between items-center">
                      <h3 className="font-serif italic text-lg text-white">
                        Manual Field Order Entry
                      </h3>
                      <button
                        onClick={() => setIsAddOrderOpen(false)}
                        className="text-[#666666] hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleCreateManualOrder}
                      className="p-6 space-y-4"
                    >
                      <div>
                        <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Backflow preventer leak fix"
                          value={newOrderTitle}
                          onChange={(e) => setNewOrderTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                          Description / Notes
                        </label>
                        <textarea
                          placeholder="Enter job stage details, instructions..."
                          value={newOrderDesc}
                          onChange={(e) => setNewOrderDesc(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Customer Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Dave Miller"
                            value={newOrderCustName}
                            onChange={(e) =>
                              setNewOrderCustName(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Customer Email *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="dave@gmail.com"
                            value={newOrderCustEmail}
                            onChange={(e) =>
                              setNewOrderCustEmail(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Service Address *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="789 Pine St, Seattle, WA"
                            value={newOrderAddr}
                            onChange={(e) => setNewOrderAddr(e.target.value)}
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Order Value (
                            {preferences.currency === "INR" ? "₹" : "$"}) *
                          </label>
                          <input
                            type="number"
                            required
                            min={10}
                            value={newOrderValue}
                            onChange={(e) =>
                              setNewOrderValue(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newOrderQty}
                            onChange={(e) =>
                              setNewOrderQty(Number(e.target.value))
                            }
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1">
                            Delivery Date
                          </label>
                          <input
                            type="date"
                            value={newOrderDeliveryDate}
                            onChange={(e) =>
                              setNewOrderDeliveryDate(e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>

                      {newOrderValue < (company.minOrderValue ?? 2000) && (
                        <div className="p-3 bg-[#2D1C0F] border border-amber-950 text-amber-400 text-[10px] leading-relaxed rounded-sm font-mono flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Threshold Warning:</strong> Value (
                            {formatCurrency(newOrderValue)}) falls below company
                            minimum threshold of (
                            {formatCurrency(company.minOrderValue ?? 2000)}).
                            Order will require Owner approval.
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-[#222222] flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsAddOrderOpen(false)}
                          className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-white font-mono uppercase tracking-wider cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-white hover:bg-[#F0EAD8] text-black text-xs font-bold font-mono uppercase tracking-wider rounded-sm cursor-pointer"
                        >
                          Log Order
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* ORDER DETAIL VIEW MODAL */}
              {viewingOrder && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-[#111111] border border-[#222222] rounded-sm max-w-2xl w-full overflow-hidden shadow-2xl"
                  >
                    <div className="p-6 bg-[#0A0A0A] border-b border-[#222222] flex justify-between items-center">
                      <div>
                        <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">
                          Order ID: {viewingOrder.id}
                        </span>
                        <h3 className="font-serif italic text-lg text-white mt-1">
                          {viewingOrder.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setViewingOrder(null)}
                        className="text-[#666666] hover:text-white cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                      {/* COMPLIANCE CRITICAL VALUE THRESHOLD APPROVAL BANNER */}
                      {viewingOrder.belowMinimumThreshold && (
                        <div
                          className={`p-4 rounded-sm border ${
                            viewingOrder.thresholdApprovalStatus === "Pending"
                              ? "bg-[#2D1C0F] border-amber-950 text-amber-300"
                              : viewingOrder.thresholdApprovalStatus ===
                                  "Approved"
                                ? "bg-[#0D2214] border-emerald-950 text-emerald-300"
                                : "bg-[#2D0D0D] border-red-950 text-red-300"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <div className="text-xs font-bold font-mono uppercase tracking-wider">
                                Threshold Compliance Status:{" "}
                                {viewingOrder.thresholdApprovalStatus ||
                                  "Gated"}
                              </div>
                              <p className="text-[11px] leading-relaxed mt-1">
                                This order proposed value of{" "}
                                <strong>
                                  {formatCurrency(viewingOrder.value)}
                                </strong>{" "}
                                is below the configured threshold value of{" "}
                                <strong>
                                  {formatCurrency(
                                    company.minOrderValue ?? 2000,
                                  )}
                                </strong>
                                .
                              </p>

                              {viewingOrder.thresholdApprovalStatus ===
                              "Pending" ? (
                                <div className="mt-3 flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      handleApproveRejectThreshold(
                                        viewingOrder.id,
                                        "Approved",
                                      )
                                    }
                                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600/30 text-white rounded-sm text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    Accept Order
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleApproveRejectThreshold(
                                        viewingOrder.id,
                                        "Rejected",
                                      )
                                    }
                                    className="px-3.5 py-1.5 bg-red-950 hover:bg-red-900 border border-red-900/40 text-red-400 rounded-sm text-[10px] font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    Reject Order
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[10px] font-mono uppercase tracking-wider mt-2">
                                  ✓ Decision finalized by Owner. Status:{" "}
                                  {viewingOrder.thresholdApprovalStatus}.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Order Metadata */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#0A0A0A] p-4 rounded-sm border border-[#222222]">
                        <div>
                          <span className="text-[#666666] block text-[9px] uppercase">
                            Customer Name
                          </span>
                          <span className="text-white font-bold">
                            {viewingOrder.customerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#666666] block text-[9px] uppercase">
                            Service Location
                          </span>
                          <span className="text-white">
                            {viewingOrder.address}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[#666666] block text-[9px] uppercase">
                            Proposed Value
                          </span>
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(viewingOrder.value)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-[#666666] block text-[9px] uppercase">
                            Created At
                          </span>
                          <span className="text-[#888888]">
                            {new Date(viewingOrder.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-1">
                          Customer Notes
                        </span>
                        <p className="text-xs text-[#888888] bg-[#0A0A0A] p-3 border border-[#222222] rounded-sm whitespace-pre-wrap">
                          {viewingOrder.description ||
                            "No description provided."}
                        </p>
                      </div>

                      {/* Assignments Section */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#222222]">
                        {/* Manager Assignment */}
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1.5">
                            Assign Manager *
                          </label>
                          <select
                            value={viewingOrder.managerId || ""}
                            onChange={(e) =>
                              handleAssignManager(
                                viewingOrder.id,
                                e.target.value,
                              )
                            }
                            className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                          >
                            <option value="">Unassigned</option>
                            {managers.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-[9px] text-[#555555] mt-1 font-mono leading-tight">
                            * Manager builds execution stages, checklist
                            protocols, and assigns workers.
                          </p>
                        </div>

                        {/* Worker Assignment */}
                        <div>
                          <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-wider mb-1.5">
                            Primary Tech / Dispatch
                          </label>
                          <select
                            value={viewingOrder.workerId || ""}
                            onChange={(e) =>
                              handleAssignWorker(
                                viewingOrder.id,
                                e.target.value,
                              )
                            }
                            disabled={
                              viewingOrder.thresholdApprovalStatus ===
                              "Rejected"
                            }
                            className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <option value="">Unassigned</option>
                            {workers.map((w) => (
                              <option key={w.id} value={w.id}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                          <p className="text-[9px] text-[#555555] mt-1 font-mono leading-tight">
                            * Assign primary technician for the entire dispatch.
                          </p>
                        </div>
                      </div>

                      {/* Stage Tracking Section */}
                      <div className="pt-4 border-t border-[#222222]">
                        <span className="text-[10px] font-mono text-[#666666] uppercase tracking-wider block mb-3">
                          Delivery Stages & Verification checklist
                        </span>

                        {!viewingOrder.stages ||
                        viewingOrder.stages.length === 0 ? (
                          <div className="bg-[#0D0D0D] border border-[#222222] p-4 text-center text-[#555555] text-xs font-mono rounded-sm">
                            No delivery stages constructed yet. Assigned manager
                            will build stages.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {viewingOrder.stages.map((stg) => (
                              <div
                                key={stg.id}
                                className="p-4 bg-[#0D0D0D] border border-[#222222] rounded-sm space-y-3"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-bold text-white block">
                                      {stg.title}
                                    </span>
                                    <span className="text-[10px] text-[#666666] font-mono uppercase mt-0.5 block">
                                      Domain: {stg.domainName}
                                    </span>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest font-bold border ${
                                      stg.status === "Completed"
                                        ? "bg-[#0D2A1D] text-emerald-400 border-emerald-950/40"
                                        : stg.status === "In Progress"
                                          ? "bg-[#0D1D2D] text-blue-400 border-blue-950/40"
                                          : "bg-[#222222] text-[#888888] border-[#333333]"
                                    }`}
                                  >
                                    {stg.status}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-mono text-[#888888] border-b border-[#1A1A1A] pb-2">
                                  <span>
                                    Tech:{" "}
                                    <strong className="text-white">
                                      {stg.assignedWorkerName || "Unassigned"}
                                    </strong>
                                  </span>
                                  {stg.completedAt && (
                                    <span className="text-[9px] text-[#555555]">
                                      Closed{" "}
                                      {new Date(
                                        stg.completedAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  {stg.checklist.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-center space-x-2 text-xs"
                                    >
                                      <span
                                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center font-bold text-[9px] ${
                                          item.completed
                                            ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                                            : "border-[#333333] text-transparent"
                                        }`}
                                      >
                                        ✓
                                      </span>
                                      <span
                                        className={
                                          item.completed
                                            ? "line-through text-[#555555]"
                                            : "text-[#888888]"
                                        }
                                      >
                                        {item.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-[#0A0A0A] border-t border-[#222222] flex justify-end">
                      <button
                        onClick={() => setViewingOrder(null)}
                        className="px-5 py-2.5 bg-white hover:bg-[#F0EAD8] text-black text-xs font-bold font-mono uppercase tracking-wider rounded-sm cursor-pointer"
                      >
                        Close Portal
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
