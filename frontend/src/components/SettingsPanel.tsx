import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  IndianRupee, DollarSign, Layout, Columns, AlignLeft, AlignRight, 
  Settings, Check, HelpCircle, User, Shield, Bell, Key, Phone, 
  Mail, Lock, ShieldAlert, CheckCircle, RefreshCw, Smartphone,
  CreditCard, Sparkles, AlertTriangle, Activity, FileText, Clock,
  Layers, ArrowUpRight, Zap, CheckSquare, Sun, Moon, Palette, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dbStore from '../services/store';
import { TIER_PRICING } from '../services/subscriptionService';
import { Subscription } from '../types';

interface SettingsPanelProps {
  initialTab?: 'profile' | 'preferences' | 'subscription';
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ initialTab = 'profile' }) => {
  const { user, company, preferences, updatePreference, updateProfile } = useAuth();
  
  // Tab states
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'preferences' | 'subscription'>('profile');

  // Sync tab with initialTab prop
  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Profile settings state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security Toggles & State
  const [mfaEnabled, setMfaEnabled] = useState(localStorage.getItem('vendoros_security_mfa') === 'true');
  const [pinRequired, setPinRequired] = useState(localStorage.getItem('vendoros_security_pin_enabled') === 'true');
  const [pin, setPin] = useState(localStorage.getItem('vendoros_security_pin') || '');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  // Subscription Specific States
  const currentSub = company?.subscription || {
    tier: 'free',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(),
    razorpaySubscriptionId: 'sub_free_sim',
    updatedAt: new Date().toISOString()
  };

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [checkoutTier, setCheckoutTier] = useState<'free' | 'growth' | 'scale' | null>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<{
    id: string;
    event: string;
    tier: string;
    status: string;
    time: string;
  }[]>([]);

  // AI theme generator states
  const [aiPrompt, setAiPrompt] = useState(preferences.customThemePrompt || '');
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [themeError, setThemeError] = useState('');

  const handleGenerateAiTheme = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingTheme(true);
    setThemeError('');
    try {
      const response = await fetch('/api/generate-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          mode: preferences.themeMode || 'dark'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate theme from AI');
      }
      
      const data = await response.json();
      if (data.colors) {
        updatePreference('customThemeColors', data.colors);
        updatePreference('customThemePrompt', aiPrompt.trim());
        updatePreference('themeName', 'custom');
      } else {
        throw new Error('Invalid response color schema');
      }
    } catch (err: any) {
      console.error(err);
      setThemeError(err.message || 'Failed to generate theme.');
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  // Calculate dynamic days remaining for visual progress bar
  const daysRemaining = Math.max(0, Math.ceil(
    (new Date(currentSub.currentPeriodEnd).getTime() - Date.now()) / (1000 * 3600 * 24)
  ));
  const billingPeriodProgress = Math.min(100, Math.max(5, (daysRemaining / 30) * 100));

  // Simulated limits based on tiers
  const getSimulatedUsage = () => {
    switch (currentSub.tier) {
      case 'free':
        return { used: 3, limit: 5, label: 'Service Dispatches' };
      case 'growth':
        return { used: 14, limit: 50, label: 'Service Dispatches' };
      case 'scale':
        return { used: 41, limit: Infinity, label: 'Service Dispatches' };
      default:
        return { used: 0, limit: 5, label: 'Service Dispatches' };
    }
  };

  const usage = getSimulatedUsage();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile(name, phone);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleMFA = () => {
    const nextVal = !mfaEnabled;
    setMfaEnabled(nextVal);
    localStorage.setItem('vendoros_security_mfa', String(nextVal));
    setSecuritySuccess(true);
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  const handleTogglePIN = () => {
    if (pinRequired) {
      setPinRequired(false);
      localStorage.setItem('vendoros_security_pin_enabled', 'false');
      setSecuritySuccess(true);
      setTimeout(() => setSecuritySuccess(false), 3000);
    } else {
      setShowPinModal(true);
    }
  };

  const handleSavePIN = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      setPinError('PIN must be exactly 4 numeric digits');
      return;
    }
    setPinError('');
    localStorage.setItem('vendoros_security_pin', pin);
    localStorage.setItem('vendoros_security_pin_enabled', 'true');
    setPinRequired(true);
    setShowPinModal(false);
    setSecuritySuccess(true);
    setTimeout(() => setSecuritySuccess(false), 3000);
  };

  const handleRevokeSessions = () => {
    if (!user) return;
    dbStore.revokeOtherSessions(user.id);
    setSessionsRevoked(true);
    setTimeout(() => setSessionsRevoked(false), 3000);
  };

  const handleOpenCheckout = (tier: 'free' | 'growth' | 'scale') => {
    if (tier === currentSub.tier && currentSub.status === 'active') return;
    setCheckoutTier(tier);
    setIsRazorpayModalOpen(true);
  };

  const triggerRazorpayCheckout = async (simulateSuccess: boolean) => {
    if (!checkoutTier || !company || !user) return;
    setIsProcessing(true);

    try {
      if (simulateSuccess) {
        const subId = 'sub_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_razor';
        
        const response = await fetch('/api/razorpay/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'subscription.charged',
            subscriptionId: subId,
            tier: checkoutTier
          })
        });

        const data = await response.json();
        if (data.webhookProcessed && data.subscription) {
          dbStore.updateCompanySubscription(company.id, data.subscription, user.id);
          
          setWebhookLogs(prev => [
            {
              id: 'log_' + Date.now(),
              event: 'subscription.charged',
              tier: checkoutTier,
              status: 'active',
              time: new Date().toLocaleTimeString()
            },
            ...prev
          ]);
        }
      }
    } catch (e) {
      console.error('Razorpay Simulation Error:', e);
    } finally {
      setIsProcessing(false);
      setIsRazorpayModalOpen(false);
      setCheckoutTier(null);
    }
  };

  const simulateDirectWebhook = async (event: 'subscription.charged' | 'subscription.halted' | 'subscription.cancelled') => {
    if (!company || !user) return;
    setIsProcessing(true);
    try {
      const activeSubId = currentSub.razorpaySubscriptionId || 'sub_active_sim';
      const targetTier = currentSub.tier;

      const response = await fetch('/api/razorpay/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          subscriptionId: activeSubId,
          tier: targetTier
        })
      });

      const data = await response.json();
      if (data.webhookProcessed && data.subscription) {
        dbStore.updateCompanySubscription(company.id, data.subscription, user.id);
        
        setWebhookLogs(prev => [
          {
            id: 'log_' + Date.now(),
            event,
            tier: targetTier,
            status: data.subscription.status,
            time: new Date().toLocaleTimeString()
          },
          ...prev
        ]);
      }
    } catch (e) {
      console.error('Direct Webhook Simulation Error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40';
      case 'past_due':
        return 'bg-amber-950/20 text-amber-400 border border-amber-900/30';
      case 'canceled':
        return 'bg-red-950/20 text-red-400 border border-red-900/30';
      default:
        return 'bg-[#111111] text-[#888888] border border-[#222222]';
    }
  };

  const isBillingRestricted = user?.role !== 'Owner' && user?.role !== 'Manager';

  // Pricing pricing numbers with year calculations
  const getTierPrice = (tierKey: 'free' | 'growth' | 'scale') => {
    const defaultPrice = TIER_PRICING[tierKey].price;
    if (billingCycle === 'annual') {
      return defaultPrice === 0 ? 0 : Math.round(defaultPrice * 12 * 0.8); // 20% discount
    }
    return defaultPrice;
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="settings-pricing-main-viewport">
      {/* 1. Header Navigation Switcher */}
      <div className="flex border-b border-[#222222] overflow-x-auto select-none no-scrollbar">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'profile'
              ? 'border-white text-white font-extrabold'
              : 'border-transparent text-[#666666] hover:text-[#888888]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Security</span>
        </button>

        <button
          onClick={() => setActiveSubTab('preferences')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'preferences'
              ? 'border-white text-white font-extrabold'
              : 'border-transparent text-[#666666] hover:text-[#888888]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>App Preferences</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subscription')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'subscription'
              ? 'border-white text-white font-extrabold'
              : 'border-transparent text-[#666666] hover:text-[#888888]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscription & Pricing</span>
        </button>
      </div>

      {/* ======================================= */}
      {/* 2. TAB 1: PROFILE & SECURITY CONTENT */}
      {/* ======================================= */}
      {activeSubTab === 'profile' && (
        <div className="space-y-6">
          {/* PROFILE CARD */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222222]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A1A1A] border border-[#222222] text-[#888888] rounded-sm">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Profile Settings</h3>
                  <p className="text-xs text-[#666666] mt-0.5">Update your display name and contact details.</p>
                </div>
              </div>
              {profileSuccess && (
                <span className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-[#0D2A1D] px-2.5 py-1 border border-emerald-950/40 rounded-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>SAVED</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="profile-name" className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
                    Display Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black text-xs text-white placeholder-[#444444] px-3 py-2.5 rounded-sm border border-[#222222] focus:outline-none focus:border-[#444444] transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile-phone" className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
                    Contact Phone
                  </label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black text-xs text-white placeholder-[#444444] px-3 py-2.5 rounded-sm border border-[#222222] focus:outline-none focus:border-[#444444] transition-colors"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-[#E5E5E5] rounded-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>

          {/* NOTIFICATION CHANNELS CARD */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#222222]">
              <div className="p-2 bg-[#1A1A1A] border border-[#222222] text-[#888888] rounded-sm">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Notification Channels</h3>
                <p className="text-xs text-[#666666] mt-0.5">Control where and how you receive urgent service dispatch alerts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Email Alerts */}
              <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-sm flex items-start justify-between">
                <div className="space-y-1 mr-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Email Alerts</span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Alerts for scheduled bookings & status updates.</p>
                </div>
                <button
                  id="notify-email-toggle"
                  onClick={() => updatePreference('notifyEmail', !preferences.notifyEmail)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.notifyEmail ? 'bg-emerald-500' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.notifyEmail ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* SMS Alerts */}
              <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-sm flex items-start justify-between">
                <div className="space-y-1 mr-3">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">SMS Dispatches</span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Real-time SMS alerts for field completions.</p>
                </div>
                <button
                  id="notify-sms-toggle"
                  onClick={() => updatePreference('notifySMS', !preferences.notifySMS)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.notifySMS ? 'bg-emerald-500' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.notifySMS ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="p-4 bg-[#0A0A0A] border border-[#222222] rounded-sm flex items-start justify-between">
                <div className="space-y-1 mr-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">In-App Alerts</span>
                  </div>
                  <p className="text-[11px] text-[#666666] leading-relaxed">Direct visual popup-banners inside browser sessions.</p>
                </div>
                <button
                  id="notify-push-toggle"
                  onClick={() => updatePreference('notifyPush', !preferences.notifyPush)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.notifyPush ? 'bg-emerald-500' : 'bg-[#222222]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      preferences.notifyPush ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* SECURITY MANAGEMENT CARD */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#222222]">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#1A1A1A] border border-[#222222] text-[#888888] rounded-sm">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">Security Settings</h3>
                  <p className="text-xs text-[#666666] mt-0.5">Manage session tokens, access PINs, and MFA properties.</p>
                </div>
              </div>
              {securitySuccess && (
                <span className="flex items-center space-x-1.5 text-[10px] font-mono font-bold text-emerald-400 bg-[#0D2A1D] px-2.5 py-1 border border-emerald-950/40 rounded-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>UPDATED</span>
                </span>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Access PIN Setup */}
                <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Key className="w-4 h-4 text-[#888888]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Secure Access PIN</span>
                      </div>
                      <button
                        id="security-pin-toggle"
                        onClick={handleTogglePIN}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          pinRequired ? 'bg-emerald-500' : 'bg-[#222222]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            pinRequired ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-[#666666] mt-2.5 leading-relaxed">
                      Require a unique 4-digit PIN to perform final service order dispatches and completions.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex justify-between items-center text-xs text-[#888888]">
                    <span>Status:</span>
                    <span className={`font-mono font-bold ${pinRequired ? 'text-emerald-400' : 'text-[#555555]'}`}>
                      {pinRequired ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>

                {/* MFA Security Switch */}
                <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-[#888888]" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Two-Factor Auth (MFA)</span>
                      </div>
                      <button
                        id="security-mfa-toggle"
                        onClick={handleToggleMFA}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          mfaEnabled ? 'bg-emerald-500' : 'bg-[#222222]'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            mfaEnabled ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-[#666666] mt-2.5 leading-relaxed">
                      Simulate a mobile secondary verification prompt on every single portal login session.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex justify-between items-center text-xs text-[#888888]">
                    <span>Status:</span>
                    <span className={`font-mono font-bold ${mfaEnabled ? 'text-emerald-400' : 'text-[#555555]'}`}>
                      {mfaEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SESSIONS REVOKE */}
              <div className="bg-[#0A0A0A] border border-[#222222] p-5 rounded-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider block">Active Devices & Sessions</span>
                    <p className="text-xs text-[#666666] mt-1 leading-relaxed">Log out of all secondary tablets or mobile devices currently hosting this authentication token.</p>
                  </div>
                  <button
                    id="revoke-sessions-btn"
                    onClick={handleRevokeSessions}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                  >
                    Revoke Other Sessions
                  </button>
                </div>

                {sessionsRevoked && (
                  <div className="mt-4 p-3 bg-[#0D2A1D] border border-emerald-950/40 rounded-sm text-xs font-mono font-bold text-emerald-400 flex items-center space-x-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>ALL OTHER LOGINS TERMINATED</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. TAB 2: APP PREFERENCES CONTENT */}
      {/* ======================================= */}
      {activeSubTab === 'preferences' && (
        <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm space-y-8">
          <div className="flex items-center space-x-3 pb-4 border-b border-[#222222]">
            <div className="p-2 bg-[#1A1A1A] border border-[#222222] text-[#888888] rounded-sm">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">App Preferences</h3>
              <p className="text-xs text-[#666666] mt-0.5">Customize your display currency and dashboard layout settings.</p>
            </div>
          </div>

          {/* THEME & LIGHT/DARK MODE DYNAMIC PICKER */}
          <div className="p-5 bg-[#0A0A0A] border border-[#222222] rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222222] pb-4 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Visual Interface Customization</span>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" /> Theme & Brightness Modes
                </h4>
              </div>
              
              {/* Light/Dark mode toggler */}
              <div className="flex items-center space-x-1 p-1 bg-[#111111] border border-[#222222] rounded-sm">
                <button
                  type="button"
                  onClick={() => updatePreference('themeMode', 'dark')}
                  className={`px-3 py-1.5 flex items-center gap-1.5 rounded-sm font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                    (preferences.themeMode || 'dark') === 'dark'
                      ? 'bg-[#1A1A1A] text-white border border-[#333333]'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => updatePreference('themeMode', 'light')}
                  className={`px-3 py-1.5 flex items-center gap-1.5 rounded-sm font-mono text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                    (preferences.themeMode || 'dark') === 'light'
                      ? 'bg-[#E5E5E5] text-black font-semibold'
                      : 'text-[#888888] hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light Mode
                </button>
              </div>
            </div>

            {/* PRESET PALETTES */}
            <div className="space-y-3">
              <span className="text-[9px] font-mono font-bold text-[#888888] uppercase tracking-widest block">Choose Theme Palette</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: 'slate', name: 'Slate/Classic', colors: ['#0A0A0A', '#10B981'] },
                  { id: 'sage', name: 'Sage Forest', colors: ['#0C0F0D', '#4CAF50'] },
                  { id: 'sapphire', name: 'Sapphire Gold', colors: ['#060B18', '#F59E0B'] },
                  { id: 'warm', name: 'Warm Editorial', colors: ['#110F0C', '#D97706'] },
                  { id: 'tokyo', name: 'Tokyo Midnight', colors: ['#090812', '#C084FC'] }
                ].map((preset) => {
                  const isActive = (preferences.themeName || 'slate') === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updatePreference('themeName', preset.id as any)}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-sm border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                          : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                      }`}
                    >
                      <div className="flex gap-1 mb-2">
                        <span className="w-3 h-3 rounded-full border border-[#333333]" style={{ backgroundColor: preset.colors[0] }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors[1] }} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-center">{preset.name}</span>
                      {isActive && <span className="text-[8px] text-emerald-400 font-mono mt-1 uppercase tracking-widest font-bold">● Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI NATURAL LANGUAGE THEME GENERATOR */}
            <div className="pt-4 border-t border-[#1F1F1F]">
              <div className="flex items-start justify-between mb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Generative AI Vibe Theme
                  </span>
                  <p className="text-[10px] text-[#666666]">Enter any prompt or aesthetic to let Gemini build a customized color scheme.</p>
                </div>
                {(preferences.themeName || 'slate') === 'custom' && (
                  <span className="text-[9px] font-mono text-emerald-400 bg-[#0D2A1D] border border-emerald-950/40 px-2 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">
                    USING CUSTOM AI PALETTE
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., 'Retro arcade games', 'Matcha Mint', 'Lava Cave', 'Sunset over Malibu beach'..."
                    disabled={isGeneratingTheme}
                    className="flex-grow bg-[#0D0D0D] border border-[#222222] hover:border-[#333333] focus:border-[#444444] rounded-sm px-3 py-2 text-xs font-mono text-white placeholder-[#444444] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiTheme}
                    disabled={isGeneratingTheme || !aiPrompt.trim()}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333333] text-[10px] font-mono font-bold text-white uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingTheme ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Crafting...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Generate
                      </>
                    )}
                  </button>
                </div>

                {themeError && (
                  <p className="text-[10px] font-mono text-red-500 bg-[#2D0D0D] border border-red-950/40 p-2 rounded-sm uppercase tracking-wider">
                    ⚠️ Error: {themeError}
                  </p>
                )}

                {preferences.customThemePrompt && (
                  <div className="flex items-center justify-between text-[9px] text-[#444444] font-mono">
                    <span>Generated theme: "{preferences.customThemePrompt}"</span>
                    <button
                      type="button"
                      onClick={() => {
                        updatePreference('themeName', 'slate');
                        updatePreference('customThemeColors', undefined);
                        updatePreference('customThemePrompt', undefined);
                        setAiPrompt('');
                      }}
                      className="text-red-400 hover:text-red-300 uppercase tracking-widest cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Clear Custom Theme
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CURRENCY PREFERENCE */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Display Currency</span>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed">Select the default currency symbol shown across your service portal.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updatePreference('currency', 'INR')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.currency === 'INR'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.currency === 'INR' ? 'bg-white text-black' : 'bg-black'}`}>
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Rupees (₹)</span>
                  </div>
                  {preferences.currency === 'INR' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => updatePreference('currency', 'USD')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.currency === 'USD'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.currency === 'USD' ? 'bg-white text-black' : 'bg-black'}`}>
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Dollars ($)</span>
                  </div>
                  {preferences.currency === 'USD' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* SIDEBAR POSITION */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Sidebar Alignment</span>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed">Choose whether the dispatches and schedule list appears on the left or right.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updatePreference('sidebarPosition', 'left')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.sidebarPosition === 'left'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.sidebarPosition === 'left' ? 'bg-white text-black' : 'bg-black'}`}>
                      <AlignLeft className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Left Side</span>
                  </div>
                  {preferences.sidebarPosition === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => updatePreference('sidebarPosition', 'right')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.sidebarPosition === 'right'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.sidebarPosition === 'right' ? 'bg-white text-black' : 'bg-black'}`}>
                      <AlignRight className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Right Side</span>
                  </div>
                  {preferences.sidebarPosition === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* DASHBOARD TAB ALIGNMENT */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Header Navigation Alignment</span>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed">Shift the sub-navigation tabs to the left or right of the layout.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updatePreference('navAlignment', 'left')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.navAlignment === 'left'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.navAlignment === 'left' ? 'bg-white text-black' : 'bg-black'}`}>
                      <AlignLeft className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Align Left</span>
                  </div>
                  {preferences.navAlignment === 'left' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => updatePreference('navAlignment', 'right')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.navAlignment === 'right'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.navAlignment === 'right' ? 'bg-white text-black' : 'bg-black'}`}>
                      <AlignRight className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Align Right</span>
                  </div>
                  {preferences.navAlignment === 'right' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* NAVIGATION STYLE */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest block">Dashboard Layout Style</span>
                <p className="text-xs text-[#888888] mt-1 leading-relaxed">Toggle between a horizontal sub-navigation or a sleek vertical side menu.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updatePreference('navStyle', 'horizontal')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.navStyle === 'horizontal'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.navStyle === 'horizontal' ? 'bg-white text-black' : 'bg-black'}`}>
                      <Layout className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Top Tab Bar</span>
                  </div>
                  {preferences.navStyle === 'horizontal' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => updatePreference('navStyle', 'sidebar')}
                  className={`flex items-center justify-between p-4 rounded-sm border transition-all cursor-pointer ${
                    preferences.navStyle === 'sidebar'
                      ? 'bg-[#1A1A1A] border-[#444444] text-white font-semibold'
                      : 'bg-[#0D0D0D] border-[#222222] text-[#888888] hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-sm ${preferences.navStyle === 'sidebar' ? 'bg-white text-black' : 'bg-black'}`}>
                      <Columns className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-mono">Side Menu</span>
                  </div>
                  {preferences.navStyle === 'sidebar' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 4. TAB 3: SUBSCRIPTION & PRICING CONTENT */}
      {/* ======================================= */}
      {activeSubTab === 'subscription' && (
        <div className="space-y-6">
          
          {/* SUBSCRIPTION STATUS VISUALIZATION PANEL */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm">
            <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-6">
              VendorOS Subscription Profile
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Profile Details Block */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Active Plan</span>
                  <span className="text-lg font-serif italic text-white flex items-center capitalize gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    {currentSub.tier} Edition
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest mt-1 ${getStatusColor(currentSub.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${currentSub.status === 'active' ? 'bg-emerald-500 animate-pulse' : currentSub.status === 'past_due' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    {currentSub.status}
                  </span>
                </div>

                <div className="space-y-1 mt-2">
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Renewal Date</span>
                  <span className="text-xs font-mono font-bold text-[#888888] block mt-1">
                    {new Date(currentSub.currentPeriodEnd).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="space-y-1 mt-2">
                  <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">Subscription ID</span>
                  <span className="text-xs font-mono font-semibold text-[#666666] block truncate max-w-[120px] mt-1 select-all" title={currentSub.razorpaySubscriptionId}>
                    {currentSub.razorpaySubscriptionId || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Progress and usage visualizer (Aesthetic progress loops & bars) */}
              <div className="lg:col-span-7 space-y-4 border-t lg:border-t-0 lg:border-l border-[#222222] pt-4 lg:pt-0 lg:pl-6">
                
                {/* Time-to-Renewal dynamic visual meter */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#888888] uppercase">Time Remaining in Cycle</span>
                    <span className="text-white font-bold">{daysRemaining} Days</span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#222222]">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentSub.status === 'active' 
                          ? 'bg-emerald-500' 
                          : currentSub.status === 'past_due' 
                          ? 'bg-amber-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${billingPeriodProgress}%` }}
                    />
                  </div>
                </div>

                {/* Operations Usage Limits tracking (Realtime values based on selected plan) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#888888] uppercase">Monthly Dispatch Quota</span>
                    <span className="text-white font-bold">
                      {usage.used} / {usage.limit === Infinity ? 'Unlimited' : usage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-[#1A1A1A] h-2 rounded-full overflow-hidden border border-[#222222]">
                    <div 
                      className={`h-full rounded-full bg-blue-500 transition-all duration-500`}
                      style={{ width: `${usage.limit === Infinity ? 100 : Math.min(100, (usage.used / usage.limit) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Soft-lock notice for past due/canceled status */}
            {currentSub.status !== 'active' && (
              <div className="mt-5 p-4 bg-amber-950/10 border border-amber-900/30 text-amber-500 text-xs flex items-start gap-2.5 rounded-sm">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-1 leading-relaxed">
                  <p className="font-bold uppercase tracking-wider font-mono text-[10px]">Premium Capabilities Soft-Locked</p>
                  <p className="text-[#888888]">
                    Your subscription billing claim is currently flagged as <strong className="text-amber-500">{currentSub.status.toUpperCase()}</strong>. Advanced systems such as AI Copilot risk scoring, GST invoicing, Trust metrics, and Supplier intelligence are temporarily paused. Complete simulation renewal below to restore instantly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE TIERED PLANS GRID */}
          <div className="space-y-4">
            
            {/* Monthly vs Yearly toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-xs font-mono font-bold text-[#666666] uppercase tracking-widest">
                  VendorOS Operations Plans
                </h4>
                <p className="text-xs text-[#555555] mt-1">Upgrade your company tier to unlock advanced AI modules and multi-factory scaling.</p>
              </div>

              {/* Cycle Toggle Button */}
              <div className="flex items-center space-x-1.5 bg-[#141414] border border-[#222222] p-1 rounded-sm select-none">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer ${
                    billingCycle === 'monthly' ? 'bg-white text-black' : 'text-[#666666] hover:text-[#888888]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer flex items-center space-x-1 ${
                    billingCycle === 'annual' ? 'bg-white text-black' : 'text-[#666666] hover:text-[#888888]'
                  }`}
                >
                  <span>Annual</span>
                  <span className={`px-1 py-0.5 text-[7px] rounded-sm font-bold ${billingCycle === 'annual' ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    -20%
                  </span>
                </button>
              </div>
            </div>

            {/* Role-based restriction warning banner */}
            {isBillingRestricted && (
              <div className="p-3 bg-[#1A1A1A] border border-[#222222] rounded-sm text-xs text-[#888888] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0" />
                <span>You are logged in as a <strong>{user?.role}</strong>. Subscription management and upgrades are read-only and restricted to Company Owners or Managers.</span>
              </div>
            )}

            {/* Plans side-by-side cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {(['free', 'growth', 'scale'] as const).map((tierKey) => {
                const tier = TIER_PRICING[tierKey];
                const isCurrent = currentSub.tier === tierKey;
                const isHighlighted = tierKey === 'growth';
                const calculatedPrice = getTierPrice(tierKey);

                return (
                  <div 
                    key={tierKey}
                    className={`bg-[#111111] border rounded-sm p-6 flex flex-col justify-between relative transition-all duration-200 ${
                      isCurrent && currentSub.status === 'active'
                        ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.03)]' 
                        : isHighlighted 
                        ? 'border-[#333333] ring-1 ring-[#222222]' 
                        : 'border-[#222222]'
                    }`}
                  >
                    {isHighlighted && (
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-white text-black text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" /> Most Popular
                      </div>
                    )}

                    {isCurrent && currentSub.status === 'active' && (
                      <div className="absolute top-0 left-6 -translate-y-1/2 bg-emerald-500 text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md">
                        Active Plan
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                          {tierKey} Pack
                        </span>
                        <h4 className="text-lg font-serif italic text-white mt-1">
                          {tier.name}
                        </h4>
                      </div>

                      {/* Side-by-side Pricing Display */}
                      <div className="flex items-baseline gap-1 py-2.5 border-y border-[#1A1A1A]">
                        <span className="text-2xl font-serif text-white font-light">
                          {calculatedPrice === 0 ? 'Free' : `₹${calculatedPrice}`}
                        </span>
                        {calculatedPrice > 0 && (
                          <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest">
                            / {billingCycle === 'annual' ? 'year' : 'month'}
                          </span>
                        )}
                        {billingCycle === 'annual' && calculatedPrice > 0 && (
                          <span className="ml-auto text-[8px] font-mono text-emerald-500 font-bold bg-emerald-950/20 px-1.5 py-0.5 border border-emerald-900/10 rounded-sm">
                            Saves ₹{Math.round(tier.price * 12 * 0.2)} / yr
                          </span>
                        )}
                      </div>

                      <ul className="space-y-3 text-xs text-[#888888]">
                        {tier.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-relaxed">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#1A1A1A]">
                      <button
                        onClick={() => handleOpenCheckout(tierKey)}
                        disabled={isBillingRestricted || (isCurrent && currentSub.status === 'active')}
                        className={`w-full py-2.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
                          isCurrent && currentSub.status === 'active'
                            ? 'bg-[#161616] text-[#444444] border border-[#222222] cursor-not-allowed'
                            : isBillingRestricted
                            ? 'bg-[#161616] text-[#333333] border border-[#222222] cursor-not-allowed'
                            : isHighlighted
                            ? 'bg-white text-black hover:bg-[#E5E5E5]'
                            : 'bg-[#1A1A1A] text-white hover:bg-[#2A2A2A] border border-[#222222]'
                        }`}
                      >
                        {isCurrent && currentSub.status === 'active'
                          ? 'Current Tier' 
                          : isBillingRestricted
                          ? 'Restricted'
                          : tierKey === 'free' 
                          ? 'Downgrade' 
                          : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RAZORPAY WEBHOOK SIMULATOR */}
          <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div>
                <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
                  Razorpay Webhook Simulator
                </h3>
                <p className="text-xs text-[#555555] mt-1">
                  Directly fire simulation webhooks to check app adaptation to payment failures, cancellations, and charged states.
                </p>
              </div>
              <span className="bg-[#1A1A1A] border border-[#222222] text-[#888888] px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-widest">
                Admin Testing
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                onClick={() => simulateDirectWebhook('subscription.charged')}
                disabled={isProcessing || isBillingRestricted}
                className="flex items-center justify-center space-x-2 p-3 bg-[#0D2A1D] hover:bg-[#0D2A1D]/80 border border-emerald-950/40 text-emerald-400 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Simulate Renewal (Charged)</span>
              </button>

              <button
                onClick={() => simulateDirectWebhook('subscription.halted')}
                disabled={isProcessing || isBillingRestricted}
                className="flex items-center justify-center space-x-2 p-3 bg-amber-950/10 hover:bg-amber-950/20 border border-amber-900/30 text-amber-500 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Failure (Halted)</span>
              </button>

              <button
                onClick={() => simulateDirectWebhook('subscription.cancelled')}
                disabled={isProcessing || isBillingRestricted}
                className="flex items-center justify-center space-x-2 p-3 bg-red-950/10 hover:bg-red-950/20 border border-red-900/30 text-red-500 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate Cancel (Cancelled)</span>
              </button>
            </div>

            {/* Simulator Log Trails */}
            {webhookLogs.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#1A1A1A] space-y-2">
                <span className="text-[9px] font-mono text-[#555555] uppercase tracking-widest block">
                  Interactive Webhook Ingress Audit Logs
                </span>
                <div className="bg-black border border-[#222222] rounded-sm max-h-40 overflow-y-auto divide-y divide-[#161616] font-mono text-[10px]">
                  {webhookLogs.map(log => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between">
                      <span className="text-[#555555]">{log.time}</span>
                      <span className="text-white font-semibold">event: {log.event}</span>
                      <span className="text-[#888888] uppercase">tier: {log.tier}</span>
                      <span className={`px-2 py-0.5 rounded-sm capitalize font-bold text-[9px] ${
                        log.status === 'active' ? 'bg-[#0D2A1D] text-emerald-400' : log.status === 'past_due' ? 'bg-amber-950/40 text-amber-500' : 'bg-red-950/40 text-red-400'
                      }`}>
                        status: {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ======================================= */}
      {/* 5. ACCESS PIN MODAL SETUP */}
      {/* ======================================= */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-xl space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#222222]">
              <div className="p-2 bg-[#1A1A1A] border border-[#222222] text-amber-400 rounded-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Set Secure Access PIN</h4>
                <p className="text-[10px] text-[#666666]">Enter a 4-digit numeric access key</p>
              </div>
            </div>

            <form onSubmit={handleSavePIN} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="security-pin-input" className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-widest block">
                  Enter 4-Digit Numeric PIN
                </label>
                <input
                  id="security-pin-input"
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-black text-xl font-mono tracking-widest text-center text-white py-3 rounded-sm border border-[#222222] focus:outline-none focus:border-[#444444] transition-colors"
                  placeholder="••••"
                />
                {pinError && (
                  <p className="text-[10px] font-mono text-rose-500 font-bold uppercase tracking-wider">{pinError}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPin('');
                    setPinError('');
                  }}
                  className="w-1/2 py-2.5 bg-[#1A1A1A] hover:bg-[#252525] text-white border border-[#222222] text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-mono font-bold uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
                >
                  Enable PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 6. RAZORPAY CHECKOUT IFRAME-MOCK MODAL */}
      {/* ======================================= */}
      <AnimatePresence>
        {isRazorpayModalOpen && checkoutTier && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121624] border border-[#1e2540] w-full max-w-sm rounded-sm overflow-hidden text-white font-sans shadow-2xl"
              id="razorpay-simulation-frame"
            >
              {/* Header */}
              <div className="bg-[#0b0e1a] p-4 flex items-center justify-between border-b border-[#1e2540]">
                <div className="flex items-center space-x-2">
                  <div className="bg-[#2a75e6] p-1.5 rounded-sm text-white font-bold text-xs flex items-center justify-center">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#2a75e6]">
                      Razorpay Checkout
                    </h4>
                    <span className="text-[10px] text-[#8c9bb5] block">VendorOS Operations</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-[#8c9bb5] uppercase block tracking-widest">Amount</span>
                  <span className="text-sm font-bold text-white">
                    ₹{getTierPrice(checkoutTier)}/{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="bg-[#181d33] border border-[#232a4a] p-4 rounded-sm space-y-1.5 text-center">
                  <span className="text-[9px] font-mono text-[#8c9bb5] uppercase tracking-widest">Checkout Simulation</span>
                  <p className="text-xs text-[#ced7e6] leading-relaxed">
                    You are subscribing to the <strong className="text-white capitalize">{checkoutTier} Edition</strong> ({billingCycle} cycle).
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-[#8c9bb5] uppercase tracking-widest block">Select Payment Method</span>
                  
                  <div className="border border-[#232a4a] rounded-sm divide-y divide-[#232a4a] bg-[#181d33]">
                    <div className="p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-[#1f2542]">
                      <div className="flex items-center space-x-2.5">
                        <CreditCard className="w-4 h-4 text-[#2a75e6]" />
                        <span>Credit / Debit Card (Recurring)</span>
                      </div>
                      <span className="text-[10px] text-[#8c9bb5] font-mono">Simulated</span>
                    </div>

                    <div className="p-3 flex items-center justify-between text-xs cursor-pointer hover:bg-[#1f2542]">
                      <div className="flex items-center space-x-2.5">
                        <span className="text-[#2a75e6] font-bold font-mono text-[10px]">UPI</span>
                        <span>UPI Autopay (GPay/PhonePe)</span>
                      </div>
                      <span className="text-[10px] text-[#8c9bb5] font-mono">Simulated</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-[#0b0e1a] p-4 border-t border-[#1e2540] flex items-center justify-between gap-3">
                <button
                  onClick={() => setIsRazorpayModalOpen(false)}
                  className="flex-grow py-2 text-xs font-semibold text-[#8c9bb5] hover:text-white hover:bg-[#1f2542] rounded-sm border border-transparent transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => triggerRazorpayCheckout(true)}
                  disabled={isProcessing}
                  className="flex-grow py-2 bg-[#2a75e6] hover:bg-[#1d63d1] text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Pay Successfully</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPanel;
