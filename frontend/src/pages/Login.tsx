
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Layers,
  Shield,
  Mail,
  Key,
  UserCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { motion } from "motion/react";
import { AuthAmbientBackground } from "../components/AuthAmbientBackground";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTranslation } from "../context/LanguageContext";

interface LoginProps {
  onNavigateToSignUp: () => void;
  onNavigateToPublic?: () => void;
}

const sanitizeErrorMessage = (message: string): string => {
  if (!message) return "An unexpected error occurred.";

  // Replace absolute Windows/Unix paths and files
  let clean = message
    .replace(/[a-zA-Z]:\\[\\\w\-\.\s]+/g, "[System Path]")
    .replace(/\/[\w\-\.\/]+\.(ts|tsx|js|jsx|json)/g, "[File]");

  // Handle specific Firebase domain/auth errors
  if (clean.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized to run Google Sign-In. Please add this domain to the Firebase Console Authorized Domains list.";
  }
  if (clean.includes("auth/popup-closed-by-user")) {
    return "Sign-In popup closed before completing the authentication.";
  }

  return clean;
};

export const Login: React.FC<LoginProps> = ({
  onNavigateToSignUp,
  onNavigateToPublic,
}) => {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"owner" | "vendor" | "customer">(
    "owner",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || "Google Sign-In failed."));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setError("");
    setLoading(true);

    try {
      await login(email, password, roleType);
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || "Login failed."));
      setLoading(false);
    }
  };

  const handlePrepopulate = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <div className="relative min-h-screen bg-[#0B1420] text-[#EDEDED] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <AuthAmbientBackground />

      {/* Top Language Switcher Bar */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Centered Logo block */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center mx-auto w-10 h-10 bg-[#1B3A5C] rounded-sm text-[#7FA0C4]">
          <Layers className="w-5 h-5" />
        </div>
        <h2 className="mt-6 text-4xl font-light font-serif italic text-[#6FA8FF] tracking-tight">
          Welcome to VendorOS
        </h2>
        <p className="mt-2 text-xs uppercase tracking-widest text-[#7C8B9C] font-sans">
          B2B Operations & Field Service Management
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111B29] py-8 px-4 border border-[#223245] rounded-sm sm:px-10 shadow-[0_8px_30px_-12px_rgba(30,58,46,0.25)]"
        >
          {/* Tabs Selector */}
          <div className="flex bg-[#0B1420] p-1 border border-[#223245] rounded-sm mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setRoleType("owner");
                setError("");
              }}
              className={`flex-1 py-2 text-[9px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                roleType === "owner"
                  ? "bg-[#1B3A5C] text-[#7FA0C4] font-extrabold"
                  : "text-[#7C8B9C] hover:text-[#6FA8FF]"
              }`}
            >
              Start a Company
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleType("vendor");
                setError("");
              }}
              className={`flex-1 py-2 text-[9px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                roleType === "vendor"
                  ? "bg-[#1B3A5C] text-[#7FA0C4] font-extrabold"
                  : "text-[#7C8B9C] hover:text-[#6FA8FF]"
              }`}
            >
              Join a Vendor
            </button>
            <button
              type="button"
              onClick={() => {
                setRoleType("customer");
                setError("");
              }}
              className={`flex-1 py-2 text-[9px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                roleType === "customer"
                  ? "bg-[#1B3A5C] text-[#7FA0C4] font-extrabold"
                  : "text-[#7C8B9C] hover:text-[#6FA8FF]"
              }`}
            >
              Client / Customer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-[#FBE9DD] border border-[#E3A876] rounded-sm text-xs font-semibold text-[#A8461E] flex items-center font-mono">
                <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-mono font-medium text-[#7C8B9C] uppercase tracking-widest mb-1.5"
              >
                Email Address
              </label>
              <div className="relative rounded-sm shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B5A88A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#223245] bg-[#0A1119] text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#E8B23D] focus:border-[#E8B23D] text-xs font-mono placeholder-[#45566B]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-mono font-medium text-[#7C8B9C] uppercase tracking-widest mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-sm shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#B5A88A]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#223245] bg-[#0A1119] text-[#EDEDED] focus:outline-none focus:ring-1 focus:ring-[#E8B23D] focus:border-[#E8B23D] text-xs font-mono placeholder-[#45566B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[#E8B23D] hover:bg-[#B85826] text-[#FFFCF5] text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="font-mono text-[10px] tracking-widest uppercase">
                  Authenticating Claims...
                </span>
              ) : (
                <>
                  <span className="tracking-widest">Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#223245]"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono text-[#B5A88A] uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-[#223245]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[#111B29] hover:bg-[#182636] text-[#6FA8FF] text-[11px] font-bold uppercase tracking-widest rounded-sm border border-[#223245] hover:border-[#6FA8FF] transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <svg
                className="w-3.5 h-3.5 mr-2"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.34 -0.03,-0.68 -0.09,-1H21.35z"
                  fill="#4285F4"
                />
                <path
                  d="M12,20.6c2.32,0 4.27,-0.77 5.7,-2.09l-3.3,-2.58c-0.91,0.61 -2.08,0.97 -3.3,0.97c-2.54,0 -4.7,-1.72 -5.47,-4.04H2.17v2.66c1.5,2.98 4.6,4.92 8.16,4.92z"
                  fill="#34A853"
                />
                <path
                  d="M6.53,12.92C6.46,12.5 6.42,12.06 6.42,11.6c0,-0.46 0.04,-0.9 0.11,-1.32V7.62H2.17c-0.45,0.9 -0.71,1.91 -0.71,2.98c0,1.07 0.26,2.08 0.71,2.98L6.53,12.92z"
                  fill="#FBBC05"
                />
                <path
                  d="M12,5.2c1.26,0 2.39,0.44 3.28,1.29l2.46,-2.46c-1.48,-1.38 -3.43,-2.23 -5.74,-2.23c-3.56,0 -6.66,1.94 -8.16,4.92L6.53,9.38C7.3,7.06 9.46,5.2 12,5.2z"
                  fill="#EA4335"
                />
              </svg>
              <span className="tracking-widest">Sign In with Google</span>
            </button>
          </form>

          {/* Preset Accounts Prepopulation Section (Extremely Useful for Verification!) */}
          <div className="mt-6 pt-6 border-t border-[#1B2836]">
            <span className="text-[9px] font-mono font-bold text-[#B5A88A] uppercase tracking-widest block mb-3 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-[#7C8B9C]" />
              Demo Accounts Quick Access:
            </span>
            <div className="flex flex-wrap gap-2">
              {roleType === "vendor" ? (
                <>
                  <button
                    onClick={() => handlePrepopulate("alice@apex.com")}
                    className="text-[10px] bg-[#0B1420] hover:bg-[#1B2836] text-[#A9B4C0] hover:text-[#6FA8FF] px-2.5 py-1.5 rounded-sm border border-[#223245] hover:border-[#6FA8FF] transition-all font-mono font-semibold"
                  >
                    Alice (Owner)
                  </button>
                  <button
                    onClick={() => handlePrepopulate("bob@apex.com")}
                    className="text-[10px] bg-[#0B1420] hover:bg-[#1B2836] text-[#A9B4C0] hover:text-[#6FA8FF] px-2.5 py-1.5 rounded-sm border border-[#223245] hover:border-[#6FA8FF] transition-all font-mono font-semibold"
                  >
                    Bob (Manager)
                  </button>
                  <button
                    onClick={() => handlePrepopulate("charlie@apex.com")}
                    className="text-[10px] bg-[#0B1420] hover:bg-[#1B2836] text-[#A9B4C0] hover:text-[#6FA8FF] px-2.5 py-1.5 rounded-sm border border-[#223245] hover:border-[#6FA8FF] transition-all font-mono font-semibold"
                  >
                    Charlie (Worker)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handlePrepopulate("dave@gmail.com")}
                  className="text-[10px] bg-[#0B1420] hover:bg-[#1B2836] text-[#A9B4C0] hover:text-[#6FA8FF] px-2.5 py-1.5 rounded-sm border border-[#223245] hover:border-[#6FA8FF] transition-all font-mono font-semibold"
                >
                  Dave (Customer)
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 text-center text-xs flex flex-col space-y-3 justify-center items-center">
            {onNavigateToPublic && (
              <button
                type="button"
                onClick={onNavigateToPublic}
                className="font-mono text-[10px] font-bold text-[] hover:text-[#6FA8FF] uppercase tracking-widest bg-[#132A44] hover:bg-[#D6E4D8] border border-[#B9CFBC] hover:border-[#3E6390] px-4 py-2 rounded-sm cursor-pointer transition-all w-full"
              >
                Place Self-Serve Order (Guest)
              </button>
            )}
            <div className="text-xs">
              <span className="text-[#7C8B9C]">Don't have an account? </span>
              <button
                onClick={onNavigateToSignUp}
                className="font-bold uppercase tracking-wider text-[10px] text-[#6FA8FF] hover:text-[#E8B23D] underline focus:outline-none cursor-pointer"
              >
                Sign Up Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
