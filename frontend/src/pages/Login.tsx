import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Check, Info } from "lucide-react";
import { motion } from "motion/react";
import { AuthForestBackground } from "../components/AuthForestBackground";
import { AuthHalftoneArtwork } from "../components/AuthHalftoneArtwork";

interface LoginProps {
  onNavigateToSignUp: () => void;
  onNavigateToPublic?: () => void;
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

export const Login: React.FC<LoginProps> = ({
  onNavigateToSignUp,
  onNavigateToLanding,
}) => {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleType, setRoleType] = useState<"owner" | "vendor" | "customer">(
    "owner"
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

  const handlePrepopulate = (presetEmail: string, role: "owner" | "vendor" | "customer") => {
    setEmail(presetEmail);
    setPassword("password123");
    setRoleType(role);
    setError("");
  };

  return (
    <div className="relative min-h-screen bg-[#6C7279] text-neutral-900 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Monochromatic Foggy Pine Forest Background */}
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

      {/* Main Dual-Panel Auth Card Matching Attached Reference Designs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-white/50 flex flex-col md:flex-row z-10"
      >
        {/* Left Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 md:p-12 bg-white flex flex-col justify-between">
          <div>
            {/* Top Brand Identity Lightning Icon */}
            <div className="mb-6 flex items-center justify-between">
              <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center text-sm font-bold shadow-md">
                ⚡
              </div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                VendorOS Auth
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl font-display font-bold text-black tracking-tight mb-1">
              Sign In
            </h1>
            <p className="text-xs font-mono text-neutral-500 mb-6">
              Continue to access your dashboard
            </p>

            {/* Role Selection Pill Bar */}
            <div className="bg-neutral-100 p-1 rounded-full flex items-center mb-6 font-mono text-[11px] border border-neutral-200">
              <button
                type="button"
                onClick={() => setRoleType("owner")}
                className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
                  roleType === "owner"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => setRoleType("vendor")}
                className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
                  roleType === "vendor"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Vendor
              </button>
              <button
                type="button"
                onClick={() => setRoleType("customer")}
                className={`flex-1 py-1.5 rounded-full font-bold transition-all ${
                  roleType === "customer"
                    ? "bg-black text-white shadow-md"
                    : "text-neutral-600 hover:text-black"
                }`}
              >
                Client
              </button>
            </div>

            {/* Social Login Pill Buttons */}
            <div className="space-y-2.5 mb-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-full text-xs font-mono text-neutral-800 flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer hover:border-neutral-400"
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
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-full text-xs font-mono text-neutral-800 flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer hover:border-neutral-400"
              >
                <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.09c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.87 1.47-.63.73-1.18 1.9-1.03 3.02 1.1.09 2.24-.56 2.91-1.39z" />
                </svg>
                <span>Sign in with Apple</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="absolute bg-white px-3 text-[10px] font-mono text-neutral-400 uppercase">
                OR
              </span>
            </div>

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-neutral-800 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono font-bold text-neutral-800">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setError("Password reset link sent to your email.")}
                    className="text-[10px] font-mono text-neutral-500 hover:text-black underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-full text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  {error}
                </div>
              )}

              {/* Primary Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-white rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] mt-2"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Quick Demo Prepopulate Pill Bar */}
            <div className="mt-5 pt-4 border-t border-neutral-100 text-center">
              <span className="text-[10px] font-mono text-neutral-400 block mb-2">
                Quick Demo Presets:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePrepopulate("saransh@gargops.com", "owner")}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[10px] font-mono text-neutral-700 transition-colors"
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => handlePrepopulate("amit@gargops.com", "vendor")}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[10px] font-mono text-neutral-700 transition-colors"
                >
                  Vendor
                </button>
                <button
                  type="button"
                  onClick={() => handlePrepopulate("dave@apex.com", "customer")}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 rounded-full text-[10px] font-mono text-neutral-700 transition-colors"
                >
                  Customer
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Nav / Subtext */}
          <div className="mt-6 pt-4 border-t border-neutral-100 text-center space-y-3 font-mono text-xs">
            <div className="text-neutral-500">
              Don't have an account?{" "}
              <button
                onClick={onNavigateToSignUp}
                className="text-black font-bold underline cursor-pointer hover:text-neutral-700"
              >
                Create an Account
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

        {/* Right Graphic Panel (Halftone Dot Dither Artwork) */}
        <div className="hidden md:block w-1/2 relative bg-white border-l border-neutral-200">
          <AuthHalftoneArtwork variant="dotmatrix" />
        </div>
      </motion.div>
    </div>
  );
};
