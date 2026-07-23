import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../context/AdminContext';
import adminApi from '../services/adminApi';
import dbStore from '../services/store';
import {
  ShieldCheck, LogOut, Building, Users, Activity, FileText, AlertTriangle,
  RefreshCw, Search, Filter, Shield, Zap, Trash2, Sliders, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const { admin, logout } = useSuperAdmin();
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'users' | 'audit'>('overview');

  // Data states
  const [stats, setStats] = useState<any | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Search & Filter states
  const [companySearch, setCompanySearch] = useState('');
  const [companyStatusFilter, setCompanyStatusFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Modals
  const [overrideModalCompany, setOverrideModalCompany] = useState<any | null>(null);
  const [selectedTier, setSelectedTier] = useState<'free' | 'growth' | 'scale'>('growth');
  const [deleteModalCompany, setDeleteModalCompany] = useState<any | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Load all admin data
  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [sRes, cRes, uRes, aRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getCompanies(),
        adminApi.getUsers(),
        adminApi.getAuditLogs(),
      ]);

      if (sRes.success) setStats(sRes.stats);
      if (cRes.success) setCompanies(cRes.companies);
      if (uRes.success) setUsers(uRes.users);
      if (aRes.success) setAuditLogs(aRes.logs);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Handle Manual Subscription Override
  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalCompany) return;
    setIsSubmittingAction(true);
    setActionError('');
    try {
      await adminApi.updateSubscriptionOverride(overrideModalCompany._id, selectedTier);
      setOverrideModalCompany(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update subscription override');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Handle Clear Override
  const handleClearOverride = async (companyId: string) => {
    try {
      await adminApi.clearSubscriptionOverride(companyId);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Failed to clear override');
    }
  };

  // Handle Toggle Suspension
  const handleToggleSuspension = async (companyId: string) => {
    try {
      await adminApi.toggleSuspension(companyId);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle company suspension');
    }
  };

  // Handle Delete Company
  const handleDeleteCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteModalCompany) return;
    setIsSubmittingAction(true);
    setActionError('');
    try {
      await adminApi.deleteCompany(deleteModalCompany._id, confirmDeleteName);
      setDeleteModalCompany(null);
      setConfirmDeleteName('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      setActionError(err.message || 'Failed to delete company');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filtered lists
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.companyName.toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.owner?.name && c.owner.name.toLowerCase().includes(companySearch.toLowerCase())) ||
      (c.owner?.email && c.owner.email.toLowerCase().includes(companySearch.toLowerCase()));
    const matchesStatus = companyStatusFilter === 'all' || c.status === companyStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.company?.companyName && u.company.companyName.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] font-mono select-none flex flex-col">
      {/* Top Security Operations Bar */}
      <header className="bg-[#18181B] border-b border-[#27272A] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wider text-white uppercase font-display">VendorOS Super Admin</h1>
              <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-300 bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                Core Console Surface
              </span>
            </div>
            <p className="text-[10px] text-[#A1A1AA] font-mono">
              Authenticated as: <strong className="text-white">{admin?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#09090B] hover:bg-zinc-800 border border-[#27272A] text-[#FAFAFA] rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#121215] border-b border-[#27272A] px-6">
        <div className="flex space-x-2 py-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Platform Overview', icon: Activity },
            { id: 'companies', label: `Companies (${companies.length})`, icon: Building },
            { id: 'users', label: `User Directory (${users.length})`, icon: Users },
            { id: 'audit', label: `Immutable Audit Logs (${auditLogs.length})`, icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FAFAFA] text-[#09090B] shadow-md'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest block font-bold">Total Tenants</span>
                <span className="text-3xl font-bold text-[#FAFAFA] mt-1 block font-display">{stats?.totalCompanies ?? 0}</span>
                <span className="text-[10px] text-[#71717A] mt-2 block font-mono">Multi-tenant registered companies</span>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest block font-bold">Status Ratio</span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-2xl font-bold text-emerald-400">{stats?.activeCompanies ?? 0} <span className="text-[10px] text-emerald-500 uppercase font-mono">Active</span></span>
                  <span className="text-2xl font-bold text-zinc-400">{stats?.suspendedCompanies ?? 0} <span className="text-[10px] text-zinc-500 uppercase font-mono">Suspended</span></span>
                </div>
                <span className="text-[10px] text-[#71717A] mt-2 block font-mono">Access isolation status</span>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest block font-bold">Tier Distribution</span>
                <div className="flex items-center space-x-2 mt-2 text-xs font-bold font-mono">
                  <span className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded">Free: {stats?.tierBreakdown?.free ?? 0}</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded">Growth: {stats?.tierBreakdown?.growth ?? 0}</span>
                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded">Scale: {stats?.tierBreakdown?.scale ?? 0}</span>
                </div>
                <span className="text-[10px] text-[#71717A] mt-2 block font-mono">
                  Manual Overrides: <strong className="text-amber-400">{stats?.manualOverrideCount ?? 0}</strong>
                </span>
              </div>

              <div className="bg-[#18181B] border border-[#27272A] p-5 rounded-xl">
                <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest block font-bold">Global Directory Users</span>
                <span className="text-3xl font-bold text-[#FAFAFA] mt-1 block font-display">{stats?.users?.total ?? 0}</span>
                <span className="text-[10px] text-[#71717A] mt-2 block font-mono">
                  Owners ({stats?.users?.owners ?? 0}) • Managers ({stats?.users?.managers ?? 0}) • Techs ({stats?.users?.workers ?? 0})
                </span>
              </div>
            </div>

            {/* Quick Action Info Box */}
            <div className="bg-[#18181B] border border-[#27272A] p-6 rounded-xl space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
                <Shield className="w-4 h-4 mr-2 text-[#FAFAFA]" />
                Super Admin Security & System Governance Policy
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed font-mono">
                Manual subscription changes override Razorpay billing state. A manual override blocks Razorpay webhooks from altering effective company tier until cleared.
                Company suspensions instantly revoke authorization tokens for all users belonging to that company across the entire platform.
              </p>
            </div>
          </motion.div>
        )}

        {/* COMPANIES MANAGEMENT TAB */}
        {activeTab === 'companies' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search company or owner..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#09090B] border border-[#27272A] text-white placeholder-[#52525B] text-xs rounded-lg focus:outline-none focus:border-[#A1A1AA]"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-[#71717A]" />
                <select
                  value={companyStatusFilter}
                  onChange={(e) => setCompanyStatusFilter(e.target.value)}
                  className="bg-[#09090B] border border-[#27272A] text-white text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-[#A1A1AA] font-mono"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Companies Table */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#121215] text-[#A1A1AA] text-[10px] uppercase tracking-widest border-b border-[#27272A]">
                      <th className="px-6 py-3.5">Company Name</th>
                      <th className="px-6 py-3.5">Owner Details</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Subscription Tier</th>
                      <th className="px-6 py-3.5">Override State</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {filteredCompanies.map(c => {
                      const isSuspended = c.status === 'suspended';
                      const isOverride = c.subscription?.manualOverride?.active;
                      return (
                        <tr key={c._id} className="hover:bg-[#27272A]/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-[#FAFAFA]">
                            <span>{c.companyName}</span>
                            <span className="block text-[9px] text-[#71717A] mt-0.5">ID: {c._id}</span>
                          </td>
                          <td className="px-6 py-4 text-[#A1A1AA]">
                            {c.owner ? (
                              <div>
                                <span className="font-bold text-[#FAFAFA] block">{c.owner.name}</span>
                                <span className="text-[10px] text-[#71717A] block">{c.owner.email}</span>
                              </div>
                            ) : (
                              <span className="text-zinc-600 italic">No Owner</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              isSuspended
                                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold uppercase">
                            <span className={`px-2.5 py-1 rounded text-[10px] border ${
                              c.subscription?.tier === 'scale'
                                ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                : c.subscription?.tier === 'growth'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}>
                              {c.subscription?.tier || 'free'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isOverride ? (
                              <div className="flex flex-col items-start space-y-1">
                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-bold uppercase tracking-wider rounded">
                                  MANUAL OVERRIDE
                                </span>
                                <button
                                  onClick={() => handleClearOverride(c._id)}
                                  className="text-[9px] text-[#A1A1AA] hover:text-white underline cursor-pointer"
                                >
                                  Clear Override
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-[#71717A] uppercase">Webhook Driven</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setOverrideModalCompany(c);
                                setSelectedTier(c.subscription?.tier || 'growth');
                              }}
                              className="px-3 py-1 bg-white hover:bg-zinc-200 text-[#09090B] text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm"
                            >
                              Edit Tier
                            </button>
                            <button
                              onClick={() => handleToggleSuspension(c._id)}
                              className={`px-3 py-1 border text-[10px] uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                                  : 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300'
                              }`}
                            >
                              {isSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModalCompany(c);
                                setConfirmDeleteName('');
                              }}
                              className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* USERS DIRECTORY TAB */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#09090B] border border-[#27272A] text-white placeholder-[#52525B] text-xs rounded-lg focus:outline-none focus:border-[#A1A1AA]"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#09090B] border border-[#27272A] text-white text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-[#A1A1AA] font-mono"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="manager">Managers</option>
                <option value="worker">Technicians / Workers</option>
                <option value="customer">Customers</option>
              </select>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#121215] text-[#A1A1AA] text-[10px] uppercase tracking-widest border-b border-[#27272A]">
                      <th className="px-6 py-3.5">User Name & Email</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Associated Company</th>
                      <th className="px-6 py-3.5">Phone</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {filteredUsers.map(u => {
                      const isLocked = u.failedAttempts >= 5 || u.accountStatus === 'disabled' || (u.lockoutUntil && new Date(u.lockoutUntil) > new Date());
                      return (
                        <tr key={u._id} className="hover:bg-[#27272A]/40 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-bold text-[#FAFAFA] block">{u.name}</span>
                            <span className="text-[10px] text-[#71717A] block">{u.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider rounded">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#A1A1AA]">
                            {u.company ? (
                              <span className="font-bold text-white">{u.company.companyName}</span>
                            ) : (
                              <span className="text-zinc-600 italic">No Company</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#71717A] font-mono">{u.phone || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                              isLocked
                                ? 'bg-red-950/40 text-red-400 border-red-800/40'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {isLocked ? 'DISABLED (LOCKOUT)' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Re-enable and unlock account access for ${u.name}?`)) {
                                  dbStore.clearUserLockout(u._id || u.id || u.email);
                                  setRefreshTrigger(prev => prev + 1);
                                  alert(`Account for ${u.name} has been unlocked and re-enabled successfully.`);
                                }
                              }}
                              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm"
                            >
                              Unlock / Re-Enable
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* IMMUTABLE AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-xl flex items-center space-x-3 text-xs text-[#A1A1AA]">
              <Shield className="w-5 h-5 text-[#FAFAFA] flex-shrink-0" />
              <p className="text-[11px] font-mono leading-relaxed">
                <strong>Immutable Audit Log Trail</strong>: Every single admin action is permanently recorded. These logs cannot be edited or deleted by any API route or portal control.
              </p>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#121215] text-[#A1A1AA] text-[10px] uppercase tracking-widest border-b border-[#27272A]">
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Action Executed</th>
                      <th className="px-6 py-3.5">Target</th>
                      <th className="px-6 py-3.5">IP Address</th>
                      <th className="px-6 py-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {auditLogs.map(log => (
                      <tr key={log._id} className="hover:bg-[#27272A]/40 transition-colors">
                        <td className="px-6 py-4 text-[10px] text-[#71717A] font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider border ${
                            log.action.includes('SUCCESS') || log.action.includes('UNSUSPEND')
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : log.action.includes('FAILED') || log.action.includes('LOCKOUT') || log.action.includes('DELETE') || log.action.includes('SUSPEND')
                              ? 'bg-red-950/40 text-red-300 border-red-800/40'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#FAFAFA]">
                          {log.targetName || log.targetId || 'System'}
                        </td>
                        <td className="px-6 py-4 text-[#71717A] font-mono text-[11px]">{log.ipAddress}</td>
                        <td className="px-6 py-4 text-[10px] text-[#A1A1AA] font-mono">
                          <pre className="whitespace-pre-wrap max-w-xs overflow-hidden">
                            {JSON.stringify(log.details || {})}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* MANUAL SUBSCRIPTION OVERRIDE MODAL */}
      <AnimatePresence>
        {overrideModalCompany && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#18181B] border border-[#27272A] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAFAFA] flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-amber-400" />
                Manual Subscription Override
              </h3>
              <p className="text-xs text-[#A1A1AA] font-mono">
                Target: <strong className="text-white">{overrideModalCompany.companyName}</strong>
              </p>

              {actionError && (
                <div className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800/40">{actionError}</div>
              )}

              <form onSubmit={handleApplyOverride} className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1.5 font-bold">Select Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    className="w-full bg-[#09090B] border border-[#27272A] text-white text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#A1A1AA]"
                  >
                    <option value="free">Free Tier</option>
                    <option value="growth">Growth Tier</option>
                    <option value="scale">Scale Tier</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-[#27272A] flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setOverrideModalCompany(null)}
                    className="px-4 py-2 bg-transparent hover:bg-zinc-800 text-[#A1A1AA] text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-[#09090B] text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {isSubmittingAction ? 'Applying...' : 'Apply Manual Override'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PERMANENT DELETE COMPANY MODAL */}
      <AnimatePresence>
        {deleteModalCompany && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#18181B] border border-[#27272A] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center">
                <Trash2 className="w-4 h-4 mr-2 text-red-400" />
                Permanent Company Deletion
              </h3>
              <p className="text-xs text-[#A1A1AA] font-mono leading-relaxed">
                Warning: This action is permanent and irreversible. This will delete <strong className="text-white">{deleteModalCompany.companyName}</strong> and all associated user records.
              </p>

              {actionError && (
                <div className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-800/40">{actionError}</div>
              )}

              <form onSubmit={handleDeleteCompany} className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1 font-bold">
                    Type exact company name to confirm: <span className="text-white underline">{deleteModalCompany.companyName}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmDeleteName}
                    onChange={(e) => setConfirmDeleteName(e.target.value)}
                    placeholder={deleteModalCompany.companyName}
                    className="w-full bg-[#09090B] border border-[#27272A] text-white text-xs p-2.5 rounded-lg focus:outline-none focus:border-[#A1A1AA]"
                  />
                </div>

                <div className="pt-4 border-t border-[#27272A] flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalCompany(null)}
                    className="px-4 py-2 bg-transparent hover:bg-zinc-800 text-[#A1A1AA] text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || confirmDeleteName.trim().toLowerCase() !== deleteModalCompany.companyName.trim().toLowerCase()}
                    className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800/60 text-red-200 text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isSubmittingAction ? 'Deleting...' : 'Confirm Permanent Delete'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
