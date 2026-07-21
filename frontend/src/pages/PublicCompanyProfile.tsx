
import React, { useState, useEffect } from "react";
import dbStore from "../services/store";
import { Company, Domain, TrustScoreRecord, ServiceOrder } from "../types";
import {
  Building,
  ShieldCheck,
  Award,
  MapPin,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Mail,
  DollarSign,
} from "lucide-react";
import { motion } from "motion/react";

interface PublicCompanyProfileProps {
  onBackToLogin?: () => void;
}

export const PublicCompanyProfile: React.FC<PublicCompanyProfileProps> = ({
  onBackToLogin,
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [trustScore, setTrustScore] = useState<TrustScoreRecord | null>(null);

  // Self-serve placement form states
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [value, setValue] = useState<number>(2500);

  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    const list = dbStore.getCompanies();
    setCompanies(list);
    if (list.length > 0) {
      handleSelectCompany(list[0]);
    }
  }, []);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    // Load company domains
    const companyDomains = dbStore.getDomains(company.id);
    setDomains(companyDomains);

    // Load or generate Trust Score Record
    const scoreRecords = dbStore.getTrustScores(company.id);
    const record = scoreRecords[0] || {
      id: "ts_" + company.id,
      companyId: company.id,
      score:
        company.id === "comp_apex" ? 94 : company.id === "comp_volt" ? 88 : 82,
      factors: {
        orderCompletionRate: 95,
        inventoryLevelRating: 90,
        workerActivityScore: 85,
      },
      updatedAt: new Date().toISOString(),
    };
    setTrustScore(record);
    setSuccessOrder(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedCompany ||
      !customerName.trim() ||
      !customerEmail.trim() ||
      !title.trim() ||
      !address.trim()
    )
      return;
    setSubmitting(true);

    // Simulate database write
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Register customer locally in DB if not exists so they are a valid customer
    const existingUsers = dbStore.getUsers();
    let clientCust = existingUsers.find(
      (u) =>
        u.email.trim().toLowerCase() === customerEmail.trim().toLowerCase() &&
        u.role === "Customer",
    );
    if (!clientCust) {
      clientCust = dbStore.registerCustomer(
        customerName.trim(),
        customerEmail.trim().toLowerCase(),
      );
    }

    const newOrder = dbStore.addOrder({
      companyId: selectedCompany.id,
      title: title.trim(),
      description: description.trim(),
      customerId: clientCust.id,
      customerName: clientCust.name,
      stage: "Unscheduled",
      address: address.trim(),
      latitude: 47.6062 + (Math.random() - 0.5) * 0.05,
      longitude: -122.3321 + (Math.random() - 0.5) * 0.05,
      value: Number(value),
    });

    setSuccessOrder(newOrder);
    setSubmitting(false);

    // Clear form except user details for convenience
    setTitle("");
    setDescription("");
    setAddress("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header Panel */}
      <div className="bg-[#0D0D0D] border-b border-[#222222] py-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center space-x-4">
            {onBackToLogin && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToLogin}
                className="p-2 border border-[#222222] bg-[#111111] hover:bg-[#222222] rounded-sm text-[#888888] hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
            )}
            <div>
              <h1 className="text-2xl font-serif italic font-light text-white flex items-center">
                <Building className="w-6 h-6 mr-2 text-[#888888]" />
                Public Service Directory
              </h1>
              <p className="text-xs text-[#666666] uppercase tracking-wider font-mono mt-1">
                Self-Serve Order Entry & Verified Company Profiles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-[#666666] uppercase">
              Select Company:
            </span>
            <div className="relative flex bg-[#111111] border border-[#222222] p-1.5 rounded-sm gap-1 shadow-md">
              {companies.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCompany(c)}
                  className={`relative px-3 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer ${
                    selectedCompany?.id === c.id
                      ? "text-black"
                      : "text-[#666666] hover:text-[#999999]"
                  }`}
                >
                  {selectedCompany?.id === c.id && (
                    <motion.span
                      layoutId="vos-public-company-pill"
                      className="absolute inset-0 -z-10 bg-white rounded-sm"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  {c.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Layout */}
      {selectedCompany && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="vos-stagger grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Company Stats & Domains */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
                <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block mb-1">
                  Provider Overview
                </span>
                <h2 className="text-3xl font-serif italic text-white font-light">
                  {selectedCompany.name}
                </h2>
                <div className="mt-4 flex items-center space-x-2 text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified License holder</span>
                </div>

                <p className="text-xs text-[#888888] leading-relaxed mt-4">
                  A fully licensed contracting firm utilizing VendorOS tracking
                  systems to ensure pristine compliance, live worker dispatch
                  transparency, and automated material updates.
                </p>

                <div className="mt-6 pt-6 border-t border-[#222222] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#666666] block uppercase tracking-wider">
                      Operational Registry
                    </span>
                    <span className="text-xs text-[#888888] font-mono mt-0.5 block">
                      Registered{" "}
                      {new Date(selectedCompany.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#666666] block uppercase tracking-wider text-right">
                      Service Rating
                    </span>
                    <span className="text-sm text-emerald-400 font-bold block text-right font-mono">
                      ★★★★★ 4.9/5
                    </span>
                  </div>
                </div>
              </div>

              {/* Trust Score Card */}
              {trustScore && (
                <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">
                      Verified Trust Score
                    </span>
                    <span className="font-mono text-xs text-white uppercase bg-[#222222] px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Award className="w-3 h-3 text-[#E5E5E5]" /> STABLE
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 pb-6 border-b border-[#222222]">
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-emerald-950/40 bg-[#0A2215]/30">
                      <span className="text-3xl font-mono text-emerald-400 font-bold">
                        {trustScore.score}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold absolute bottom-2">
                        /100
                      </span>
                    </div>
                    <div className="flex-grow">
                      <span className="text-sm font-semibold text-white block">
                        Excellent Rating
                      </span>
                      <p className="text-xs text-[#666666] mt-1 leading-snug">
                        Calculated from real-time execution telemetry. High
                        score denotes reliable scheduling, safe inventory
                        caches, and rapid fulfillment.
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 space-y-4 font-mono text-[10px] uppercase tracking-wider">
                    <div>
                      <div className="flex justify-between text-[#888888] mb-1">
                        <span>Fulfillment Integrity</span>
                        <span className="text-white font-bold">
                          {trustScore.factors.orderCompletionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] h-1 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${trustScore.factors.orderCompletionRate}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.2,
                          }}
                          className="bg-emerald-400 h-full rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[#888888] mb-1">
                        <span>Material Cache Level</span>
                        <span className="text-white font-bold">
                          {trustScore.factors.inventoryLevelRating}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1A1A1A] h-1 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${trustScore.factors.inventoryLevelRating}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                            delay: 0.3,
                          }}
                          className="bg-blue-400 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Operational Domains */}
              <div className="bg-[#111111] border border-[#222222] p-6 rounded-sm shadow-md">
                <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block mb-4">
                  Active Service Domains ({domains.length})
                </span>
                {domains.length === 0 ? (
                  <p className="text-xs text-[#666666] font-mono italic">
                    No active domains reported.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {domains.map((d) => (
                      <div
                        key={d.id}
                        className="p-3 bg-[#0D0D0D] border border-[#222222] rounded-sm flex items-center justify-between hover:border-[#333333] transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {d.name}
                          </span>
                          <span className="text-[10px] text-[#666666] font-mono uppercase tracking-wider mt-0.5 block">
                            {d.type}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 border border-emerald-950/40 text-[9px] font-mono uppercase font-bold tracking-widest text-emerald-400 bg-[#0D2A1D] rounded-sm">
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Self-Serve Order Placement */}
            <div className="lg:col-span-7">
              <div className="bg-[#111111] border border-[#222222] rounded-sm overflow-hidden shadow-md">
                <div className="p-6 bg-[#0A0A0A] border-b border-[#222222] flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-serif italic text-white font-light">
                      Self-Serve Order Intake
                    </h3>
                    <p className="text-xs text-[#666666] mt-1 font-mono uppercase tracking-wider">
                      Request service directly and track via verified dispatch
                    </p>
                  </div>
                  {selectedCompany.minOrderValue && (
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-[#666666] block uppercase tracking-wider">
                        Min Threshold
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold">
                        ₹{selectedCompany.minOrderValue.toLocaleString()} / $500
                      </span>
                    </div>
                  )}
                </div>

                {successOrder ? (
                  <div className="p-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-[#0D2A1D] border border-emerald-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/30">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-serif italic text-white">
                        Order Placed Successfully!
                      </h4>
                      <p className="text-xs text-[#888888] max-w-md mx-auto mt-2 leading-relaxed">
                        Your request has been successfully stored. Our
                        management staff has been notified to construct your
                        delivery stages and schedule technicians.
                      </p>
                    </div>

                    <div className="bg-[#0D0D0D] border border-[#222222] p-5 max-w-sm mx-auto rounded-sm text-left font-mono text-xs space-y-3">
                      <div className="flex justify-between border-b border-[#1A1A1A] pb-2 text-[#666666]">
                        <span>ORDER ID</span>
                        <span className="text-white font-bold">
                          {successOrder.id}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#1A1A1A] pb-2 text-[#666666]">
                        <span>EST. VALUE</span>
                        <span className="text-white font-bold">
                          ₹{successOrder.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-[#1A1A1A] pb-2 text-[#666666]">
                        <span>THRESHOLD STATUS</span>
                        {successOrder.belowMinimumThreshold ? (
                          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1 text-[10px]">
                            <AlertCircle className="w-3.5 h-3.5" /> Gated (Below
                            Min)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                            Auto-Accepted
                          </span>
                        )}
                      </div>
                      {successOrder.belowMinimumThreshold && (
                        <p className="text-[10px] text-amber-400/80 leading-relaxed pt-1 font-sans">
                          * Note: This order is below the company's configured
                          minimum threshold of{" "}
                          <strong>
                            ₹
                            {(
                              selectedCompany.minOrderValue || 2000
                            ).toLocaleString()}
                          </strong>
                          . It is held on the Owner's desk for acceptance before
                          dispatch.
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => setSuccessOrder(null)}
                        className="px-5 py-2.5 bg-white hover:bg-[#F0EAD8] text-black text-xs font-bold font-mono uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                      >
                        Submit Another Order
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="p-6 space-y-5">
                    {/* Customer Identification */}
                    <div className="bg-[#0D0D0D] p-4 rounded-sm border border-[#222222] space-y-4">
                      <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block font-bold">
                        Customer Contact Identity
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-wider mb-1.5">
                            Full Name *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#444444]">
                              <User className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Jane Doe"
                              className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-wider mb-1.5">
                            Email Address *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#444444]">
                              <Mail className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="email"
                              required
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="jane@example.com"
                              className="w-full pl-9 pr-4 py-2 bg-[#111111] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="space-y-4">
                      <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block font-bold">
                        Job Description
                      </span>

                      <div>
                        <label className="block text-[10px] font-mono font-medium text-[#888888] uppercase tracking-wider mb-1.5">
                          Job Title / Request Summary *
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Commercial Fuse Box Replacement"
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-medium text-[#888888] uppercase tracking-wider mb-1.5">
                          Problem / Job Specifications
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the exact requirements: stage instructions, access hours, specific tools needed..."
                          rows={4}
                          className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono font-medium text-[#888888] uppercase tracking-wider mb-1.5">
                            Service Location Address *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#444444]">
                              <MapPin className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="e.g. 101 Pine St, Seattle, WA"
                              className="w-full pl-9 pr-4 py-2 bg-[#0D0D0D] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white placeholder-[#333333]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono font-medium text-[#888888] uppercase tracking-wider mb-1.5 flex justify-between">
                            <span>Job Budget *</span>
                            {selectedCompany.minOrderValue && (
                              <span className="text-[9px] text-[#555555] font-mono">
                                Min: ₹{selectedCompany.minOrderValue}
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#444444]">
                              <DollarSign className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="number"
                              required
                              value={value}
                              onChange={(e) => setValue(Number(e.target.value))}
                              min={100}
                              className="w-full pl-9 pr-4 py-2 bg-[#0D0D0D] border border-[#222222] text-xs font-mono text-white rounded-sm focus:outline-none focus:ring-1 focus:ring-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Minimum order threshold warning warning */}
                    {selectedCompany.minOrderValue &&
                      value < selectedCompany.minOrderValue && (
                        <div className="p-3 bg-[#2D1D0F] border border-amber-950/40 rounded-sm text-amber-400 text-[11px] leading-relaxed flex items-start space-x-2.5">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>
                              Below Minimum Order Threshold Warning:
                            </strong>{" "}
                            Your proposed budget of{" "}
                            <strong>₹{value.toLocaleString()}</strong> is below
                            the provider's threshold of{" "}
                            <strong>
                              ₹{selectedCompany.minOrderValue.toLocaleString()}
                            </strong>
                            . Your order will require manual desk approval by
                            the Owner before staging and dispatch.
                          </div>
                        </div>
                      )}

                    <div className="pt-4 border-t border-[#222222] flex justify-end">
                      <motion.button
                        whileHover={{ y: submitting ? 0 : -1 }}
                        whileTap={{ scale: submitting ? 1 : 0.97 }}
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 bg-white hover:bg-[#F0EAD8] text-black font-bold font-mono text-xs uppercase tracking-wider rounded-sm shadow-md transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-30"
                      >
                        {submitting ? (
                          <span>Dispatching Order...</span>
                        ) : (
                          <>
                            <span>Submit Service Request</span>
                            <Send className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
