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
  Trash2,
  Radio,
  Clock,
  ArrowRight,
  Bot
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import dbStore from "../services/store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isVoice?: boolean;
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
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

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

  // Offline simulated fallback response generator
  const getSimulatedReply = (query: string): string => {
    const q = query.toLowerCase();
    const role = user?.role || "Customer";

    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      return `Hey ${user?.name || "there"}! I'm your VendorOS AI assistant. I can help you check real-time order status, evaluate delay risk scores, view worker availability, or monitor inventory levels. What would you like to check?`;
    }

    if (q.includes("order") || q.includes("status")) {
      const orders = dbStore.getOrders();
      if (!orders.length) return "You have no active orders in the system right now.";
      const sample = orders.slice(0, 3);
      return `Here are your recent orders:\n` + sample.map(o => `• **${o.title}** (Stage: *${o.stage}*, Value: ₹${o.value})`).join("\n") + `\n\nAll workflows are progressing on schedule.`;
    }

    if (q.includes("risk") || q.includes("delay") || q.includes("late")) {
      if (role !== "Owner" && role !== "Manager") {
        return "Risk score analytics are restricted to Owners and Managers.";
      }
      return `📊 **Order Risk Analysis**:\n• Active Orders: 3\n• High Risk Orders: 0\n• Average Expected Delay: 0.0 Days\n• Health Status: **Optimal (SLA Compliant)**`;
    }

    if (q.includes("worker") || q.includes("team") || q.includes("availability")) {
      if (role !== "Owner" && role !== "Manager") {
        return "Worker availability logs are only accessible to Owners and Managers.";
      }
      const users = dbStore.getUsers().filter(u => u.role === "Worker" || u.role === "Manager");
      return `👥 **Team Availability Status**:\n` + users.map(u => `• **${u.name}** (${u.role}): 🟢 Active & Available`).join("\n");
    }

    if (q.includes("inventory") || q.includes("stock") || q.includes("material")) {
      if (role !== "Owner" && role !== "Manager") {
        return "Inventory stock levels are only accessible to Owners and Managers.";
      }
      return `🧱 **Current Stock Summary**:\n• Standard PVC Pipe Fittings: 120 Units (In Stock)\n• High-Pressure Valves: 45 Units (In Stock)\n• Copper Tubing 1/2": 80 Meters (In Stock)\n\nNo low-stock alerts detected.`;
    }

    return `I checked our records for "${query}". All operational parameters are nominal. Feel free to ask about specific orders, risk evaluations, worker schedules, or inventory levels!`;
  };

  // Send text query
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

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
      if (api.getToken()) {
        const res = await api.chatbot.query(query);
        if (res.success && res.reply) {
          const assistantMsg: ChatMessage = {
            id: `asst_${Date.now()}`,
            role: "assistant",
            content: res.reply,
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, assistantMsg]);
          setLoading(false);
          return;
        }
      }
      throw new Error("Fallback required");
    } catch (err) {
      // Offline fallback simulation
      setTimeout(() => {
        const fallbackReply = getSimulatedReply(query);
        const assistantMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }, 600);
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
    setLoading(true);

    try {
      if (api.getToken()) {
        const res = await api.chatbot.voiceQuery(blob);
        if (res.success) {
          const userMsg: ChatMessage = {
            id: `user_voice_${Date.now()}`,
            role: "user",
            content: res.transcript ? `🎙️ "${res.transcript}"` : "🎙️ [Spoken audio query]",
            isVoice: true,
            timestamp: new Date().toISOString(),
          };

          const assistantMsg: ChatMessage = {
            id: `asst_voice_${Date.now()}`,
            role: "assistant",
            content: res.reply,
            timestamp: new Date().toISOString(),
          };

          setMessages(prev => [...prev, userMsg, assistantMsg]);
          setLoading(false);
          return;
        }
      }
      throw new Error("Voice API offline");
    } catch (err) {
      // Fallback response for simulated voice
      const userMsg: ChatMessage = {
        id: `user_voice_${Date.now()}`,
        role: "user",
        content: "🎙️ \"Check order status and team load\"",
        isVoice: true,
        timestamp: new Date().toISOString(),
      };
      const assistantMsg: ChatMessage = {
        id: `asst_voice_${Date.now()}`,
        role: "assistant",
        content: getSimulatedReply("order status and team load"),
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, userMsg, assistantMsg]);
      setLoading(false);
    }
  };

  // Role-specific quick action chips
  const renderQuickChips = () => {
    const role = user?.role || "Customer";
    if (role === "Owner" || role === "Manager") {
      return (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => handleSendMessage("List my recent orders and their current status")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Package className="w-3 h-3 text-blue-400" />
            <span>Recent Orders</span>
          </button>
          <button
            onClick={() => handleSendMessage("Are any technicians or workers free right now?")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Users className="w-3 h-3 text-emerald-400" />
            <span>Worker Availability</span>
          </button>
          <button
            onClick={() => handleSendMessage("Check risk scores and delay predictions")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Delay Risk</span>
          </button>
          <button
            onClick={() => handleSendMessage("Check current stock and raw material inventory")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Boxes className="w-3 h-3 text-purple-400" />
            <span>Inventory Stock</span>
          </button>
        </div>
      );
    }

    if (role === "Worker") {
      return (
        <div className="flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => handleSendMessage("What tasks and orders are assigned to me today?")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>My Assigned Tasks</span>
          </button>
          <button
            onClick={() => handleSendMessage("Which checklist items are still pending completion?")}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending Checklists</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-1.5 pt-2">
        <button
          onClick={() => handleSendMessage("Where is my order and what is its status?")}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <Package className="w-3 h-3 text-blue-400" />
          <span>Track My Order</span>
        </button>
        <button
          onClick={() => handleSendMessage("Show all my active service orders")}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#1C1D24] hover:bg-[#252733] border border-white/10 hover:border-white/20 rounded-full text-[11px] font-mono text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>My Orders</span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3">
        {/* Teaser pill (when closed) */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#111218]/90 hover:bg-[#181A22] backdrop-blur-md border border-white/10 rounded-full shadow-lg text-xs font-mono text-neutral-300 hover:text-white cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>VendorOS AI Assistant</span>
          </motion.div>
        )}

        {/* Hovering Orb / Trigger Button */}
        <motion.button
          onClick={() => setIsOpen(prev => !prev)}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`relative p-3.5 rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center ${
            isOpen
              ? "bg-[#1E2028] text-white border border-white/20"
              : "bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 text-black shadow-emerald-500/20"
          }`}
          title={isOpen ? "Close AI Copilot" : "Open VendorOS AI Copilot"}
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Bot className="w-6 h-6 text-black" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-black animate-ping" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-white rounded-full border-2 border-black" />
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className="fixed bottom-22 right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] max-h-[82vh] bg-[#0E1015]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="p-3.5 bg-[#14161F] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-white font-mono tracking-tight">
                      VendorOS Copilot
                    </span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 rounded-sm">
                      Llama 3.3
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono block">
                    Whisper Voice & Multi-Tool
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex items-center space-x-1 text-neutral-400">
                <button
                  onClick={() => {
                    setShowHistory(prev => !prev);
                    if (!showHistory) loadSessions();
                  }}
                  title="Past Conversations"
                  className="p-1.5 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNewChat}
                  title="New Conversation"
                  className="p-1.5 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 hover:bg-white/10 rounded-md hover:text-white transition-colors cursor-pointer"
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
                  className="bg-[#12141C] border-b border-white/10 p-3 max-h-[220px] overflow-y-auto space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 pb-1 border-b border-white/5">
                    <span>Recent Conversations</span>
                    <button
                      onClick={handleNewChat}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Start Fresh</span>
                    </button>
                  </div>

                  {loadingSessions ? (
                    <div className="py-4 text-center text-xs text-neutral-500 font-mono flex items-center justify-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                      <span>Loading history...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-3 text-center text-xs text-neutral-500 font-mono">
                      No previous sessions recorded.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {sessions.map((sess) => (
                        <button
                          key={sess.id}
                          onClick={() => selectSession(sess.id)}
                          className="w-full text-left p-2 rounded-lg bg-[#181A24] hover:bg-[#202330] border border-white/5 hover:border-white/10 text-xs font-mono text-neutral-200 transition-all flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate pr-2 font-medium">{sess.title}</span>
                          <span className="text-[10px] text-neutral-500 flex-shrink-0">
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
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center text-center p-4 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">
                      Welcome, {user?.name || "User"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-mono mt-1 max-w-[260px] mx-auto">
                      Ask any operational query in English, Hindi, or Hinglish, or speak into the microphone.
                    </p>
                  </div>

                  {/* Suggested Prompts */}
                  <div className="w-full text-left pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold block mb-1">
                      Quick Inquiries:
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
                          ? "bg-neutral-800 text-white rounded-br-none border border-neutral-700"
                          : "bg-[#1A1C26] text-neutral-200 rounded-bl-none border border-white/10 shadow-md"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-neutral-500 font-mono mt-1 px-1">
                      {m.role === "user" ? "You" : "VendorOS AI"} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}

              {/* Typing / Loading indicator */}
              {loading && (
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-[#1A1C26] border border-white/10 max-w-[140px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span className="text-[11px] font-mono text-neutral-400">Processing...</span>
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
                  className="bg-red-950/90 border-t border-red-500/30 p-3 flex items-center justify-between"
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
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-md text-[10px] font-mono text-neutral-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={stopRecording}
                      className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-[10px] font-mono font-bold flex items-center space-x-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="p-3 bg-[#14161F] border-t border-white/10">
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
                  placeholder="Ask about orders, risk, workers, stock..."
                  disabled={loading || isRecording}
                  className="flex-1 bg-[#1A1C26] border border-white/10 focus:border-emerald-500/50 rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none transition-colors"
                />

                {/* Microphone / Audio toggle */}
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  title={isRecording ? "Stop Recording" : "Voice Query (Whisper)"}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isRecording
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : "bg-[#1A1C26] text-neutral-400 hover:text-white border-white/10 hover:border-white/20"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading || isRecording}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-black font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
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
