import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Sparkles,
  Send,
  Mic,
  MicOff,
  X,
  RefreshCw,
  History,
  Plus,
  Boxes,
  Users,
  AlertTriangle,
  Package,
  CheckCircle2,
  Minimize2,
  Clock,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import api from "../services/api";
import dbStore from "../services/store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isVoice?: boolean;
  isError?: boolean;
  timestamp: string;
}

interface ChatSessionItem {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export const FloatingChatbot: React.FC = () => {
  const { user, company } = useAuth();
  const { t, language } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // In-browser intelligence fallback querying live company operations state
  const resolveLocalChatbotQuery = (query: string): string => {
    if (!user) {
      return "Please sign in to your VendorOS account to access your live company operations data.";
    }

    const q = query.toLowerCase();
    const compId = user.companyId || (company ? company.id : undefined) || 'comp_apex';
    const allOrders = dbStore.getOrders(compId);
    const allUsers = dbStore.getUsers();
    const domains = dbStore.getDomains(compId);
    const comp = company || dbStore.getCompanies().find(c => c.id === compId) || { name: 'Vendor Company', minOrderValue: 2000 };

    // 1. Order Status / Where is my order / Dispatches
    if (q.includes("order") || q.includes("status") || q.includes("where is") || q.includes("dispatch")) {
      let relevantOrders = allOrders;
      if (user.role === 'Customer') {
        relevantOrders = allOrders.filter(o => o.customerId === user.id || o.customerName.toLowerCase().includes(user.name.toLowerCase()));
      } else if (user.role === 'Worker') {
        relevantOrders = allOrders.filter(o => o.workerId === user.id || (o.stages || []).some(s => s.assignedWorkerId === user.id));
      }

      if (relevantOrders.length === 0) {
        return `No active service orders found for your profile (**${user.name}** • *${user.role}*).`;
      }

      const orderList = relevantOrders.map((o, idx) => {
        const stageCount = o.stages && o.stages.length > 0 ? ` • ${o.stages.length} execution stages` : '';
        return `${idx + 1}. **${o.title}** (ID: \`${o.id}\`)\n   - **Status**: ${o.stage}\n   - **Assigned Tech**: ${o.workerName || 'Unassigned'}\n   - **Location**: ${o.address}\n   - **Value**: ₹${o.value.toLocaleString()}${stageCount}`;
      }).join("\n\n");

      return `### 📋 Active Service Orders (${relevantOrders.length})\n\n${orderList}`;
    }

    // 2. Worker Availability / Free vs Busy
    if (q.includes("worker") || q.includes("technician") || q.includes("free") || q.includes("busy") || q.includes("availab")) {
      if (user.role !== 'Owner' && user.role !== 'Manager') {
        return `Worker availability roster is restricted to company Owners and Managers.`;
      }

      const workers = allUsers.filter(u => u.companyId === compId && u.role === 'Worker');
      if (workers.length === 0) {
        return `No field technicians are currently registered under **${comp.name}**.`;
      }

      const statusList = workers.map(w => {
        const isBusy = allOrders.some(o => o.stage !== 'Completed' && (o.stages || []).some(s => s.assignedWorkerId === w.id && s.status === 'In Progress'));
        return `- **${w.name}**: ${isBusy ? '🔴 **BUSY** (Active Stage in progress)' : '🟢 **FREE** (Available for dispatch)'}`;
      }).join("\n");

      return `### 👷 Technician Availability Roster\n\n${statusList}`;
    }

    // 3. Company Overview / Stats / Revenue / Analytics
    if (q.includes("overview") || q.includes("stat") || q.includes("revenue") || q.includes("summary") || q.includes("metric") || q.includes("kpi")) {
      if (user.role !== 'Owner' && user.role !== 'Manager') {
        const myOrders = allOrders.filter(o => o.customerId === user.id);
        return `Your customer account is currently linked to **${comp.name}**. You have **${myOrders.length}** service requests on file.`;
      }

      const completed = allOrders.filter(o => o.stage === 'Completed').length;
      const inProgress = allOrders.filter(o => o.stage === 'In Progress').length;
      const totalVal = allOrders.reduce((sum, o) => sum + (o.value || 0), 0);
      const workers = allUsers.filter(u => u.companyId === compId && u.role === 'Worker');
      const freeWorkers = workers.filter(w => !allOrders.some(o => o.stage !== 'Completed' && (o.stages || []).some(s => s.assignedWorkerId === w.id && s.status === 'In Progress'))).length;

      return `### 📊 Live Operations Summary for ${comp.name}\n\n` +
        `- **Total Field Orders**: ${allOrders.length}\n` +
        `- **Active Progress**: ${inProgress} in progress • ${completed} completed\n` +
        `- **Total Booked Value**: ₹${totalVal.toLocaleString()}\n` +
        `- **Technicians**: ${workers.length} registered (${freeWorkers} free, ${workers.length - freeWorkers} busy)\n` +
        `- **Operational Domains**: ${domains.length} active service scopes\n` +
        `- **Minimum Order Threshold**: ₹${(comp.minOrderValue || 2000).toLocaleString()}`;
    }

    // 4. Domains / Scopes
    if (q.includes("domain") || q.includes("trade") || q.includes("scope")) {
      if (domains.length === 0) {
        return `No operational domains registered for **${comp.name}**.`;
      }
      const domList = domains.map(d => `- **${d.name}** (${d.type}) — *Status: ${d.status}*`).join("\n");
      return `### 🛠️ Authorized Operational Domains\n\n${domList}`;
    }

    // 5. Default Contextual Guidance
    return `Hello **${user.name}** (${user.role} • ${comp.name})!\n\nI have real-time access to your live company data. Here is what you can ask me:\n\n` +
      `1. 📋 **"What is my current order status?"** — View active dispatches and stage progress.\n` +
      `2. 👷 **"Check worker availability"** — Live status on who is Free vs Busy.\n` +
      `3. 📊 **"Give me a company overview"** — Summary of orders, revenue, and technicians.\n` +
      `4. 🛠️ **"List company operational domains"** — View authorized trade scopes.`;
  };

