import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import dbStore from "../services/store";
import { Company, ServiceOrder } from "../types";
import {
  Plus,
  ClipboardList,
  CheckCircle,
  Clock,
  MapPin,
  Building,
  FileText,
  Send,
  X,
  AlertCircle,
  Settings,
} from "lucide-react";
import { motion } from "motion/react";
import { SettingsPanel } from "../components/SettingsPanel";
import { ShortcutBadge } from "../components/ShortcutBadge";

export const CustomerDashboard: React.FC = () => {
  const { user, preferences } = useAuth();

  const [activeTab, setActiveTab] = useState<"requests" | "settings">(
    "requests",
  );
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  // New request form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [value, setValue] = useState(150);
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = () => {
      setOrders(dbStore.getOrders(undefined, user.id));
      setCompanies(dbStore.getCompanies());
    };

    loadData();
    const unsubscribe = dbStore.subscribe(loadData);
    return () => unsubscribe();
  }, [user]);

  // Handle power user quick navigation shortcut custom events
  useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetTab = customEvent.detail;
      if (targetTab === "overview" || targetTab === "requests") {
        setActiveTab("requests");
      } else if (targetTab === "settings") {
        setActiveTab("settings");
      }
    };
    window.addEventListener("vendoros-nav", handleNav);
    return () => window.removeEventListener("vendoros-nav", handleNav);
  }, []);

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    if (preferences.currency === "INR") {
      return `₹${amount}`;
    }
    return `$${amount}`;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !title.trim() || !address.trim()) return;
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    dbStore.addOrder({
      companyId,
      title: title.trim(),
      description: description.trim(),
      customerId: user.id,
      customerName: user.name,
      stage: "Unscheduled",
      address: address.trim(),
      latitude: 47.6062 + (Math.random() - 0.5) * 0.05,
      longitude: -122.3321 + (Math.random() - 0.5) * 0.05,
      value: Number(value),
    });

    setSubmitting(false);
    setFormSuccess(true);

    // Clear form
    setTitle("");
    setDescription("");
    setAddress("");
    setValue(150);

    setTimeout(() => {
      setIsFormOpen(false);
      setFormSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <ClipboardList className="w-6 h-6 mr-2 text-[#666666]" />
                Service Portal
              </h1>
              <p className="text-[#666666] mt-1 text-[10px] font-mono uppercase tracking-widest">
                Customer Dashboard
              </p>
            </div>

            <div className="flex flex-col bg-[#111111] p-1.5 border border-[#222222] rounded-sm space-y-1 shadow-md">
              {(
                [
                  { id: "requests", label: "Requests", icon: null },
                  {
                    id: "settings",
                    label: "Settings",
                    icon: <Settings className="w-3.5 h-3.5" />,
                  },
                ] as const
              ).map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  whileHover={{ x: activeTab === t.id ? 0 : 2 }}
                  className={`relative w-full text-left px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest cursor-pointer flex items-center justify-between group ${
                    activeTab === t.id
                      ? "text-black font-extrabold"
                      : "text-[#666666] hover:text-[#AAAAAA]"
                  }`}
                >
                  {activeTab === t.id && (
                    <motion.span
                      layoutId="vos-customer-sidebar-pill"
                      className="absolute inset-0 -z-10 bg-white rounded-sm shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  <span className="flex items-center space-x-1.5">
                    {t.icon}
                    <span>{t.label}</span>
                  </span>
                  <ShortcutBadge
                    tab={t.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                  />
                </motion.button>
              ))}
            </div>

            {activeTab === "requests" && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (companies.length > 0) {
                    setCompanyId(companies[0].id);
                  }
                  setIsFormOpen(true);
                }}
                className="w-full flex items-center justify-center space-x-1.5 px-5 py-3 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit Request</span>
              </motion.button>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div
          className={
            preferences.navStyle === "sidebar"
              ? "lg:col-span-9 space-y-8"
              : "space-y-8"
          }
        >
          {/* Horizontal Header (only shown in horizontal mode) */}
          {preferences.navStyle !== "sidebar" && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-[#222222]">
              <div>
                <h1 className="text-3xl font-serif italic font-light text-white tracking-tight flex items-center">
                  <ClipboardList className="w-8 h-8 mr-3 text-[#666666]" />
                  My Service Portal
                </h1>
                <p className="text-[#666666] mt-1.5 text-xs font-mono uppercase tracking-widest">
                  Customer Dashboard • Submit requests, follow order progress,
                  and view completed jobs.
                </p>
              </div>

              <div className="flex items-center space-x-3 mt-4 md:mt-0">
                {/* Sub Navigation */}
                <div className="relative flex bg-[#111111] p-1.5 border border-[#222222] rounded-sm space-x-1 shadow-md">
                  {(
                    [
                      { id: "requests", label: "Requests", icon: null },
                      {
                        id: "settings",
                        label: "Settings",
                        icon: <Settings className="w-3.5 h-3.5" />,
                      },
                    ] as const
                  ).map((t) => (
                    <motion.button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`relative px-4 py-2 text-[10px] font-bold rounded-sm uppercase tracking-widest cursor-pointer flex items-center space-x-1.5 group ${
                        activeTab === t.id
                          ? "text-black"
                          : "text-[#666666] hover:text-[#AAAAAA]"
                      }`}
                    >
                      {activeTab === t.id && (
                        <motion.span
                          layoutId="vos-customer-tab-pill"
                          className="absolute inset-0 -z-10 bg-white rounded-sm shadow-sm"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 34,
                          }}
                        />
                      )}
                      {t.icon}
                      <span>{t.label}</span>
                      <ShortcutBadge
                        tab={t.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-1.5"
                      />
                    </motion.button>
                  ))}
                </div>

                {activeTab === "requests" && (
                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (companies.length > 0) {
                        setCompanyId(companies[0].id);
                      }
                      setIsFormOpen(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 px-5 py-3 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-[10px] font-bold uppercase tracking-widest shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Submit Request</span>
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {activeTab === "settings" ? (
            <SettingsPanel />
          ) : (
            /* Main Grid with Dynamic Sidebar Positioning */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* List Column */}
              <div
                className={`lg:col-span-5 space-y-4 ${
                  preferences.sidebarPosition === "right"
                    ? "lg:order-last"
                    : "lg:order-first"
                }`}
              >
                <h3 className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest mb-2">
                  My Service Tickets ({orders.length})
                </h3>
                {orders.length === 0 ? (
                  <div className="bg-[#111111] border border-[#222222] rounded-sm p-8 text-center text-[#666666]">
                    <ClipboardList className="w-10 h-10 mx-auto text-[#333333] mb-3" />
                    <p className="font-medium text-white text-sm">
                      No service tickets logged.
                    </p>
                    <p className="text-xs text-[#666666] mt-1 font-mono">
                      Click "Submit Request" to start.
                    </p>
                  </div>
                ) : (
                  <div className="vos-stagger space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {orders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id;
                      const companyName =
                        companies.find((c) => c.id === order.companyId)?.name ||
                        "Vendor Company";
                      return (
                        <motion.button
                          key={order.id}
                          whileHover={{ y: -2 }}
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 24,
                          }}
                          onClick={() => setSelectedOrder(order)}
                          className={`w-full text-left p-5 rounded-sm border cursor-pointer ${
                            isSelected
                              ? "bg-[#1A1A1A] border-[#444444] text-white shadow-md"
                              : "bg-[#111111] border-[#222222] hover:border-[#333333] text-[#E5E5E5] shadow-sm"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm ${
                                isSelected
                                  ? "bg-[#333333] text-white"
                                  : "bg-[#0D0D0D] border border-[#222222] text-[#888888]"
                              }`}
                            >
                              {order.id}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-sm ${
                                order.stage === "Completed"
                                  ? "bg-[#0D2A1D] text-emerald-400 border border-emerald-950/40"
                                  : "bg-[#2D220D] text-amber-400 border border-amber-950/40"
                              }`}
                            >
                              {order.stage}
                            </span>
                          </div>

                          <h4
                            className={`text-base font-sans font-bold mt-3 leading-tight ${isSelected ? "text-white" : "text-[#E5E5E5]"}`}
                          >
                            {order.title}
                          </h4>

                          <p
                            className={`text-xs mt-1.5 flex items-center font-medium font-mono uppercase tracking-wider ${isSelected ? "text-emerald-400" : "text-emerald-500"}`}
                          >
                            <Building className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                            <span>{companyName}</span>
                          </p>

                          <div className="mt-4 pt-3 border-t border-[#222222] border-dashed flex justify-between items-center text-xs">
                            <span
                              className={
                                isSelected ? "text-white/80" : "text-[#888888]"
                              }
                            >
                              Estimated:{" "}
                              <span className="font-mono font-bold text-white">
                                {formatCurrency(order.value)}
                              </span>
                            </span>
                            {order.workerId && (
                              <span
                                className={`font-mono ${isSelected ? "text-white" : "text-[#888888]"}`}
                              >
                                Tech: {order.workerName}
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Details Column */}
              <div className="lg:col-span-7">
                {selectedOrder ? (
                  <motion.div
                    key={selectedOrder.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#111111] rounded-sm border border-[#222222] overflow-hidden shadow-md"
                  >
                    <div className="p-6 bg-[#0A0A0A] border-b border-[#222222]">
                      <span className="text-[10px] font-mono font-bold text-[#666666] uppercase tracking-widest">
                        Service Ticket: {selectedOrder.id}
                      </span>
                      <h2 className="text-xl font-serif italic font-light text-white mt-2 leading-snug">
                        {selectedOrder.title}
                      </h2>
                      <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center font-mono uppercase tracking-wider">
                        <Building className="w-3.5 h-3.5 mr-1 text-[#666666]" />
                        Assigned Provider:{" "}
                        {companies.find((c) => c.id === selectedOrder.companyId)
                          ?.name || "Vendor"}
                      </p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Status timelines */}
                      <div>
                        <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-4">
                          Order Status
                        </span>

                        <div className="space-y-6 relative pl-6 border-l-2 border-[#222222]">
                          {/* Stepper Node: Unscheduled */}
                          <div className="relative">
                            <div
                              className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                                selectedOrder.stage !== "Completed"
                                  ? "bg-[#333333] border-[#222222]"
                                  : "bg-emerald-500 border-emerald-950"
                              }`}
                            ></div>
                            <div>
                              <span className="text-xs font-bold text-white block">
                                Request Submitted
                              </span>
                              <span className="text-xs text-[#666666]">
                                Request received. Awaiting dispatch assignment.
                              </span>
                            </div>
                          </div>

                          {/* Stepper Node: Scheduled */}
                          <div className="relative">
                            <div
                              className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                                [
                                  "Scheduled",
                                  "Dispatched",
                                  "In Progress",
                                  "Completed",
                                ].includes(selectedOrder.stage)
                                  ? selectedOrder.stage === "Completed"
                                    ? "bg-emerald-500 border-emerald-950"
                                    : "bg-[#333333] border-[#222222]"
                                  : "bg-[#111111] border-[#222222]"
                              }`}
                            ></div>
                            <div>
                              <span
                                className={`text-xs font-bold block ${["Scheduled", "Dispatched", "In Progress", "Completed"].includes(selectedOrder.stage) ? "text-white" : "text-[#444444]"}`}
                              >
                                Technician Assigned
                              </span>
                              {selectedOrder.workerId ? (
                                <span className="text-xs text-[#888888]">
                                  Technician{" "}
                                  <strong className="text-white">
                                    {selectedOrder.workerName}
                                  </strong>{" "}
                                  has been allocated to your ticket.
                                </span>
                              ) : (
                                <span className="text-xs text-[#666666]">
                                  Waiting for a technician to be assigned.
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stepper Node: In Progress */}
                          <div className="relative">
                            <div
                              className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                                ["In Progress", "Completed"].includes(
                                  selectedOrder.stage,
                                )
                                  ? selectedOrder.stage === "Completed"
                                    ? "bg-emerald-500 border-emerald-950"
                                    : "bg-[#333333] border-[#222222]"
                                  : "bg-[#111111] border-[#222222]"
                              }`}
                            ></div>
                            <div>
                              <span
                                className={`text-xs font-bold block ${["In Progress", "Completed"].includes(selectedOrder.stage) ? "text-white" : "text-[#444444]"}`}
                              >
                                Work In Progress
                              </span>
                              <span className="text-xs text-[#888888]">
                                {selectedOrder.stage === "In Progress"
                                  ? "Technician is active on-site resolving your query."
                                  : selectedOrder.stage === "Completed"
                                    ? "Work on-site has been finalized."
                                    : "Technician will update when arriving on-site."}
                              </span>
                            </div>
                          </div>

                          {/* Stepper Node: Completed */}
                          <div className="relative">
                            <div
                              className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 ${
                                selectedOrder.stage === "Completed"
                                  ? "bg-emerald-500 border-emerald-950"
                                  : "bg-[#111111] border-[#222222]"
                              }`}
                            ></div>
                            <div>
                              <span
                                className={`text-xs font-bold block ${selectedOrder.stage === "Completed" ? "text-white" : "text-[#444444]"}`}
                              >
                                Service Completed
                              </span>
                              <span className="text-xs text-[#888888]">
                                {selectedOrder.stage === "Completed"
                                  ? "Job closed. Review logs in description."
                                  : "Awaiting on-site completion signature."}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="border-t border-[#222222] pt-6 space-y-4">
                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-1">
                            Service Location
                          </span>
                          <p className="text-sm text-white font-semibold flex items-center font-sans">
                            <MapPin className="w-4 h-4 text-[#666666] mr-1.5" />
                            {selectedOrder.address}
                          </p>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-medium text-[#666666] block uppercase tracking-widest mb-1">
                            Description
                          </span>
                          <div className="bg-[#0D0D0D] p-4 rounded-sm border border-[#222222] text-sm text-[#888888] whitespace-pre-wrap leading-relaxed">
                            {selectedOrder.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-[#111111] rounded-sm border border-[#222222] p-12 text-center text-[#666666] text-xs font-mono">
                    Please select a service ticket from the list to track its
                    real-time progress.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REQUEST NEW SERVICE FORM MODAL */}
          {isFormOpen && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#111111] rounded-sm border border-[#222222] shadow-2xl max-w-lg w-full overflow-hidden"
              >
                <div className="p-6 border-b border-[#222222] flex items-center justify-between bg-[#0A0A0A]">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-[#888888]" />
                    <h3 className="font-serif italic font-light text-lg text-white">
                      Submit New Service Request
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="p-1 text-[#666666] hover:text-white rounded-sm hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formSuccess ? (
                  <div className="p-12 text-center space-y-3">
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
                    <h4 className="font-sans font-bold text-xl text-white">
                      Request Dispatched!
                    </h4>
                    <p className="text-sm text-[#888888]">
                      Your ticket is logged and active in the system.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="p-6 space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                        Select Company / Service Provider *
                      </label>
                      <select
                        required
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono"
                      >
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                        What needs repair / Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Clogged Basement Drain Pipe"
                        className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono placeholder-[#333333]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                        Please describe the problem in detail
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail the issue: what requires maintenance or installation..."
                        className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono placeholder-[#333333]"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                        Service Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 523 Broadway East, Seattle, WA"
                        className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono placeholder-[#333333]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                        Estimated Budget (
                        {preferences.currency === "INR" ? "₹" : "$"}) *
                      </label>
                      <input
                        type="number"
                        required
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        min={50}
                        className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white text-xs font-mono placeholder-[#333333]"
                      />
                    </div>

                    <div className="pt-4 border-t border-[#222222] flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="px-4 py-2 rounded-sm text-xs font-semibold uppercase tracking-widest text-[#666666] hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-white hover:bg-[#F0EAD8] text-black rounded-sm text-xs font-bold uppercase tracking-widest transition-all flex items-center cursor-pointer"
                      >
                        {submitting ? "Submitting..." : "Submit Request"}
                        <Send className="w-3.5 h-3.5 ml-1.5" />
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

