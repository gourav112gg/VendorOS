import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import dbStore from '../services/store';
import { Company, ServiceOrder } from '../types';
import { 
  Briefcase, CheckCircle, Clock, MapPin, DollarSign, Calendar, Navigation, 
  ChevronRight, Check, AlertCircle, FileText, Send, Settings, Search, X, Building, Download, RefreshCw,
  Mic, Play, CheckSquare, Square, Volume2, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SettingsPanel } from '../components/SettingsPanel';
import { ShortcutBadge } from '../components/ShortcutBadge';
import { NotificationCenter } from '../components/NotificationCenter';

export const WorkerDashboard: React.FC = () => {
  const { user, company, preferences, pendingRequest, logout } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<'jobs' | 'settings'>('jobs');
  const [assignedOrders, setAssignedOrders] = useState<ServiceOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState('');

  // Voice & Checklist States
  const [voiceQueryInput, setVoiceQueryInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [activeRecordingStageId, setActiveRecordingStageId] = useState<string | null>(null);
  const [voiceLog, setVoiceLog] = useState<string[]>([]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = () => {
      const myJobs = dbStore.getOrders(undefined, undefined, user.id);
      setAssignedOrders(myJobs);
      setCompanies(dbStore.getCompanies());
      
      // Auto-select first active or first job
      if (myJobs.length > 0 && !selectedOrder) {
        const active = myJobs.find(o => o.stage !== 'Completed') || myJobs[0];
        setSelectedOrder(active);
      } else if (selectedOrder) {
        // Sync selected order state from database
        const updatedSelected = myJobs.find(o => o.id === selectedOrder.id);
        setSelectedOrder(updatedSelected || null);
      }
    };

    loadOrders();
    const unsubscribe = dbStore.subscribe(loadOrders);
    return () => unsubscribe();
  }, [user, selectedOrder, refreshKey]);

  // Handle power user quick navigation shortcut custom events
  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetTab = customEvent.detail;
      if (targetTab === 'overview' || targetTab === 'jobs') {
        setActiveTab('jobs');
      } else if (targetTab === 'settings') {
        setActiveTab('settings');
      }
    };
    window.addEventListener('vendoros-nav', handleNav);
    return () => window.removeEventListener('vendoros-nav', handleNav);
  }, []);

  if (!user) return null;

  // Handle case where user is not associated with a company yet and has no pending request
  if (!company && !pendingRequest && activeTab !== 'settings') {
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
            onClick={() => setActiveTab('settings')}
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

  const formatCurrency = (amount: number) => {
    if (preferences.currency === 'INR') {
      return `Γé╣${amount}`;
    }
    return `$${amount}`;
  };

  const handleUpdateStage = async (stage: ServiceOrder['stage']) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);
    
    // Simulate slight loading latency
    await new Promise(resolve => setTimeout(resolve, 600));
    
    dbStore.updateOrderStage(selectedOrder.id, stage, user.id);
    setStatusUpdating(false);
  };

  // Stage & Checklist custom helpers
  const handleToggleChecklistItem = async (orderId: string, stageId: string, itemId: string, completed: boolean) => {
    if (!selectedOrder) return;
    const stage = selectedOrder.stages?.find(s => s.id === stageId);
    if (!stage) return;

    // 1. Keep track of original state for rollback
    const originalChecklist = [...stage.checklist];

    // 2. Perform optimistic update locally
    const updatedChecklist = stage.checklist.map(item => 
      item.id === itemId ? { ...item, completed } : item
    );

    // Update frontend state instantly
    dbStore.updateOrderStageDetails(orderId, stageId, {
      checklist: updatedChecklist
    });

    try {
      // 3. Simulate a network request (with 5% simulated network failure chance)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject(new Error("Network connection timeout. Failed to sync checklist."));
          } else {
            resolve(true);
          }
        }, 500);
      });
    } catch (err: any) {
      // 4. Rollback and show warning toast
      dbStore.updateOrderStageDetails(orderId, stageId, {
        checklist: originalChecklist
      });
      
      // Flash an optimistic rollback notification
      setError("Failed to sync changes with server. Checklist status has been rolled back.");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleUpdateSubstageStatus = (orderId: string, stageId: string, status: 'Pending' | 'In Progress' | 'Completed') => {
    dbStore.updateOrderStageDetails(orderId, stageId, { status });
  };

  const startSpeechRecognition = (stageId: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Local browser Speech Recognition API is not supported in this environment. Please type or use our Quick Voice presets in the Assist panel!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN'; // Indian-accent/Global English
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setActiveRecordingStageId(stageId);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition error:", event.error);
        setIsRecording(false);
        setActiveRecordingStageId(null);
        alert(`Mic input error: ${event.error}. Please type in our smart assist panel instead!`);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setActiveRecordingStageId(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQueryInput(transcript);
        processVoiceCommand(transcript, stageId);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
      setActiveRecordingStageId(null);
    }
  };

  const processVoiceCommand = (transcript: string, stageId: string) => {
    if (!selectedOrder || !selectedOrder.stages) return;
    const stage = selectedOrder.stages.find(s => s.id === stageId);
    if (!stage) return;

    const text = transcript.toLowerCase();
    let matchedAny = false;

    const updatedChecklist = stage.checklist.map(item => {
      const itemText = item.text.toLowerCase();
      // Extract keywords for comparison (ignore small filler words)
      const keywords = itemText.split(/\s+/).filter(w => w.length > 3);
      
      const directMatch = text.includes(itemText);
      const kwMatchCount = keywords.filter(kw => text.includes(kw)).length;
      
      // If we match direct statement OR most of the keywords, mark as complete
      const isMatch = directMatch || (keywords.length > 0 && kwMatchCount >= Math.min(2, keywords.length));

      if (isMatch && !item.completed) {
        matchedAny = true;
        setVoiceLog(prev => [...prev, `[Auto-Verified]: Checked "${item.text}"`]);
        return { ...item, completed: true };
      }
      return item;
    });

    if (matchedAny) {
      dbStore.updateOrderStageDetails(selectedOrder.id, stageId, {
        checklist: updatedChecklist
      });
    } else {
      setVoiceLog(prev => [...prev, `[No Match] Speech received: "${transcript}"`]);
    }
  };

  const handleCompleteJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setStatusUpdating(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    // Append notes if any
    if (notes.trim()) {
      const dbOrders = dbStore.getOrders();
      const dbOrd = dbOrders.find(o => o.id === selectedOrder.id);
      if (dbOrd) {
        dbOrd.description += `\n\n[Technician Notes]: ${notes.trim()}`;
      }
    }

    dbStore.updateOrderStage(selectedOrder.id, 'Completed', user.id);
    setStatusUpdating(false);
    setShowNotesForm(false);
    setNotes('');
  };

  const filteredOrders = assignedOrders.filter((job) => {
    if (!filterQuery.trim()) return true;
    const query = filterQuery.toLowerCase();
    const vendorName = companies.find((c) => c.id === job.companyId)?.name || '';
    return job.id.toLowerCase().includes(query) || vendorName.toLowerCase().includes(query);
  });

  const handleExportCSV = () => {
    // CSV headers
    const headers = [
      'Order ID',
      'Title',
      'Vendor',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Value',
      'Stage',
      'Address',
      'Notes',
      'Created At'
    ];

    // Map each job to CSV row
    const rows = filteredOrders.map((job) => {
      const companyName = companies.find((c) => c.id === job.companyId)?.name || 'Vendor Company';
      return [
        job.id,
        job.title,
        companyName,
        job.customerName,
        job.customerEmail || '',
        job.customerPhone || '',
        job.value,
        job.stage,
        job.address,
        job.notes || '',
        new Date(job.createdAt).toLocaleDateString()
      ];
    });

    // Helper to escape CSV values
    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      const stringified = String(val);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `assigned_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to check if a date is today
  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Indian Currency formatter helper
  const formatIndianCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalAssignedCount = assignedOrders.length;
  const totalAssignedValue = assignedOrders.reduce((sum, o) => sum + o.value, 0);

  const completedTodayOrders = assignedOrders.filter(
    (job) => job.stage === 'Completed' && isToday(job.completedAt || job.createdAt)
  );
  const completedTodayCount = completedTodayOrders.length;
  const completedTodayValue = completedTodayOrders.reduce((sum, o) => sum + o.value, 0);

  if (pendingRequest && user && !user.companyId && activeTab !== 'settings') {
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
            Your worker account was successfully registered. Once the company owner approves your request, you will gain access to your dispatches and schedule.
          </p>
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => setActiveTab('settings')}
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
      {error && (
        <div className="mb-6 p-4 bg-red-950/40 border border-red-500/50 rounded-lg flex items-center text-red-200">
          <AlertCircle className="w-5 h-5 mr-3 text-red-400" />
          <span>{error}</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-[#222222]">
        <div className="flex justify-between items-start w-full md:w-auto">
          <div>
            <h1 className="text-3xl font-serif italic font-light text-white tracking-tight flex items-center">
              <Briefcase className="w-8 h-8 mr-3 text-[#666666]" />
              Technician Service Hub
            </h1>
            <p className="text-[#666666] mt-1 text-xs font-mono uppercase tracking-widest">
              Worker Dashboard ΓÇó View assigned dispatches, update service stages, and log job details.
            </p>
          </div>
          <div className="md:hidden mt-1 mr-2">
            <NotificationCenter />
          </div>
        </div>

        {/* Refresh toggle + Sub navigation tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
          <div className="hidden md:block">
            <NotificationCenter />
          </div>
          {/* User-controlled Auto Refresh Toggle Switch */}
          <div className="flex items-center space-x-3 bg-[#111111] px-3 py-2 border border-[#222222] rounded-sm select-none">
            <div className="flex items-center space-x-2">
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-spin' : 'text-[#666666]'}`} style={autoRefresh ? { animationDuration: '3s' } : undefined} />
              <span className="text-[10px] font-mono font-bold text-[#888888] uppercase tracking-wider">
                Auto Refresh (60s)
              </span>
            </div>
            <button
              id="auto-refresh-toggle"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                autoRefresh ? 'bg-emerald-500' : 'bg-[#222222]'
              }`}
              role="switch"
              aria-checked={autoRefresh}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  autoRefresh ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex bg-[#111111] p-1 border border-[#222222] rounded-sm space-x-1">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest transition-all duration-150 cursor-pointer flex items-center space-x-1.5 group ${
                activeTab === 'jobs'
                  ? 'bg-white text-black'
                  : 'text-[#666666] hover:text-[#888888]'
              }`}
            >
              <span>My Jobs</span>
              <ShortcutBadge tab="jobs" className="opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest transition-all duration-150 cursor-pointer flex items-center space-x-1.5 group ${
                activeTab === 'settings'
                  ? 'bg-white text-black'
                  : 'text-[#666666] hover:text-[#888888]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
              <ShortcutBadge tab="settings" className="opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'settings' ? (
        <SettingsPanel />
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Assigned Orders */}
            <div className="bg-[#111111] p-6 rounded-sm border border-[#222222] flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest block">Total Assigned Orders</span>
                <span className="text-4xl font-sans font-extrabold text-white mt-2 block">{totalAssignedCount}</span>
                <span className="text-xs font-mono text-[#888888] mt-1.5 inline-block">
                  Assigned Value: <span className="text-white font-bold">{formatIndianCurrency(totalAssignedValue)}</span>
                </span>
              </div>
              <div className="p-3 bg-[#1A1A1A] border border-[#222222] text-[#888888] rounded-sm">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: Completed Today */}
            <div className="bg-[#111111] p-6 rounded-sm border border-[#222222] flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest block">Completed Today</span>
                <span className="text-4xl font-sans font-extrabold text-white mt-2 block">{completedTodayCount}</span>
                <span className="text-xs font-mono text-emerald-400 mt-1.5 inline-block">
                  Completed Value: <span className="text-emerald-400 font-bold">{formatIndianCurrency(completedTodayValue)}</span>
                </span>
              </div>
              <div className="p-3 bg-[#1A1A1A] border border-[#222222] text-emerald-400 rounded-sm">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="bg-[#111111] border border-[#222222] rounded-sm p-12 text-center max-w-2xl mx-auto mt-6">
              <Briefcase className="w-12 h-12 text-[#333333] mx-auto mb-4" />
              <h2 className="text-xl font-serif italic font-light text-white">You are fully caught up!</h2>
              <p className="text-xs text-[#666666] max-w-sm mx-auto mt-2">
                No service orders are currently dispatched to you. Relax or notify your dispatch manager.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Assigned Jobs List (cols-5) */}
          <div className={`lg:col-span-5 space-y-4 ${
            preferences.sidebarPosition === 'right' ? 'lg:order-last' : 'lg:order-first'
          }`}>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">My Jobs ({assignedOrders.length})</h3>
                {filteredOrders.length > 0 && (
                  <button
                    id="export-csv-btn"
                    onClick={handleExportCSV}
                    className="flex items-center space-x-1.5 px-2.5 py-1 text-[9px] font-mono font-bold text-[#888888] hover:text-white bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] rounded-sm uppercase tracking-wider transition-all duration-150 cursor-pointer"
                    title="Export current filtered list as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>
              
              {/* Filter input */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-[#666666]" />
                </span>
                <input
                  id="order-filter-input"
                  type="text"
                  className="w-full bg-[#111111] text-xs text-white placeholder-[#555555] pl-9 pr-9 py-2.5 rounded-sm border border-[#222222] focus:outline-none focus:border-[#444444] transition-colors"
                  placeholder="Filter by vendor or order ID..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
                {filterQuery && (
                  <button
                    id="order-filter-clear-btn"
                    onClick={() => setFilterQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#666666] hover:text-[#999999] transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-[#666666] text-xs bg-[#111111] border border-[#222222] border-dashed rounded-sm">
                  No matching jobs found.
                </div>
              ) : (
                filteredOrders.map((job) => {
                  const isSelected = selectedOrder?.id === job.id;
                  const companyName = companies.find((c) => c.id === job.companyId)?.name || 'Vendor Company';
                  return (
                    <button
                      key={job.id}
                      onClick={() => setSelectedOrder(job)}
                      className={`w-full text-left p-5 rounded-sm border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1A1A] border-[#444444] text-white shadow-md'
                          : 'bg-[#111111] border-[#222222] hover:border-[#333333] text-[#E5E5E5]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                          isSelected ? 'bg-[#333333] text-white' : 'bg-[#0D0D0D] border border-[#222222] text-[#888888]'
                        }`}>
                          {job.id}
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-sm ${
                          job.stage === 'Completed'
                            ? 'bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40'
                            : 'bg-[#2D220D] text-amber-400 border border-amber-950/40'
                        }`}>
                          {job.stage}
                        </span>
                      </div>

                      <h4 className={`text-base font-sans font-bold mt-3 leading-tight ${isSelected ? 'text-white' : 'text-[#E5E5E5]'}`}>
                        {job.title}
                      </h4>

                      <p className={`text-[10px] font-mono font-medium uppercase tracking-widest mt-1.5 flex items-center ${isSelected ? 'text-emerald-400' : 'text-[#888888]'}`}>
                        <Building className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-[#666666]" />
                        <span className="truncate">{companyName}</span>
                      </p>

                      <p className={`text-xs mt-2 flex items-center ${isSelected ? 'text-white/80' : 'text-[#666666]'}`}>
                        <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{job.address}</span>
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#222222] border-dashed flex justify-between items-center text-xs font-semibold">
                        <span className={isSelected ? 'text-white/80' : 'text-[#888888]'}>
                          {job.customerName}
                        </span>
                        <span className={`font-mono ${isSelected ? 'text-white' : 'text-[#E5E5E5]'}`}>
                          Est. {formatCurrency(job.value)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Detailed View & Action Card (cols-7) */}
          <div className="lg:col-span-7">
            {selectedOrder ? (
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden"
              >
                {/* Detail Header */}
                <div className="p-6 bg-[#0A0A0A] border-b border-[#222222]">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">Service Ticket: {selectedOrder.id}</span>
                    <span className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">Created: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-xl font-serif italic font-light text-white mt-2 leading-snug">{selectedOrder.title}</h2>
                  
                  <div className="flex items-center space-x-1.5 mt-3">
                    <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">Technician Account:</span>
                    <span className="bg-[#1A1A1A] border border-[#222222] text-[#888888] font-semibold px-2 py-0.5 rounded-sm text-[10px] font-mono">
                      {user.role} ΓÇó {user.name}
                    </span>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-6 space-y-6">
                  {/* Job Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0D0D0D] p-4 rounded-sm border border-[#222222]">
                      <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest">Customer Name</span>
                      <span className="font-semibold text-white text-sm mt-1 block">{selectedOrder.customerName}</span>
                    </div>
                    <div className="bg-[#0D0D0D] p-4 rounded-sm border border-[#222222]">
                      <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest">Service Fee</span>
                      <span className="font-bold text-white text-base mt-1 block font-mono">{formatCurrency(selectedOrder.value)}</span>
                    </div>
                  </div>

                  {/* Customer Address */}
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-1.5">Site Location</span>
                    <div className="flex items-start space-x-2 bg-[#0D0D0D] p-4 rounded-sm border border-[#222222]">
                      <MapPin className="w-5 h-5 text-[#888888] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-semibold text-white block">{selectedOrder.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-1.5">Service Details</span>
                    <div className="bg-[#0D0D0D] p-4 rounded-sm border border-[#222222] text-sm text-[#888888] whitespace-pre-wrap leading-relaxed">
                      {selectedOrder.description}
                    </div>
                  </div>

                  {/* Operational Stepper Progress */}
                  <div>
                    <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-3">Service Stage</span>
                    
                    <div className="grid grid-cols-4 gap-2">
                      {(['Scheduled', 'Dispatched', 'In Progress', 'Completed'] as const).map((stage, idx) => {
                        const stages = ['Scheduled', 'Dispatched', 'In Progress', 'Completed'];
                        const currentIdx = stages.indexOf(selectedOrder.stage);
                        const thisIdx = idx;
                        const isCompleted = thisIdx < currentIdx;
                        const isActive = thisIdx === currentIdx;
                        
                        return (
                          <div key={stage} className="text-center">
                            <div className={`h-1.5 rounded-sm mb-2 ${
                              isCompleted ? 'bg-emerald-500' : isActive ? 'bg-white animate-pulse' : 'bg-[#222222]'
                            }`}></div>
                            <span className={`text-[10px] font-bold block uppercase tracking-widest ${
                              isActive ? 'text-white' : isCompleted ? 'text-emerald-500' : 'text-[#444444]'
                            }`}>
                              {stage}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* GRANULAR SERVICE LIFECYCLE STAGES & VOICE ASSIST */}
                  <div className="pt-6 border-t border-[#222222] space-y-4">
                    <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest">
                      Active Delivery Stages Checklist Protocol
                    </span>

                    {(!selectedOrder.stages || selectedOrder.stages.length === 0) ? (
                      <div className="p-6 text-center text-xs font-mono text-[#555555] bg-[#0D0D0D] border border-dashed border-[#222222] rounded-sm">
                        No custom delivery stages defined by dispatch manager for this order. 
                        Please advance top-level statuses manually below.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedOrder.stages.map((stg, sIdx) => {
                          const isAssignedToMe = stg.assignedWorkerId === user.id;
                          const isRecordingThis = isRecording && activeRecordingStageId === stg.id;
                          
                          return (
                            <div 
                              key={stg.id} 
                              className={`p-4 rounded-sm border ${
                                isAssignedToMe 
                                  ? 'bg-[#0D0D0D] border-[#333333]' 
                                  : 'bg-[#0A0A0A] border-[#222222] opacity-75'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <div>
                                  <span className="text-[9px] font-mono text-[#888888] uppercase block">
                                    Stage {sIdx + 1} ΓÇó {stg.domainName}
                                  </span>
                                  <h4 className="text-sm font-bold text-white mt-0.5">{stg.title}</h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {isAssignedToMe && (
                                    <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-sm font-mono uppercase font-bold">
                                      Your Stage
                                    </span>
                                  )}
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider font-bold ${
                                    stg.status === 'Completed'
                                      ? 'bg-[#0D2A1D] text-emerald-400'
                                      : stg.status === 'In Progress'
                                      ? 'bg-[#0D1D2D] text-blue-400'
                                      : 'bg-[#1C1C1C] text-slate-500'
                                  }`}>
                                    {stg.status}
                                  </span>
                                </div>
                              </div>

                              {/* Stage controls if assigned to me */}
                              {isAssignedToMe && stg.status !== 'Completed' && (
                                <div className="flex space-x-2 mb-3 font-mono text-[10px]">
                                  {stg.status === 'Pending' || stg.status === 'Scheduled' || (stg.status as string) === 'Unscheduled' ? (
                                    <button
                                      onClick={() => handleUpdateSubstageStatus(selectedOrder.id, stg.id, 'In Progress')}
                                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-sm font-bold cursor-pointer transition-colors"
                                    >
                                      Begin Stage
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateSubstageStatus(selectedOrder.id, stg.id, 'Completed')}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-bold cursor-pointer transition-colors"
                                    >
                                      Finish Stage Complete
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Checklist Verification items */}
                              <div className="space-y-2 mt-3 pt-3 border-t border-[#1C1C1C]">
                                <span className="text-[9px] font-mono text-[#555555] uppercase tracking-wider block">Verification checklist checklist:</span>
                                
                                <div className="space-y-1.5">
                                  {stg.checklist.map((item) => (
                                    <div 
                                      key={item.id} 
                                      className="flex items-center space-x-2.5 text-xs font-mono cursor-pointer"
                                      onClick={() => {
                                        if (isAssignedToMe) {
                                          handleToggleChecklistItem(selectedOrder.id, stg.id, item.id, !item.completed);
                                        }
                                      }}
                                    >
                                      {item.completed ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                                      ) : (
                                        <Square className="w-4 h-4 text-[#444444]" />
                                      )}
                                      <span className={item.completed ? 'line-through text-[#444444]' : 'text-slate-300'}>
                                        {item.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Voice Assist matching pipeline */}
                              {isAssignedToMe && stg.status === 'In Progress' && (
                                <div className="mt-4 p-3 bg-[#070707] border border-[#1A1A1A] rounded-sm space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-mono text-[#666666] uppercase tracking-wider flex items-center">
                                      <Mic className="w-3 h-3 mr-1 text-[#888888]" /> Voice Assist (Whisper/Speech Autotick)
                                    </span>
                                    {isRecordingThis && (
                                      <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => startSpeechRecognition(stg.id)}
                                      className={`p-2.5 rounded-full border cursor-pointer transition-all ${
                                        isRecordingThis 
                                          ? 'bg-red-950 border-red-500 text-red-400 animate-pulse' 
                                          : 'bg-[#111111] border-[#333333] hover:border-white text-[#888888] hover:text-white'
                                      }`}
                                      title="Record audio for checklist matching"
                                    >
                                      <Mic className="w-4 h-4" />
                                    </button>

                                    <div className="flex-grow flex gap-1.5 font-mono">
                                      <input
                                        type="text"
                                        placeholder="Or simulate/type voice: 'Checked isolate valve'"
                                        id={`voice-sim-${stg.id}`}
                                        className="flex-grow p-1.5 bg-[#000] border border-[#222222] text-[11px] text-white rounded-sm focus:outline-none focus:border-white"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            if (val.trim()) {
                                              processVoiceCommand(val, stg.id);
                                              (e.target as HTMLInputElement).value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          const inputEl = document.getElementById(`voice-sim-${stg.id}`) as HTMLInputElement;
                                          if (inputEl && inputEl.value.trim()) {
                                            processVoiceCommand(inputEl.value, stg.id);
                                            inputEl.value = '';
                                          }
                                        }}
                                        className="px-2 py-1 bg-[#222222] hover:bg-[#333333] border border-[#333333] text-[9px] font-bold uppercase tracking-wider rounded-sm cursor-pointer"
                                      >
                                        Auto-Tick
                                      </button>
                                    </div>
                                  </div>

                                  {/* Quick click transcription chips */}
                                  <div className="space-y-1 pt-1">
                                    <span className="text-[8px] font-mono text-[#444444] uppercase block">Quick Speak Assist Simulations (1-click test):</span>
                                    <div className="flex flex-wrap gap-1">
                                      {stg.checklist.filter(c => !c.completed).map(item => (
                                        <button
                                          key={item.id}
                                          onClick={() => processVoiceCommand(`I have verified and completed the step to ${item.text}`, stg.id)}
                                          className="text-[9px] font-mono bg-[#111111] hover:bg-[#1C1C1C] text-[#888888] hover:text-white border border-[#222222] px-2 py-0.5 rounded-sm transition-colors cursor-pointer"
                                        >
                                          Say: "Completed {item.text}"
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Action Controls */}
                  <div className="pt-6 border-t border-[#222222]">
                    {selectedOrder.stage === 'Completed' ? (
                      <div className="bg-[#0D2A1D] border border-emerald-950/40 rounded-sm p-4 text-center flex flex-col items-center">
                        <CheckCircle className="w-8 h-8 text-emerald-400 mb-2" />
                        <h4 className="font-bold text-emerald-400 text-sm font-mono uppercase tracking-widest">Job Successfully Completed!</h4>
                        <p className="text-xs text-emerald-500/80 mt-1">Completion logs saved in the portal database.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">Advance Job Stage:</h4>

                        <div className="flex flex-wrap gap-3">
                          {selectedOrder.stage === 'Scheduled' && (
                            <button
                              onClick={() => handleUpdateStage('Dispatched')}
                              disabled={statusUpdating}
                              className="px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all flex items-center cursor-pointer"
                            >
                              {statusUpdating ? 'Updating...' : 'Start Driving'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          )}

                          {selectedOrder.stage === 'Dispatched' && (
                            <button
                              onClick={() => handleUpdateStage('In Progress')}
                              disabled={statusUpdating}
                              className="px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all flex items-center cursor-pointer"
                            >
                              {statusUpdating ? 'Updating...' : 'Begin Work'}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          )}

                          {selectedOrder.stage === 'In Progress' && !showNotesForm && (
                            <button
                              onClick={() => setShowNotesForm(true)}
                              className="px-5 py-2.5 bg-white hover:bg-[#E5E5E5] text-black rounded-sm font-bold text-[10px] uppercase tracking-widest transition-all flex items-center cursor-pointer"
                            >
                              Mark Job Completed
                              <Check className="w-4 h-4 ml-1.5" />
                            </button>
                          )}
                        </div>

                        {/* Completion Notes Form */}
                        {showNotesForm && (
                          <motion.form 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleCompleteJob}
                            className="bg-[#0D0D0D] border border-[#222222] rounded-sm p-4 space-y-3"
                          >
                            <div className="flex items-center space-x-1.5 text-white">
                              <FileText className="w-4 h-4 text-[#888888]" />
                              <h5 className="font-bold text-[10px] uppercase tracking-widest font-mono text-[#666666]">Job Completion Log</h5>
                            </div>

                            <textarea
                              required
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Describe work completed, components used, or important feedback..."
                              className="w-full px-4 py-2.5 text-xs font-mono rounded-sm border border-[#222222] bg-[#0A0A0A] text-white focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                              rows={3}
                            />

                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => setShowNotesForm(false)}
                                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#666666] hover:text-white rounded-sm transition-colors cursor-pointer"
                              >
                                Back
                              </button>
                              <button
                                type="submit"
                                disabled={statusUpdating}
                                className="px-4 py-1.5 bg-[#0D2A1D] border border-emerald-950/40 text-emerald-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all flex items-center cursor-pointer"
                              >
                                {statusUpdating ? 'Saving...' : 'Submit & Close Job'}
                                <Send className="w-3 h-3 ml-1.5" />
                              </button>
                            </div>
                          </motion.form>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-[#111111] rounded-sm border border-[#222222] p-12 text-center text-[#666666] text-xs font-mono">
                Please select a job from the list to view its details.
              </div>
            )}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
};