  // Audio Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load chat sessions when drawer is opened
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      if (api.getToken()) {
        const res = await api.chatbot.getSessions();
        if (res.success && res.sessions) {
          setSessions(res.sessions);
        }
      }
    } catch (err) {
      console.warn("Could not load past sessions from backend:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load a past session
  const selectSession = async (sessionId: string) => {
    setLoading(true);
    setShowHistory(false);
    try {
      const res = await api.chatbot.getSession(sessionId);
      if (res.success && res.messages) {
        setMessages(
          res.messages.map((m, idx) => ({
            id: `msg_${idx}_${Date.now()}`,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp || new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load session:", err);
    } finally {
      setLoading(false);
    }
  };

  // Start a new chat session
  const handleNewChat = async () => {
    setMessages([]);
    setShowHistory(false);
    try {
      if (api.getToken()) {
        await api.chatbot.clearHistory();
      }
    } catch (err) {
      console.warn("Clear history backend call failed:", err);
    }
  };

  // Send text query (Dual-Layer: Backend LLM + Live Store Fallback)
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    if (!user) {
      const assistantMsg: ChatMessage = {
        id: `asst_err_${Date.now()}`,
        role: "assistant",
        isError: true,
        content: "⚠️ You are not signed in. Please log in to your VendorOS account to query your company's live data.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      return;
    }

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      let reply = "";
      try {
        const res = await api.chatbot.query(query);
        if (res && res.reply) {
          reply = res.reply;
        } else {
          reply = resolveLocalChatbotQuery(query);
        }
      } catch (backendErr) {
        console.warn("Backend chatbot API offline, resolving via live store intelligence:", backendErr);
        reply = resolveLocalChatbotQuery(query);
      }

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const assistantMsg: ChatMessage = {
        id: `asst_err_${Date.now()}`,
        role: "assistant",
        isError: true,
        content: `⚠️ ${err?.message || "I couldn't produce an answer. Please try again."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await processVoiceBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access was denied. Please allow microphone permissions to use voice queries.");
    }
  };

  // Stop voice recording and submit
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  // Process recorded audio blob
  const processVoiceBlob = async (blob: Blob) => {
    if (!user) {
      const errorMsg: ChatMessage = {
        id: `asst_voice_err_${Date.now()}`,
        role: "assistant",
        isError: true,
        content: "⚠️ You are not signed in. Please log in to your VendorOS account to use voice query.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    setLoading(true);

    try {
      let transcript = "";
      let reply = "";

      try {
        const res = await api.chatbot.voiceQuery(blob);
        transcript = res.transcript?.trim() || "";
        reply = res.reply || "";
      } catch (backendErr) {
        console.warn("Backend voice query offline:", backendErr);
        transcript = "[Spoken Voice Query]";
        reply = "Voice transcription is connecting to the backend service. In the meantime, you can type your query directly to look up orders, technician availability, and company metrics.";
      }

      const userMsg: ChatMessage = {
        id: `user_voice_${Date.now()}`,
        role: "user",
        content: transcript ? `🎙️ "${transcript}"` : "🎙️ [Spoken audio query]",
        isVoice: true,
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: ChatMessage = {
        id: `asst_voice_${Date.now()}`,
        role: "assistant",
        content: reply || "I couldn't produce an answer for that — please try again.",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMsg, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `asst_voice_err_${Date.now()}`,
        role: "assistant",
        isError: true,
        content: `⚠️ ${err?.message || "Couldn't process that voice note. Please try again, or type your question instead."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Role-specific quick action chips in origin monochromatic palette
  const renderQuickChips = () => {
    const role = user?.role || "Customer";
    if (role === "Owner" || role === "Manager") {
      return (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => handleSendMessage("List my recent orders and their current status")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <Package className="w-3 h-3 text-white" />
            <span>{t("recentOrders", "Recent Orders")}</span>
          </button>
          <button
            onClick={() => handleSendMessage("Are any technicians or workers free right now?")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-3 h-3 text-white" />
            <span>{t("workerAvailability", "Worker Availability")}</span>
          </button>
          <button
            onClick={() => handleSendMessage("Check risk scores and delay predictions")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <AlertTriangle className="w-3 h-3 text-white" />
            <span>{t("delayRisk", "Delay Risk")}</span>
          </button>
          <button
            onClick={() => handleSendMessage("Check current stock and raw material inventory")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <Boxes className="w-3 h-3 text-white" />
            <span>{t("inventoryStock", "Inventory Stock")}</span>
          </button>
        </div>
      );
    }

    if (role === "Worker") {
      return (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => handleSendMessage("What tasks and orders are assigned to me today?")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>{t("myAssignedTasks", "My Assigned Tasks")}</span>
          </button>
          <button
            onClick={() => handleSendMessage("Which checklist items are still pending completion?")}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
          >
            <Clock className="w-3 h-3 text-white" />
            <span>{t("pendingChecklists", "Pending Checklists")}</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5 pt-2">
        <button
          onClick={() => handleSendMessage("Where is my order and what is its status?")}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
        >
          <Package className="w-3 h-3 text-white" />
          <span>{t("trackMyOrder", "Track My Order")}</span>
        </button>
        <button
          onClick={() => handleSendMessage("Show all my active service orders")}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-white/15 hover:border-white/30 rounded-full text-[11px] font-mono text-[#FAFAFA] transition-all cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="w-3 h-3 text-white" />
          <span>{t("myOrders", "My Orders")}</span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner (Origin Obsidian & Stark White Palette) */}
      <div className="floating-chatbot-root fixed bottom-6 right-6 z-50 flex items-center space-x-3 select-none">
        {/* Teaser pill (when closed) */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-[#09090B] hover:bg-[#18181B] border border-white/25 rounded-full shadow-2xl text-xs font-mono text-white cursor-pointer transition-all hover:border-white/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold text-white">VendorOS Copilot</span>
          </motion.div>
        )}

        {/* Hovering Orb / Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`relative p-3.5 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center min-w-[48px] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 ${
            isOpen
              ? "bg-[#18181B] text-white border border-white/30"
              : "bg-[#09090B] text-white border border-white/25 hover:border-white/50 shadow-black/80"
          }`}
          title={isOpen ? "Close AI Copilot" : "Open VendorOS AI Copilot"}
          aria-label={isOpen ? "Close AI Copilot" : "Open VendorOS AI Copilot"}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-white" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black animate-ping" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-black" />
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Panel (Origin Monochrome Obsidian Palette with Liquid Glass Diffusion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            role="dialog"
            aria-label="VendorOS AI Copilot Assistant"
            className="floating-chatbot-root fixed bottom-22 right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[82vh] bg-[#09090B]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden font-sans text-white ring-1 ring-white/10"
          >
            {/* Header */}
            <div className="p-3.5 bg-[#121215] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-sm">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white font-mono tracking-tight">
                      VendorOS Copilot
                    </span>
                    <span className="px-1.5 py-0.5 bg-white/10 border border-white/20 text-[10px] font-mono text-neutral-200 rounded-sm font-semibold">
                      Gemini Live
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A1A1AA] font-mono block">
                    Whisper Voice & Multi-Tool
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center space-x-1 text-neutral-300">
                <button
                  onClick={() => {
                    setShowHistory(prev => !prev);
                    if (!showHistory) loadSessions();
                  }}
                  title="Past conversations"
                  aria-label="Past conversations"
                  className="p-2 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNewChat}
                  title="New conversation"
                  aria-label="Start new conversation"
                  className="p-2 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize assistant"
                  aria-label="Minimize assistant"
                  className="p-2 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sessions History Drawer */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#121215] border-b border-white/10 p-3 max-h-[220px] overflow-y-auto space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-300 pb-1 border-b border-white/5 font-semibold">
                    <span>Recent Conversations</span>
                    <button
                      onClick={handleNewChat}
                      className="text-white hover:text-neutral-300 text-xs flex items-center space-x-1 cursor-pointer font-bold py-1 px-1.5 rounded-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Start Fresh</span>
                    </button>
                  </div>

                  {loadingSessions ? (
                    <div className="py-4 text-center text-xs text-neutral-300 font-mono flex items-center justify-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Loading history...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-3 text-center text-xs text-neutral-400 font-mono">
                      No previous sessions recorded.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {sessions.map((sess) => (
                        <button
                          key={sess.id}
                          onClick={() => selectSession(sess.id)}
                          className="w-full text-left p-2.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-xs font-mono text-white transition-all flex items-center justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                        >
                          <span className="truncate pr-2 font-medium">{sess.title}</span>
                          <span className="text-xs text-[#A1A1AA] flex-shrink-0">
                            {sess.messageCount} msgs
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-[#09090B]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center text-white shadow-inner">
                    <Bot className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">
                      Welcome, {user?.name || "User"}
                    </h3>
                    <p className="text-xs text-neutral-300 font-mono mt-1 max-w-[280px] mx-auto leading-relaxed">
                      {t("botWelcome", "Ask operational questions in English, Hindi, or Punjabi, or speak into the microphone.")}
                    </p>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="w-full text-left pt-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
                      {t("quickInquiries", "Quick Inquiries:")}
                    </span>
                    {renderQuickChips()}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-mono shadow-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-[#27272A] text-white rounded-br-none border border-white/20"
                          : m.isError
                          ? "bg-amber-950/30 text-amber-200 rounded-bl-none border border-amber-500/40 shadow-md"
                          : "bg-[#18181B] text-neutral-100 rounded-bl-none border border-white/15 shadow-md"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[11px] text-[#888888] font-mono mt-1 px-1">
                      {m.role === "user" ? "You" : "VendorOS AI"} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}

              {/* Typing / Loading indicator */}
              {loading && (
                <div 
                  role="status"
                  aria-live="polite"
                  className="flex items-center space-x-2 p-2 rounded-xl bg-[#18181B] border border-white/15 max-w-[150px]"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="text-xs font-mono text-neutral-200">Processing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Voice Recording Banner Overlay (when speaking) */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  role="status"
                  aria-live="polite"
                  className="bg-[#1C0D0D] border-t border-red-500/40 p-3 flex items-center justify-between text-white"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                    <span className="text-xs font-mono font-bold text-red-200">
                      Recording ({recordingDuration}s)...
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={cancelRecording}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-md text-xs font-mono text-neutral-200 cursor-pointer min-h-[32px]"
                      aria-label="Cancel voice recording"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-mono font-bold flex items-center space-x-1.5 cursor-pointer min-h-[32px]"
                      aria-label="Submit voice recording"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar (Origin Monochrome Palette) */}
            <div className="p-3 bg-[#121215] border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t("botPlaceholder", "Ask about orders, risk, workers, stock...")}
                  disabled={loading || isRecording}
                  aria-label="Query VendorOS AI Copilot"
                  className="flex-1 bg-[#18181B] border border-white/15 focus:border-white/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 transition-colors"
                />

                {/* Microphone / Audio toggle */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  title={isRecording ? "Stop Recording" : "Voice Query (Whisper)"}
                  aria-label={isRecording ? "Stop voice recording" : "Record voice query"}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 ${
                    isRecording
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-[#18181B] text-neutral-200 hover:text-white border-white/15 hover:border-white/30"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button — Pure Stark White CTA */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading || isRecording}
                  aria-label="Send message"
                  className="p-2.5 bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white text-black font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-md min-w-[40px] min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;

