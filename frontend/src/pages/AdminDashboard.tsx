import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../context/AdminContext';
import adminApi from '../services/adminApi';
import {
  ShieldAlert, LogOut, Building, Users, Activity, FileText, AlertTriangle,
  RefreshCw, CheckCircle, XCircle, Search, Filter, Shield, Zap, Trash2, Sliders, Lock
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
    <div className="min-h-screen bg-[#080606] text-red-100 font-mono select-none flex flex-col">
      {/* Top Security Operations Bar */}
      <header className="bg-[#100B0B] border-b border-red-950/60 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-sm bg-red-950/80 border border-red-800/40 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-wider text-white uppercase">VendorOS Super Admin</h1>
              <span className="text-[9px] uppercase font-bold tracking-widest text-red-400 bg-red-950/60 border border-red-900/40 px-2 py-0.5 rounded-sm">
                Restricted Core Surface
              </span>
            </div>
            <p className="text-[10px] text-red-400/60 font-mono">
              Authenticated as: <strong className="text-red-300">{admin?.email}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#170E0E] hover:bg-[#221313] border border-red-950 text-red-300 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800/50 text-red-200 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="bg-[#0A0707] border-b border-red-950/40 px-6">
        <div className="flex space-x-1 overflow-x-auto no-scrollbar">
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
                className={`flex items-center space-x-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-red-600 text-white bg-red-950/30'
                    : 'border-transparent text-red-400/60 hover:text-red-300 hover:bg-red-950/10'
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
              <div className="bg-[#100B0B] border border-red-950/60 p-5 rounded-sm">
                <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Total Tenants</span>
                <span className="text-3xl font-bold text-white mt-1 block">{stats?.totalCompanies ?? 0}</span>
                <span className="text-[10px] text-red-400/60 mt-2 block font-mono">Multi-tenant registered companies</span>
              </div>

              <div className="bg-[#100B0B] border border-red-950/60 p-5 rounded-sm">
                <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Status Ratio</span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-2xl font-bold text-emerald-400">{stats?.activeCompanies ?? 0} <span className="text-[10px] text-emerald-600 uppercase font-mono">Active</span></span>
                  <span className="text-2xl font-bold text-red-500">{stats?.suspendedCompanies ?? 0} <span className="text-[10px] text-red-700 uppercase font-mono">Suspended</span></span>
                </div>
                <span className="text-[10px] text-red-400/60 mt-2 block font-mono">Access isolation status</span>
              </div>

              <div className="bg-[#100B0B] border border-red-950/60 p-5 rounded-sm">
                <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Tier Distribution</span>
                <div className="flex items-center space-x-2 mt-2 text-xs font-bold font-mono">
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-sm">Free: {stats?.tierBreakdown?.free ?? 0}</span>
                  <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-800 text-amber-300 rounded-sm">Growth: {stats?.tierBreakdown?.growth ?? 0}</span>
                  <span className="px-2 py-0.5 bg-purple-950/80 border border-purple-800 text-purple-300 rounded-sm">Scale: {stats?.tierBreakdown?.scale ?? 0}</span>
                </div>
                <span className="text-[10px] text-red-400/60 mt-2 block font-mono">
                  Manual Overrides: <strong className="text-amber-400">{stats?.manualOverrideCount ?? 0}</strong>
                </span>
              </div>

              <div className="bg-[#100B0B] border border-red-950/60 p-5 rounded-sm">
                <span className="text-[10px] text-red-500 uppercase tracking-widest block font-bold">Global Directory Users</span>
                <span className="text-3xl font-bold text-white mt-1 block">{stats?.users?.total ?? 0}</span>
                <span className="text-[10px] text-red-400/60 mt-2 block font-mono">
                  Owners ({stats?.users?.owners ?? 0}) • Managers ({stats?.users?.managers ?? 0}) • Techs ({stats?.users?.workers ?? 0})
                </span>
              </div>
            </div>

            {/* Quick Action Info Box */}
            <div className="bg-[#140D0D] border border-red-900/50 p-6 rounded-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-400 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-500" />
                Super Admin Security & System Governance Policy
              </h3>
              <p className="text-xs text-red-300/80 leading-relaxed font-mono">
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
            <div className="bg-[#100B0B] border border-red-950/60 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-red-500/60 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search company or owner..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0A0707] border border-red-950 text-white placeholder-red-950 text-xs rounded-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-red-500/60" />
                <select
                  value={companyStatusFilter}
                  onChange={(e) => setCompanyStatusFilter(e.target.value)}
                  className="bg-[#0A0707] border border-red-950 text-red-200 text-xs py-1.5 px-3 rounded-sm focus:outline-none focus:border-red-600 font-mono"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Companies Table */}
            <div className="bg-[#100B0B] border border-red-950/60 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#170E0E] text-red-400 text-[10px] uppercase tracking-widest border-b border-red-950">
                      <th className="px-6 py-3.5">Company Name</th>
                      <th className="px-6 py-3.5">Owner Details</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Subscription Tier</th>
                      <th className="px-6 py-3.5">Override State</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-950/40">
                    {filteredCompanies.map(c => {
                      const isSuspended = c.status === 'suspended';
                      const isOverride = c.subscription?.manualOverride?.active;
                      return (
                        <tr key={c._id} className="hover:bg-red-950/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">
                            <span>{c.companyName}</span>
                            <span className="block text-[9px] text-red-500/60 mt-0.5">ID: {c._id}</span>
                          </td>
                          <td className="px-6 py-4 text-red-300">
                            {c.owner ? (
                              <div>
                                <span className="font-bold text-white block">{c.owner.name}</span>
                                <span className="text-[10px] text-red-400/70 block">{c.owner.email}</span>
                              </div>
                            ) : (
                              <span className="text-red-700 italic">No Owner</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                              isSuspended
                                ? 'bg-red-950 text-red-400 border-red-800'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}>
                              {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold uppercase">
                            <span className={`px-2.5 py-1 rounded-sm text-[10px] border ${
                              c.subscription?.tier === 'scale'
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : c.subscription?.tier === 'growth'
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}>
                              {c.subscription?.tier || 'free'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isOverride ? (
                              <div className="flex flex-col items-start space-y-1">
                                <span className="px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 text-[9px] font-bold uppercase tracking-wider rounded-sm">
                                  MANUAL OVERRIDE
                                </span>
                                <button
                                  onClick={() => handleClearOverride(c._id)}
                                  className="text-[9px] text-red-400 hover:text-white underline cursor-pointer"
                                >
                                  Clear Override
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-red-500/50 uppercase">Webhook Driven</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setOverrideModalCompany(c);
                                setSelectedTier(c.subscription?.tier || 'growth');
                              }}
                              className="px-2.5 py-1 bg-[#1A1010] hover:bg-[#2A1515] border border-red-950 text-red-300 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all cursor-pointer"
                            >
                              Edit Tier
                            </button>
                            <button
                              onClick={() => handleToggleSuspension(c._id)}
                              className={`px-2.5 py-1 border text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all cursor-pointer ${
                                isSuspended
                                  ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                                  : 'bg-amber-950 hover:bg-amber-900 border-amber-800 text-amber-300'
                              }`}
                            >
                              {isSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => {
                                setDeleteModalCompany(c);
                                setConfirmDeleteName('');
                              }}
                              className="px-2.5 py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-[10px] uppercase font-bold tracking-wider rounded-sm transition-all cursor-pointer"
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
            <div className="bg-[#100B0B] border border-red-950/60 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-red-500/60 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or company..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-[#0A0707] border border-red-950 text-white placeholder-red-950 text-xs rounded-sm focus:outline-none focus:border-red-600"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-[#0A0707] border border-red-950 text-red-200 text-xs py-1.5 px-3 rounded-sm focus:outline-none focus:border-red-600 font-mono"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="manager">Managers</option>
                <option value="worker">Technicians / Workers</option>
                <option value="customer">Customers</option>
              </select>
            </div>

            <div className="bg-[#100B0B] border border-red-950/60 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#170E0E] text-red-400 text-[10px] uppercase tracking-widest border-b border-red-950">
                      <th className="px-6 py-3.5">User Name & Email</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Associated Company</th>
                      <th className="px-6 py-3.5">Phone</th>
                      <th className="px-6 py-3.5">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-950/40">
                    {filteredUsers.map(u => (
                      <tr key={u._id} className="hover:bg-red-950/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-red-400/70 block">{u.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-red-950/80 border border-red-900 text-red-300 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-red-300">
                          {u.company ? (
                            <span className="font-bold text-white">{u.company.companyName}</span>
                          ) : (
                            <span className="text-red-700 italic">No Company</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-red-400/80 font-mono">{u.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-[10px] text-red-500/70 font-mono">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* IMMUTABLE AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-[#140D0D] border border-red-900/50 p-4 rounded-sm flex items-center space-x-3 text-xs text-red-300">
              <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-[11px] font-mono leading-relaxed">
                <strong>Immutable Audit Log Trail</strong>: Every single admin action is permanently recorded. These logs cannot be edited or deleted by any API route or portal control.
              </p>
            </div>

            <div className="bg-[#100B0B] border border-red-950/60 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="bg-[#170E0E] text-red-400 text-[10px] uppercase tracking-widest border-b border-red-950">
                      <th className="px-6 py-3.5">Timestamp</th>
                      <th className="px-6 py-3.5">Action Executed</th>
                      <th className="px-6 py-3.5">Target</th>
                      <th className="px-6 py-3.5">IP Address</th>
                      <th className="px-6 py-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-950/40">
                    {auditLogs.map(log => (
                      <tr key={log._id} className="hover:bg-red-950/20 transition-colors">
                        <td className="px-6 py-4 text-[10px] text-red-400/80 font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-bold">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider border ${
                            log.action.includes('SUCCESS') || log.action.includes('UNSUSPEND')
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : log.action.includes('FAILED') || log.action.includes('LOCKOUT') || log.action.includes('DELETE') || log.action.includes('SUSPEND')
                              ? 'bg-red-950 text-red-300 border-red-800'
                              : 'bg-amber-950 text-amber-300 border-amber-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {log.targetName || log.targetId || 'System'}
                        </td>
                        <td className="px-6 py-4 text-red-400/70 font-mono text-[11px]">{log.ipAddress}</td>
                        <td className="px-6 py-4 text-[10px] text-red-300/80 font-mono">
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#100B0B] border border-red-900/60 rounded-sm max-w-md w-full p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center">
                <Sliders className="w-4 h-4 mr-2 text-amber-500" />
                Manual Subscription Override
              </h3>
              <p className="text-xs text-red-300/70 font-mono">
                Target: <strong className="text-white">{overrideModalCompany.companyName}</strong>
              </p>

              {actionError && (
                <div className="text-xs text-red-400 bg-red-950 p-2 rounded border border-red-800">{actionError}</div>
              )}

              <form onSubmit={handleApplyOverride} className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1.5 font-bold">Select Tier</label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    className="w-full bg-[#0A0707] border border-red-950 text-white text-xs p-2 rounded-sm focus:outline-none focus:border-red-600"
                  >
                    <option value="free">Free Tier</option>
                    <option value="growth">Growth Tier</option>
                    <option value="scale">Scale Tier</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-red-950/40 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setOverrideModalCompany(null)}
                    className="px-4 py-2 bg-transparent hover:bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-4 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-200 text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer disabled:opacity-50"
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
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#140808] border border-red-600/80 rounded-sm max-w-md w-full p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 flex items-center">
                <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                Permanent Company Deletion
              </h3>
              <p className="text-xs text-red-300/80 font-mono leading-relaxed">
                Warning: This action is permanent and irreversible. This will delete <strong className="text-white">{deleteModalCompany.companyName}</strong> and all associated user records.
              </p>

              {actionError && (
                <div className="text-xs text-red-400 bg-red-950 p-2 rounded border border-red-800">{actionError}</div>
              )}

              <form onSubmit={handleDeleteCompany} className="space-y-4 font-mono">
                <div>
                  <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1 font-bold">
                    Type exact company name to confirm: <span className="text-white underline">{deleteModalCompany.companyName}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={confirmDeleteName}
                    onChange={(e) => setConfirmDeleteName(e.target.value)}
                    placeholder={deleteModalCompany.companyName}
                    className="w-full bg-[#0A0707] border border-red-950 text-white text-xs p-2 rounded-sm focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="pt-4 border-t border-red-950/40 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setDeleteModalCompany(null)}
                    className="px-4 py-2 bg-transparent hover:bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || confirmDeleteName.trim().toLowerCase() !== deleteModalCompany.companyName.trim().toLowerCase()}
                    className="px-4 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold uppercase tracking-wider rounded-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
