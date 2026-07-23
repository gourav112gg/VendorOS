import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import dbStore from "../services/store";
import { Company } from "../types";
import api from "../services/api";
import { ArrowLeft, CheckCircle, XCircle, Search } from "lucide-react";
import { motion } from "motion/react";
import { AuthForestBackground } from "../components/AuthForestBackground";
import { AuthAsciiArt } from "../components/AuthAsciiArt";
import { VendorOSLogo } from "../components/VendorOSLogo";

interface SignUpProps {
  onNavigateToLogin: () => void;
  onNavigateToLanding?: () => void;
}

const sanitizeErrorMessage = (message: string): string => {
  if (!message) return "An unexpected error occurred.";

  let clean = message
    .replace(/[a-zA-Z]:\\[\\\w\-\.\s]+/g, "[System Path]")
    .replace(/\/[\w\-\.\/]+\.(ts|tsx|js|jsx|json)/g, "[File]");

  if (clean.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized to run Google Sign-In. Please add this domain to the Firebase Console Authorized Domains list.";
  }
  if (clean.includes("auth/popup-closed-by-user")) {
    return "Sign-In popup closed before completing the authentication.";
  }

  return clean;
};

export const SignUp: React.FC<SignUpProps> = ({
  onNavigateToLogin,
  onNavigateToLanding,
}) => {
  const {
    registerOwner,
    registerManagerOrWorker,
    registerCustomer,
    loginWithGoogle,
  } = useAuth();

  // Role mode state: 'owner' (Start a Company) | 'employee' (Join as Vendor) | 'customer' (Client)
  const [signUpMode, setSignUpMode] = useState<
    "owner" | "employee" | "customer"
  >("owner");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Owner specific
  const [companyName, setCompanyName] = useState("");
  const [isCompanyAvailable, setIsCompanyAvailable] = useState<boolean | null>(
    null
  );

  // Employee specific
  const [role, setRole] = useState<"Manager" | "Worker">("Worker");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);

  // Fetch companies for dropdown list
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.companies.getAll();
        if (res && res.companies) {
          const mapped = res.companies.map((c: any) => ({
            id: c._id,
            name: c.companyName,
            createdAt: c.createdAt,
            minOrderValue: c.minimumOrderValue,
            subscription: c.subscription,
          }));
          setAllCompanies(mapped);
        } else {
          setAllCompanies(dbStore.getCompanies());
        }
      } catch (err) {
        setAllCompanies(dbStore.getCompanies());
      }
    };
    fetchCompanies();
  }, []);

  // Check company availability on typing
  useEffect(() => {
    if (!companyName.trim()) {
      setIsCompanyAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.companies.checkAvailability(companyName);
        setIsCompanyAvailable(res.available);
      } catch (err) {
        const localCompanies = dbStore.getCompanies();
        const exists = localCompanies.some(
          (c) => c.name.toLowerCase() === companyName.trim().toLowerCase()
        );
        setIsCompanyAvailable(!exists);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [companyName]);

  const handleGoogleSignUp = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || "Google Sign-Up failed."));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      if (signUpMode === "owner") {
        if (!companyName.trim()) {
          setError("Company Name is required.");
          setLoading(false);
          return;
        }
        if (isCompanyAvailable === false) {
          setError("Company Name is already taken. Please choose another.");
          setLoading(false);
          return;
        }
        await registerOwner(email, password, name, companyName, phone);
      } else if (signUpMode === "employee") {
        if (!selectedCompanyId) {
          setError("Please select a company to join.");
          setLoading(false);
          return;
        }
        await registerManagerOrWorker(
          email,
          password,
          name,
          role,
          selectedCompanyId,
          phone
        );
      } else {
        await registerCustomer(email, password, name, phone);
      }
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || "Registration failed."));
      setLoading(false);
    }
  };

  const filteredCompanies = allCompanies.filter((c) =>
    c.name.toLowerCase().includes(companySearchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-[#6C7279] text-neutral-900 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Foggy Pine Forest Background */}
      <AuthForestBackground />

      {/* Top Left Navigation Back Button */}
      {onNavigateToLanding && (
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={onNavigateToLanding}
            className="flex items-center space-x-2 px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-md border border-white/40 rounded-full text-xs font-mono text-neutral-800 shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        </div>
      )}

      {/* Main Dual-Panel Auth Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl w-full min-h-[540px] md:h-[620px] max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/50 flex flex-col md:flex-row z-10"
      >
        {/* Left Form Panel */}
        <div className="w-full md:w-1/2 h-full p-5 sm:p-6 bg-white flex flex-col justify-between overflow-y-auto scrollbar-none">
          <div>
            {/* Top Brand Identity Icon */}
            <div className="mb-3 flex items-center justify-between">
              <VendorOSLogo size="sm" textColor="text-black" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                Portal Onboarding
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-2xl font-display font-bold text-black tracking-tight mb-0.5">
              Create Account
            </h1>
            <p className="text-[11px] font-mono text-neutral-500 mb-3">
              Join VendorOS to streamline your work
            </p>

            {/* 3-Way Segmented Role Selection Pill Bar */}
            <div className="bg-neutral-100 p-0.5 rounded-full flex items-center mb-3 font-mono text-[10px] sm:text-[11px] border border-neutral-200">
              <button
                type="button"
                onClick={() => setSignUpMode("owner")}
                className={`flex-1 py-1 rounded-full font-bold transition-all ${
                  signUpMode === "owner"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Start a Company
              </button>
              <button
                type="button"
                onClick={() => setSignUpMode("employee")}
                className={`flex-1 py-1 rounded-full font-bold transition-all ${
                  signUpMode === "employee"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Join Vendor
              </button>
              <button
                type="button"
                onClick={() => setSignUpMode("customer")}
                className={`flex-1 py-1 rounded-full font-bold transition-all ${
                  signUpMode === "customer"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Client
              </button>
            </div>

            {/* Social Registration */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full py-1.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-full text-xs font-mono text-neutral-800 flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer hover:border-neutral-400 mb-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="absolute bg-white px-3 text-[10px] font-mono text-neutral-400 uppercase">
                OR
              </span>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3 font-mono">
              {/* Owner Mode: Company Name Input */}
              {signUpMode === "owner" && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Garg Operations & Co"
                      required
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black pr-10"
                    />
                    {isCompanyAvailable !== null && companyName.trim() && (
                      <div className="absolute right-3 top-2.5">
                        {isCompanyAvailable ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {isCompanyAvailable === false && (
                    <span className="text-[10px] text-red-500 mt-1 block">
                      Company name already exists.
                    </span>
                  )}
                </div>
              )}

              {/* Employee Mode: Role & Company Search */}
              {signUpMode === "employee" && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Role Type
                    </label>
                    <div className="flex bg-neutral-100 p-1 rounded-full border border-neutral-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setRole("Manager")}
                        className={`flex-1 py-1 rounded-full font-bold transition-all ${
                          role === "Manager"
                            ? "bg-black text-white"
                            : "text-neutral-600"
                        }`}
                      >
                        Manager
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("Worker")}
                        className={`flex-1 py-1 rounded-full font-bold transition-all ${
                          role === "Worker"
                            ? "bg-black text-white"
                            : "text-neutral-600"
                        }`}
                      >
                        Field Worker
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                      Select Company
                    </label>
                    <div className="relative mb-1">
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        placeholder="Search company..."
                        className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-300 rounded-full text-xs"
                      />
                    </div>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 focus:outline-none focus:border-black"
                    >
                      <option value="">-- Choose a company --</option>
                      {filteredCompanies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-800 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              {/* Error Display Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] mt-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Bottom Nav / Subtext */}
          <div className="mt-3 pt-2 border-t border-neutral-100 text-center space-y-1 font-mono text-xs">
            <div className="text-neutral-500">
              Already have an account?{" "}
              <button
                onClick={onNavigateToLogin}
                className="text-black font-bold underline cursor-pointer hover:text-neutral-700"
              >
                Sign In
              </button>
            </div>

            <div className="flex items-center justify-center space-x-3 text-[10px] text-neutral-400">
              <a href="#top" className="hover:text-neutral-600">Help</a>
              <span>/</span>
              <a href="#top" className="hover:text-neutral-600">Terms</a>
              <span>/</span>
              <a href="#top" className="hover:text-neutral-600">Privacy</a>
            </div>
          </div>
        </div>

        {/* Right Graphic Panel (Animated ASCII Art Landscape) */}
        <div className="hidden md:block w-1/2 h-full relative bg-white border-l border-neutral-200 overflow-hidden">
          <AuthAsciiArt variant="landscape" />
        </div>
      </motion.div>
    </div>
  );
};
