import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
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
import { StageBuilderModal } from '../components/StageBuilderModal';
import { OrderTable } from '../components/OrderTable';

// Subscription Gated Tabs
import { AiCopilotTab } from "../components/AiCopilotTab";
import { InvoicesTab } from "../components/InvoicesTab";
import { TrustScoreTab } from "../components/TrustScoreTab";
import { AnalyticsTab } from "../components/AnalyticsTab";

export const ManagerDashboard: React.FC = () => {
  const { user, company, preferences, pendingRequest, logout } = useAuth();
  const { t } = useTranslation();
  
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
  const [editingOrderStages, setEditingOrderStages] = useState<ServiceOrder | null>(null);

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

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'overview': return t('overview', 'OVERVIEW');
      case 'domains': return t('domains', 'DOMAINS');
      case 'team': return t('team', 'TEAM MEMBERS');
      case 'orders': return t('dispatch', 'DISPATCH');
      case 'copilot': return t('aiCopilot', 'AI COPILOT');
      case 'invoices': return t('invoices', 'INVOICES');
      case 'trust-score': return t('trustScore', 'TRUST SCORE');
      case 'analytics': return t('analytics', 'ANALYTICS');
      case 'billing': return t('pricingBilling', 'PRICING & BILLING');
      case 'activity': return t('activityLog', 'ACTIVITY LOG');
      case 'settings': return t('settings', 'SETTINGS');
      default: return tab.toUpperCase();
    }
  };

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
                  {t('managerDashboard', 'Manager Dashboard')}
                </p>
              </div>
              <NotificationCenter />
            </div>

            <div className="flex flex-col bg-[#111111] p-1 border border-[#222222] rounded-sm space-y-1">
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
                  className={`relative w-full text-left px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest transition-colors duration-150 cursor-pointer flex items-center justify-between group z-10 ${
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
                    {getTabLabel(tab)}
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
                        {getTabLabel(tab)}
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
          )}          {/* DISPATCH/ORDERS */}
          {activeSubTab === "orders" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] rounded-sm border border-[#222222] p-6 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#222222] pb-4">
                <div>
                  <h2 className="text-lg font-serif italic font-light text-white">
                    Dispatcher Command Panel
                  </h2>
                  <p className="text-xs text-[#666666] mt-1 font-mono">
                    Select any assigned field order to build its service execution stages and verify checklists.
                  </p>
                </div>
              </div>

              <OrderTable
                orders={orders}
                onEditStages={(ord) => setEditingOrderStages(ord)}
                currency={preferences.currency}
                showStageAction
              />

              {editingOrderStages && (
                <StageBuilderModal
                  order={editingOrderStages}
                  onClose={() => setEditingOrderStages(null)}
                  domains={domains}
                  teamMembers={teamMembers}
                  userId={user.id}
                  companyId={user.companyId!}
                  allOrders={orders}
                />
              )}
            </motion.div>
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
