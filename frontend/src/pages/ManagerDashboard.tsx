import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dbStore from '../services/store';
import { Domain, UserProfile, ServiceOrder } from '../types';
import { 
  Building, Users, Layers, Activity, Clock, CheckCircle, MapPin, DollarSign, Calendar, ShieldCheck, Settings,
  Bot, FileText, BarChart2, ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettingsPanel } from '../components/SettingsPanel';
import { ActivityLog } from '../components/ActivityLog';
import { KpiOverview } from '../components/KpiOverview';
import { ShortcutBadge } from '../components/ShortcutBadge';
import { NotificationCenter } from '../components/NotificationCenter';


// Subscription Gated Tabs
import { AiCopilotTab } from "../components/AiCopilotTab";
import { InvoicesTab } from "../components/InvoicesTab";
import { TrustScoreTab } from "../components/TrustScoreTab";
import { AnalyticsTab } from "../components/AnalyticsTab";

export const ManagerDashboard: React.FC = () => {
  const { user, company, preferences, pendingRequest, logout } = useAuth();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<
    | "overview"
    | "orders"
    | "domains"
    | "team"
    | "copilot"
    | "invoices"
    | "trust-score"
    | "analytics"
    | "billing"
    | "settings"
    | "activity"
  >("overview");

  // Load state
  const [domains, setDomains] = useState<Domain[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [dispatchingOrder, setDispatchingOrder] = useState<ServiceOrder | null>(
    null,
  );

  // Stage builder states
  const [editingOrderStages, setEditingOrderStages] =
    useState<ServiceOrder | null>(null);

  // Custom stage fields
  const [stageTitle, setStageTitle] = useState("");
  const [stageDomainId, setStageDomainId] = useState("");
  const [stageWorkerId, setStageWorkerId] = useState("");
  const [checklistInput, setChecklistInput] = useState("");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  // Template states
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");

  useEffect(() => {
    if (!user || !user.companyId) return;

    const loadData = () => {
      const compId = user.companyId!;
      setDomains(dbStore.getDomains(compId));
      const freshOrders = dbStore.getOrders(compId);
      setOrders(freshOrders);

      const allUsers = dbStore.getUsers();
      setTeamMembers(
        allUsers.filter((u) => u.companyId === compId && u.id !== user.id),
      );

      // Load templates private to this manager
      setTemplates(dbStore.getTemplates(user.id));

      if (editingOrderStages) {
        const freshEditing = freshOrders.find(
          (o) => o.id === editingOrderStages.id,
        );
        if (freshEditing) {
          setEditingOrderStages(freshEditing);
        }
      }
    };

    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [user, editingOrderStages]);

  // Handle power user quick navigation shortcut custom events
  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetTab = customEvent.detail;
      const validTabs = [
        "overview",
        "orders",
        "domains",
        "team",
        "copilot",
        "invoices",
        "trust-score",
        "analytics",
        "billing",
        "settings",
        "activity",
      ];
      if (validTabs.includes(targetTab)) {
        setActiveSubTab(targetTab as any);
      }
    };
    window.addEventListener("vendoros-nav", handleNav);
    return () => window.removeEventListener("vendoros-nav", handleNav);
  }, []);

  if (!user) return null;

  // Handle case where user has pending join request
  if (pendingRequest && !user.companyId && activeSubTab !== 'settings') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-4 bg-[#111111] border border-[#222222] rounded-full text-amber-500 animate-pulse">
          <Clock className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-white font-light">Join Request Pending</h2>
          <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">
            Waiting for approval from the owner of <span className="text-white font-bold">{pendingRequest.company?.companyName || 'the company'}</span>.
          </p>
          <p className="text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
            Your manager account was successfully registered. Once the company owner approves your request, you will gain access to dispatch management and coordination tools.
          </p>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => setActiveSubTab('settings')}
            className="px-5 py-2.5 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#222222] rounded-sm text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Go to Settings
          </button>
          <button
            onClick={() => logout()}
            className="px-5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/50 rounded-sm text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Handle case where user is not associated with a company yet and has no pending request
  if (!company && !pendingRequest && activeSubTab !== 'settings') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-4 bg-[#111111] border border-[#222222] rounded-full text-amber-500">
          <Building className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-white font-light">No Company Joined</h2>
          <p className="text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
            You are not currently associated with any company. Please navigate to settings to select and request to join a company.
          </p>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => setActiveSubTab('settings')}
            className="px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-black text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors rounded-sm"
          >
            Go to Settings
          </button>
          <button
            onClick={() => logout()}
            className="px-5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/50 rounded-sm text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // Direct render SettingsPanel if no company exists to avoid sidebar crashes
  if (!company && activeSubTab === 'settings') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SettingsPanel initialTab="profile" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (preferences.currency === "INR") {
      return `₹${amount}`;
    }
    return `$${amount}`;
  };

  const handleAssignWorker = (orderId: string, workerId: string) => {
    const worker = teamMembers.find((t) => t.id === workerId);
    if (worker) {
      dbStore.assignWorker(orderId, worker.id, worker.name, user.id);
    } else if (workerId === "") {
      dbStore.assignWorker(orderId, undefined, undefined, user.id);
    }
    setDispatchingOrder(null);
  };

  // Stage Builder Handlers
  const isWorkerBusy = (workerId: string) => {
    return orders.some(
      (o) =>
        o.stage !== "Completed" &&
        (o.stages || []).some(
          (s) => s.assignedWorkerId === workerId && s.status === "In Progress",
        ),
    );
  };

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderStages || !stageTitle.trim() || !stageDomainId) return;

    const dom = domains.find((d) => d.id === stageDomainId);
    const worker = teamMembers.find((w) => w.id === stageWorkerId);

    dbStore.addOrderStage(editingOrderStages.id, {
      orderId: editingOrderStages.id,
      title: stageTitle.trim(),
      domainId: stageDomainId,
      domainName: dom ? dom.name : "General",
      assignedWorkerId: worker ? worker.id : undefined,
      assignedWorkerName: worker ? worker.name : undefined,
      status: "Pending",
      checklist: checklistItems.map((text, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        text,
        completed: false,
      })),
    });

    // Reset Form
    setStageTitle("");
    setStageDomainId("");
    setStageWorkerId("");
    setChecklistItems([]);
    setChecklistInput("");
  };

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    setChecklistItems([...checklistItems, checklistInput.trim()]);
    setChecklistInput("");
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleDeleteStage = (stageId: string) => {
    if (!editingOrderStages) return;
    dbStore.deleteOrderStage(editingOrderStages.id, stageId);
  };

  const handleApplyTemplate = () => {
    if (!editingOrderStages || !selectedTemplateId) return;
    const tpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    dbStore.addOrderStage(editingOrderStages.id, {
      orderId: editingOrderStages.id,
      title: tpl.title,
      domainId: tpl.domainId || "",
      domainName: tpl.domainName || "General",
      status: "Pending",
      checklist: (tpl.checklist || []).map((txt: string, idx: number) => ({
        id: `chk-${Date.now()}-${idx}-${Math.random()}`,
        text: txt,
        completed: false,
      })),
    });

    setSelectedTemplateId("");
  };

  const handleSaveAsTemplate = () => {
    if (!editingOrderStages || !newTemplateName.trim()) return;
    const currentStages = editingOrderStages.stages || [];
    if (currentStages.length === 0) {
      alert(
        "Please add at least one stage to the order first before saving as a template.",
      );
      return;
    }

    // Save the first stage as template representation
    const firstStage = currentStages[0];
    dbStore.addTemplate({
      managerId: user.id,
      companyId: user.companyId!,
      title: newTemplateName.trim(),
      domainId: firstStage.domainId,
      domainName: firstStage.domainName,
      checklist: firstStage.checklist.map((c) => c.text),
    });

    setNewTemplateName("");
    alert("Stage template saved successfully under your private profile.");
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this private template?")) {
      dbStore.deleteTemplate(id, user.id);
    }
  };

  const handleSaveSingleStageAsTemplate = (stg: any) => {
    const tName = prompt("Enter a name for this stage template:", stg.title);
    if (!tName || !tName.trim()) return;

    dbStore.addTemplate({
      managerId: user.id,
      companyId: user.companyId!,
      title: tName.trim(),
      domainId: stg.domainId,
      domainName: stg.domainName,
      checklist: stg.checklist.map((c: any) => c.text),
    });

    alert(
      `Stage template "${tName}" saved successfully under your private profile.`,
    );
  };

  const activeDomainsCount = domains.filter(
    (d) => d.status === "Active",
  ).length;
  const workers = teamMembers.filter((t) => t.role === "Worker");

  if (pendingRequest && user && !user.companyId && activeSubTab !== 'settings') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="p-4 bg-[#111111] border border-[#222222] rounded-full text-amber-500 animate-pulse">
          <Clock className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic text-white font-light">Join Request Pending</h2>
          <p className="text-xs text-[#888888] uppercase tracking-wider font-mono">
            Waiting for approval from the owner of <span className="text-white font-bold">{pendingRequest.company?.companyName || 'the company'}</span>.
          </p>
          <p className="text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
            Your manager account was successfully registered. Once the company owner approves your request, you will gain access to dispatch management and coordination tools.
          </p>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => setActiveSubTab('settings')}
            className="px-5 py-2.5 bg-[#111111] hover:bg-[#1A1A1A] text-white border border-[#222222] rounded-sm text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Go to Settings
          </button>
          <button
            onClick={() => logout()}
            className="px-5 py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/50 rounded-sm text-xs font-mono font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

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
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-serif italic font-light text-white tracking-tight flex items-center">
                  <ShieldCheck className="w-6 h-6 mr-2 text-[#666666]" />
                  {company.name}
                </h1>
                <p className="text-[#666666] mt-0.5 text-[10px] font-mono uppercase tracking-widest">
                  Manager Dashboard
                </p>
              </div>
              <NotificationCenter />
            </div>

            <div className="flex flex-col bg-[#111111] p-1.5 border border-[#222222] rounded-sm space-y-1 shadow-md">
              {(
                [
                  "overview",
                  "orders",
                  "domains",
                  "team",
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
                      layoutId="vos-manager-sidebar-pill"
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
          {preferences.navStyle !== 'sidebar' && (
            <div className={`flex flex-col md:flex-row mb-8 pb-4 border-b border-[#222222] ${
              preferences.navAlignment === 'left' ? 'md:items-start md:flex-col space-y-4' : 'md:items-center md:justify-between'
            }`}>
              <div className="flex justify-between items-start w-full md:w-auto">
                <div>
                  <h1 className="text-3xl font-serif italic font-light text-white tracking-tight flex items-center">
                    <ShieldCheck className="w-8 h-8 mr-3 text-[#666666]" />
                    {company.name} Management Portal
                  </h1>
                  <p className="text-[#666666] mt-1 text-xs font-mono uppercase tracking-widest">
                    Operations Manager Portal • Oversight &amp; dispatch coordination panels.
                  </p>
                </div>
                <div className="md:hidden">
                  <NotificationCenter />
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="hidden md:block">
                  <NotificationCenter />
                </div>
                <div className="flex bg-[#111111] p-1.5 border border-[#222222] rounded-sm space-x-1 flex-wrap gap-y-1 shadow-md">
                  {(['overview', 'orders', 'domains', 'team', 'copilot', 'invoices', 'trust-score', 'analytics', 'billing', 'activity', 'settings'] as const).map((tab) => (
                    <motion.button
                      key={tab}
                      onClick={() => setActiveSubTab(tab)}
                      className={`relative px-3 py-1.5 text-[10px] font-bold rounded-sm uppercase tracking-widest cursor-pointer flex items-center gap-1.5 group ${
                        activeSubTab === tab
                          ? 'text-black font-extrabold'
                          : 'text-[#666666] hover:text-[#AAAAAA]'
                      }`}
                    >
                      {activeSubTab === tab && (
                        <motion.span
                          layoutId="vos-manager-topnav-pill"
                          className="absolute inset-0 -z-10 bg-white rounded-sm shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      <span>
                        {tab === 'orders' ? 'dispatch' : tab === 'activity' ? 'activity log' : tab === 'copilot' ? 'ai copilot' : tab === 'trust-score' ? 'trust score' : tab === 'billing' ? 'billing' : tab}
                      </span>
                      <ShortcutBadge tab={tab} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                    </motion.button>
                  ))}
                </div>
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

          {/* OVERVIEW */}
          {activeSubTab === "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <KpiOverview companyId={user.companyId!} currentUser={user} />

              <div className="bg-[#0D1D2D] border border-blue-950/40 rounded-sm p-6">
                <h3 className="font-serif italic font-light text-lg text-white">
                  Manager Profile Privileges
                </h3>
                <p className="text-xs text-[#888888] mt-2 leading-relaxed max-w-3xl">
                  As a Manager, you have permission to view company-wide
                  operational domains, view registered team members, and fully
                  control technician dispatches for service requests.
                  Administrative edits to domains or personnel removals are
                  reserved exclusively for the company Owner.
                </p>
              </div>
            </motion.div>
          )}

          {/* DISPATCH/ORDERS */}
          {activeSubTab === "orders" && (
            <div className="space-y-6">
              {!editingOrderStages ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
                >
                  <div className="p-6 border-b border-[#222222] bg-[#0A0A0A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-serif italic font-light text-white">
                        Dispatcher Command Panel
                      </h2>
                      <p className="text-xs text-[#666666] mt-1">
                        Select any assigned field order to build its custom
                        service execution stages and verify checklists.
                      </p>
                    </div>

                    <div className="flex bg-[#0D0D0D] p-1 border border-[#222222] rounded-sm self-start sm:self-center font-mono">
                      <button
                        onClick={
                          () =>
                            setSelectedTemplateId(
                              "",
                            ) /* Reset and just filter */
                        }
                        className="px-3 py-1 bg-[#111111] border border-[#222222] rounded-sm text-[#888888] hover:text-white text-[9px] uppercase tracking-widest font-bold"
                      >
                        Manager Hub
                      </button>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-[#666666] text-xs font-mono">
                      No active service requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#0D0D0D] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title / Request</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Assigned Manager</th>
                            <th className="px-6 py-4">Primary Tech</th>
                            <th className="px-6 py-4">Stages Count</th>
                            <th className="px-6 py-4">Stage Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A1A] text-xs">
                          {orders.map((order) => {
                            const isMine = order.managerId === user.id;
                            const stageCount = order.stages?.length || 0;
                            return (
                              <tr
                                key={order.id}
                                className={`hover:bg-[#0D0D0D] transition-colors cursor-pointer ${
                                  isMine
                                    ? "bg-[#1D1D2D]/10 hover:bg-[#1D1D2D]/20"
                                    : ""
                                }`}
                                onClick={() => setEditingOrderStages(order)}
                              >
                                <td className="px-6 py-4 font-mono text-xs text-[#666666]">
                                  {order.id}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-white block">
                                      {order.title}
                                    </span>
                                    {isMine && (
                                      <span className="text-[9px] bg-blue-950/40 text-blue-400 border border-blue-900/40 px-1.5 py-0.5 rounded-sm font-mono uppercase font-bold">
                                        Assigned to me
                                      </span>
                                    )}
                                  </div>
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
                                    <span className="font-mono text-xs text-slate-400">
                                      {order.managerName}
                                    </span>
                                  ) : (
                                    <span className="font-mono text-xs text-[#444444] italic">
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
                                    <span className="font-mono font-bold text-amber-400 bg-[#2D220D] border border-amber-950/40 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-widest">
                                      Unassigned
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-[#888888] font-mono font-semibold">
                                  {stageCount} stages
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest font-semibold ${
                                      order.stage === "Completed"
                                        ? "bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40"
                                        : order.stage === "In Progress"
                                          ? "bg-[#0D1D2D] text-blue-400 border border-blue-950/40"
                                          : "bg-[#2D220D] text-amber-400 border border-amber-950/40"
                                    }`}
                                  >
                                    {order.stage}
                                  </span>
                                </td>
                                <td
                                  className="px-6 py-4 text-right"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => setEditingOrderStages(order)}
                                    className="text-[10px] uppercase font-mono tracking-wider bg-white hover:bg-[#F0EAD8] text-black font-semibold px-2.5 py-1.5 rounded-sm transition-colors cursor-pointer"
                                  >
                                    Manage Stages
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
              ) : (
                /* DETAILED STAGE BUILDER VIEW */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Stage builder header */}
                  <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <button
                        onClick={() => setEditingOrderStages(null)}
                        className="text-xs text-[#888888] hover:text-white font-mono uppercase tracking-widest mb-2 block flex items-center gap-1 cursor-pointer"
                      >
                        ← Back to Dispatch list
                      </button>
                      <h2 className="text-xl font-serif italic text-white font-light">
                        Stage Builder & Checklist Protocol
                      </h2>
                      <p className="text-xs text-[#666666] mt-1 font-mono">
                        Active Order:{" "}
                        <strong className="text-slate-300">
                          {editingOrderStages.title}
                        </strong>{" "}
                        • ID: {editingOrderStages.id}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="font-mono text-xs bg-[#222222] text-slate-300 px-3 py-1.5 rounded-sm border border-[#333333]">
                        Customer: {editingOrderStages.customerName}
                      </span>
                      <span className="font-mono text-xs bg-[#0D2A1D] text-emerald-400 px-3 py-1.5 rounded-sm border border-emerald-950/40">
                        Proposed Value:{" "}
                        {formatCurrency(editingOrderStages.value)}
                      </span>
                    </div>
                  </div>

                  {/* TEMPLATE MANAGER SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#111111] border border-[#222222] p-6 rounded-sm">
                    {/* Apply Preset Template */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Apply Saved Stage Template
                      </h4>
                      <p className="text-[11px] text-[#666666] leading-relaxed">
                        Instantly populate the service lifecycle stages using
                        one of your custom templates.
                      </p>

                      <div className="flex gap-2">
                        <select
                          value={selectedTemplateId}
                          onChange={(e) =>
                            setSelectedTemplateId(e.target.value)
                          }
                          className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                        >
                          <option value="">-- Select custom template --</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} ({t.domainName}) -{" "}
                              {t.checklist?.length || 0} items
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleApplyTemplate}
                          disabled={!selectedTemplateId}
                          className="px-4 py-2 bg-white hover:bg-[#F0EAD8] text-black text-[10px] font-bold font-mono uppercase tracking-widest rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          Apply
                        </button>
                      </div>

                      {templates.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[9px] font-mono text-[#444444] uppercase tracking-wider block mb-1">
                            Your saved protocols:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {templates.map((t) => (
                              <div
                                key={t.id}
                                className="flex items-center space-x-1 bg-[#1A1A1A] border border-[#222222] px-2 py-0.5 rounded-sm text-[10px] font-mono text-[#888888]"
                              >
                                <span className="truncate max-w-[120px]">
                                  {t.title}
                                </span>
                                <button
                                  onClick={() => handleDeleteTemplate(t.id)}
                                  className="text-red-500 hover:text-red-400 font-bold ml-1"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Save Current Layout as Template */}
                    <div className="space-y-3 border-t md:border-t-0 md:border-l border-[#222222] pt-4 md:pt-0 md:pl-6">
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Save Current Layout as Template
                      </h4>
                      <p className="text-[11px] text-[#666666] leading-relaxed">
                        Export this customized list of service stages and
                        checklist items so you can reuse them on future orders.
                      </p>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Standard Plumbing Leak Repair"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs font-mono rounded-sm focus:outline-none focus:border-white"
                        />
                        <button
                          onClick={handleSaveAsTemplate}
                          disabled={
                            !newTemplateName.trim() ||
                            !editingOrderStages.stages?.length
                          }
                          className="px-4 py-2 bg-[#222222] hover:bg-[#333333] text-white border border-[#444444] text-[10px] font-bold font-mono uppercase tracking-widest rounded-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Stage Manual Builder Form */}
                    <div className="lg:col-span-5 bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4 h-fit">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest flex items-center justify-between">
                        <span>Add Service Stage Manual</span>
                        <span className="text-[9px] text-[#666666] normal-case">
                          Step-by-step dispatch configuration
                        </span>
                      </h3>

                      <form
                        onSubmit={handleAddStage}
                        className="space-y-4 text-xs font-mono"
                      >
                        <div>
                          <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                            Stage Action/Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Shut off main supply and inspect joints"
                            value={stageTitle}
                            onChange={(e) => setStageTitle(e.target.value)}
                            className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                            Operational Domain *
                          </label>
                          <select
                            required
                            value={stageDomainId}
                            onChange={(e) => setStageDomainId(e.target.value)}
                            className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                          >
                            <option value="">
                              -- Choose operational domain --
                            </option>
                            {domains.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.type})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[#666666] uppercase text-[9px] tracking-wider mb-1">
                            Assign Technician (With Free/Busy Checks) *
                          </label>
                          <select
                            value={stageWorkerId}
                            onChange={(e) => setStageWorkerId(e.target.value)}
                            className="w-full p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                          >
                            <option value="">
                              -- Assign Stage Tech (Optional) --
                            </option>
                            {workers.map((w) => {
                              const busy = isWorkerBusy(w.id);
                              return (
                                <option key={w.id} value={w.id}>
                                  {w.name}{" "}
                                  {busy
                                    ? "(🔴 BUSY - Active Stage)"
                                    : "(🟢 FREE)"}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Checklist items list */}
                        <div className="pt-2 border-t border-[#222222] space-y-2">
                          <label className="block text-[#666666] uppercase text-[9px] tracking-wider">
                            Protocol Verification Checklist
                          </label>
                          <p className="text-[10px] text-[#555555] leading-normal mb-2">
                            Add compliance items the technician must
                            verify/complete before submitting.
                          </p>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Verify pressure is under 50 PSI"
                              value={checklistInput}
                              onChange={(e) =>
                                setChecklistInput(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddChecklistItem();
                                }
                              }}
                              className="flex-grow p-2 bg-[#0D0D0D] border border-[#222222] text-white text-xs rounded-sm focus:outline-none focus:border-white"
                            />
                            <button
                              type="button"
                              onClick={handleAddChecklistItem}
                              className="px-3 bg-[#222222] hover:bg-[#333333] border border-[#444444] text-white text-xs font-bold rounded-sm cursor-pointer"
                            >
                              Add
                            </button>
                          </div>

                          {checklistItems.length > 0 && (
                            <div className="space-y-1.5 pt-2 max-h-[150px] overflow-y-auto">
                              {checklistItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between bg-[#0A0A0A] p-2 border border-[#222222] rounded-sm text-xs"
                                >
                                  <span className="text-slate-400 truncate max-w-[200px]">
                                    {idx + 1}. {item}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveChecklistItem(idx)
                                    }
                                    className="text-red-500 hover:text-red-400 font-bold ml-2 font-mono"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-[#222222]">
                          <button
                            type="submit"
                            className="w-full py-2.5 bg-white hover:bg-[#F0EAD8] text-black text-xs font-bold font-mono uppercase tracking-widest rounded-sm cursor-pointer transition-colors"
                          >
                            Add Stage to Order
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right Column: Active Stages & Verification logs */}
                    <div className="lg:col-span-7 bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-4">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                        Configured Service Delivery Stages (
                        {editingOrderStages.stages?.length || 0})
                      </h3>

                      {!editingOrderStages.stages ||
                      editingOrderStages.stages.length === 0 ? (
                        <div className="p-12 text-center text-[#555555] text-xs font-mono border border-dashed border-[#222222] rounded-sm">
                          No service execution stages have been defined for this
                          field order yet. Use the manual form or select a saved
                          template above.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {editingOrderStages.stages.map((stg, sIdx) => (
                            <div
                              key={stg.id}
                              className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-sm space-y-3 relative group"
                            >
                              <div className="absolute top-4 right-4 flex items-center gap-3">
                                <button
                                  onClick={() =>
                                    handleSaveSingleStageAsTemplate(stg)
                                  }
                                  className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono transition-colors uppercase tracking-widest cursor-pointer"
                                  title="Save this specific stage as a template preset"
                                >
                                  💾 Save as Preset
                                </button>
                                <button
                                  onClick={() => handleDeleteStage(stg.id)}
                                  className="text-[#444444] hover:text-red-500 transition-colors font-mono font-bold text-xs cursor-pointer"
                                  title="Remove Stage"
                                >
                                  &times; Delete Stage
                                </button>
                              </div>

                              <div>
                                <span className="text-[9px] font-mono text-blue-400 bg-[#0D1D2D] border border-blue-950/40 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                                  Stage {sIdx + 1} • {stg.domainName}
                                </span>
                                <h4 className="text-sm font-semibold text-white mt-1.5 pr-20">
                                  {stg.title}
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-xs font-mono py-2 border-y border-[#1A1A1A] text-[#888888]">
                                <div>
                                  <span className="text-[9px] text-[#444444] uppercase block mb-1">
                                    Assigned Specialist
                                  </span>
                                  {stg.status === "Completed" ? (
                                    <span className="text-white font-bold">
                                      {stg.assignedWorkerName || "Unassigned"}
                                    </span>
                                  ) : (
                                    <select
                                      value={stg.assignedWorkerId || ""}
                                      onChange={(e) => {
                                        const wId = e.target.value;
                                        dbStore.updateOrderStageDetails(
                                          editingOrderStages.id,
                                          stg.id,
                                          {
                                            assignedWorkerId: wId || undefined,
                                            assignedWorkerName: wId
                                              ? teamMembers.find(
                                                  (t) => t.id === wId,
                                                )?.name || "Unassigned"
                                              : undefined,
                                          },
                                        );
                                      }}
                                      className="bg-black border border-[#222222] text-[11px] text-white rounded-sm p-1 mt-0.5 focus:outline-none focus:border-white font-mono w-full max-w-[180px]"
                                    >
                                      <option value="">-- Unassigned --</option>
                                      {workers.map((w) => {
                                        const busy = isWorkerBusy(w.id);
                                        return (
                                          <option key={w.id} value={w.id}>
                                            {w.name}{" "}
                                            {busy ? "(🔴 BUSY)" : "(🟢 FREE)"}
                                          </option>
                                        );
                                      })}
                                    </select>
                                  )}
                                </div>
                                <div>
                                  <span className="text-[9px] text-[#444444] uppercase block">
                                    Stage Progress
                                  </span>
                                  <span
                                    className={`font-semibold inline-block mt-2 ${
                                      stg.status === "Completed"
                                        ? "text-emerald-400"
                                        : stg.status === "In Progress"
                                          ? "text-blue-400"
                                          : "text-amber-500"
                                    }`}
                                  >
                                    {stg.status}
                                  </span>
                                </div>
                              </div>

                              {/* Checklist Verification items */}
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-mono text-[#555555] uppercase tracking-wider block">
                                  Compliance Checklist:
                                </span>
                                {!stg.checklist ||
                                stg.checklist.length === 0 ? (
                                  <span className="text-[10px] text-[#444444] italic font-mono">
                                    No checklist protocols assigned.
                                  </span>
                                ) : (
                                  <div className="space-y-1">
                                    {stg.checklist.map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center space-x-2 text-xs font-mono"
                                      >
                                        <span
                                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center font-bold text-[9px] ${
                                            item.completed
                                              ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                                              : "border-[#222222] text-transparent"
                                          }`}
                                        >
                                          ✓
                                        </span>
                                        <span
                                          className={
                                            item.completed
                                              ? "line-through text-[#444444]"
                                              : "text-[#888888]"
                                          }
                                        >
                                          {item.text}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* DOMAINS (READ ONLY) */}
          {activeSubTab === "domains" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
            >
              <div className="p-6 border-b border-[#222222] bg-[#0A0A0A]">
                <h2 className="text-lg font-serif italic font-light text-white">
                  Active Company Domains
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Read-only index of authorized company operational scopes
                  (Managed only by Owner).
                </p>
              </div>

              {domains.length === 0 ? (
                <div className="p-12 text-center text-[#666666] text-xs">
                  No domains defined.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0D0D0D] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                        <th className="px-6 py-4">Domain Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Registration Date</th>
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
                              {domain.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#666666] font-mono">
                            {new Date(domain.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* TEAM MEMBERS */}
          {activeSubTab === "team" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
            >
              <div className="p-6 border-b border-[#222222] bg-[#0A0A0A]">
                <h2 className="text-lg font-serif italic font-light text-white">
                  Authorized Team Roster
                </h2>
                <p className="text-xs text-[#666666] mt-1">
                  Read-only personnel list. Removal and edit privileges belong
                  exclusively to company Owners.
                </p>
              </div>

              {teamMembers.length === 0 ? (
                <div className="p-8 text-center text-[#666666] text-xs">
                  No other team members registered yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#0D0D0D] text-[#666666] font-mono text-[9px] uppercase tracking-widest border-b border-[#222222]">
                        <th className="px-6 py-4">Full Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Assigned Role</th>
                        <th className="px-6 py-4">Registered On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A1A1A] text-xs">
                      {teamMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="hover:bg-[#0D0D0D] transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-white">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 font-mono text-[#666666]">
                            {member.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-[#1A1A1A] text-[#888888] px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest border border-[#222222]">
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#666666]">
                            {new Date(member.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
