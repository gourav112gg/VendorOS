import React, { useState, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider, useTranslation } from "./context/LanguageContext";
import { Navigation } from "./components/Navigation";
import { ThemeManager } from "./components/ThemeManager";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { LandingPage } from "./pages/LandingPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { ManagerDashboard } from "./pages/ManagerDashboard";
import { WorkerDashboard } from "./pages/WorkerDashboard";
import { CustomerDashboard } from "./pages/CustomerDashboard";
import { PublicCompanyProfile } from "./pages/PublicCompanyProfile";
import { AdminProvider, useSuperAdmin } from "./context/AdminContext";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ShortcutBadge } from "./components/ShortcutBadge";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  RefreshCw,
  Keyboard,
  HelpCircle,
  X,
  Terminal,
} from "lucide-react";

const SuperAdminPortalContent: React.FC = () => {
  const { admin, loading } = useSuperAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080606] flex items-center justify-center text-red-500 font-mono">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        <span>Verifying Admin Credentials...</span>
      </div>
    );
  }

  if (!admin) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};

const SuperAdminPortalApp: React.FC = () => {
  return (
    <AdminProvider>
      <SuperAdminPortalContent />
    </AdminProvider>
  );
};

const MainLayout: React.FC = () => {
  if (window.location.pathname.startsWith('/super-admin')) {
    return <SuperAdminPortalApp />;
  }
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [authScreen, setAuthScreen] = useState<
    "landing" | "login" | "signup" | "public"
  >("landing");
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in text inputs or textareas or contenteditables
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Toggle help modal on '?'
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
        return;
      }

      // Close help modal on 'Escape'
      if (e.key === "Escape") {
        setShowShortcutsHelp(false);
        return;
      }

      const isModifier = e.ctrlKey || e.altKey || e.metaKey;
      if (!isModifier) return;

      let targetTab: string | null = null;
      let shortcutLabel = "";

      if (key === "d") {
        targetTab = "overview";
        shortcutLabel = "Dashboard";
      } else if (key === "s") {
        targetTab = "settings";
        shortcutLabel = "Settings";
      } else if (
        key === "c" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "copilot";
        shortcutLabel = "AI Copilot";
      } else if (
        key === "t" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "team";
        shortcutLabel = "Team Members";
      } else if (key === "o") {
        if (user.role === "Owner" || user.role === "Manager") {
          targetTab = "orders";
        } else if (user.role === "Worker") {
          targetTab = "jobs";
        } else if (user.role === "Customer") {
          targetTab = "requests";
        }
        shortcutLabel = "Orders & Jobs";
      } else if (
        key === "i" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "invoices";
        shortcutLabel = "Invoices";
      } else if (
        key === "a" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "analytics";
        shortcutLabel = "Analytics";
      } else if (
        key === "m" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "domains";
        shortcutLabel = "Operational Domains";
      } else if (
        key === "r" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "trust-score";
        shortcutLabel = "Trust Score";
      } else if (
        key === "b" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "billing";
        shortcutLabel = "Pricing & Billing";
      } else if (
        key === "l" &&
        (user.role === "Owner" || user.role === "Manager")
      ) {
        targetTab = "activity";
        shortcutLabel = "Activity Log";
      } else if (key === "h") {
        e.preventDefault();
        setShowShortcutsHelp((prev) => !prev);
        return;
      }

      if (targetTab) {
        e.preventDefault();
        // Dispatch custom navigation event
        window.dispatchEvent(
          new CustomEvent("vendoros-nav", { detail: targetTab }),
        );

        // Show trigger toast feedback
        setToastMsg(`Navigating to ${shortcutLabel}...`);
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = setTimeout(() => {
          setToastMsg(null);
        }, 1500) as any;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <ThemeManager />
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center space-x-3 text-white"
        >
          <RefreshCw className="w-4 h-4 animate-spin text-[#888888]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#888888]">
            Verifying Security Claims...
          </span>
        </motion.div>
      </div>
    );
  }

  if (authScreen === "landing") {
    return (
      <>
        <ThemeManager />
        <LandingPage
          onNavigateToLogin={() => setAuthScreen("login")}
          onNavigateToSignUp={() => setAuthScreen("signup")}
          onNavigateToPublic={() => setAuthScreen("public")}
        />
      </>
    );
  }

  if (authScreen === "public") {
    return (
      <>
        <ThemeManager />
        <PublicCompanyProfile onBackToLogin={() => setAuthScreen("login")} />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <ThemeManager />
        <AnimatePresence mode="wait">
          {authScreen === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <Login
                onNavigateToSignUp={() => setAuthScreen("signup")}
                onNavigateToPublic={() => setAuthScreen("public")}
                onNavigateToLanding={() => setAuthScreen("landing")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <SignUp
                onNavigateToLogin={() => setAuthScreen("login")}
                onNavigateToLanding={() => setAuthScreen("landing")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Define dashboard rendering based on custom claims role
  const renderDashboard = () => {
    switch (user.role) {
      case "Owner":
        return <OwnerDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "Worker":
        return <WorkerDashboard />;
      case "Customer":
        return <CustomerDashboard />;
      default:
        return (
          <div className="p-10 text-center text-red-500 font-mono text-xs uppercase tracking-widest bg-[#111111] border border-red-950/40 rounded-sm max-w-md mx-auto my-12">
            Unauthorized claim: Unknown security role.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col font-sans">
      <ThemeManager />
      {/* Universal Navigation bar customized by role and active claims */}
      <Navigation />

      {/* Main viewport frame with fluid entry animation */}
      <AnimatePresence mode="wait">
        <motion.main
          key={user.role}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-grow"
        >
          {renderDashboard()}
        </motion.main>
      </AnimatePresence>

      {/* Power User Shortcut Helper Dialog */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowShortcutsHelp(false)}
              className="absolute inset-0 bg-black backdrop-blur-sm"
            />

            {/* Dialog Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="relative w-full max-w-md bg-[#111111] border border-[#222222] p-5 rounded-sm shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                <div className="flex items-center space-x-2">
                  <Keyboard className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider">
                    Power User Shortcuts
                  </span>
                </div>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="text-[#666666] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5">
                <span className="text-[9px] font-mono font-bold text-[#666666] uppercase tracking-widest block">
                  Global Navigation Mappings
                </span>

                <div className="space-y-1.5 font-mono text-[10px]">
                  {/* Dashboard */}
                  <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                    <span className="text-[#888888] uppercase tracking-wide">
                      Main Dashboard / View
                    </span>
                    <ShortcutBadge tab="overview" />
                  </div>

                  {/* Settings */}
                  <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                    <span className="text-[#888888] uppercase tracking-wide">
                      Settings Control Panel
                    </span>
                    <ShortcutBadge tab="settings" />
                  </div>

                  {/* Orders */}
                  <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                    <span className="text-[#888888] uppercase tracking-wide">
                      Orders / Jobs / Requests
                    </span>
                    <ShortcutBadge tab="orders" />
                  </div>

                  {/* Role restricted shortcuts */}
                  {(user?.role === "Owner" || user?.role === "Manager") && (
                    <>
                      {/* AI Copilot */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          AI Copilot Hub
                        </span>
                        <ShortcutBadge tab="copilot" />
                      </div>

                      {/* Team */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Team Management
                        </span>
                        <ShortcutBadge tab="team" />
                      </div>

                      {/* Invoices */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Invoices & Billing
                        </span>
                        <ShortcutBadge tab="invoices" />
                      </div>

                      {/* Analytics */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Analytics Hub
                        </span>
                        <ShortcutBadge tab="analytics" />
                      </div>

                      {/* Domains */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Operational Domains
                        </span>
                        <ShortcutBadge tab="domains" />
                      </div>

                      {/* Trust Score */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Trust Score
                        </span>
                        <ShortcutBadge tab="trust-score" />
                      </div>

                      {/* Billing */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Pricing & Billing
                        </span>
                        <ShortcutBadge tab="billing" />
                      </div>

                      {/* Activity */}
                      <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                        <span className="text-[#888888] uppercase tracking-wide">
                          Activity Log
                        </span>
                        <ShortcutBadge tab="activity" />
                      </div>
                    </>
                  )}

                  {/* Toggle menu */}
                  <div className="flex items-center justify-between p-1.5 rounded-sm bg-[#0D0D0D] border border-[#1A1A1A]">
                    <span className="text-[#888888] uppercase tracking-wide">
                      Toggle This Cheat Sheet
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-[#1A1A1A] border border-[#333333] text-white rounded-sm text-[9px]">
                        ?
                      </kbd>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#222222] text-center text-[9px] text-[#555555] font-mono uppercase tracking-widest">
                Alt / Option key modifiers can also be used as fallback.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic shortcut activation notification pill */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 bg-[#111111] border border-emerald-500/40 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm shadow-2xl flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern, architectural minimalist footer */}
      <footer className="bg-[#111111] border-t border-[#222222] py-6 text-[10px] text-[#666666] font-mono">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <span className="uppercase tracking-widest opacity-80">
            {t('vendorOsEnvironment', 'VendorOS Operational Environment')}
          </span>

          <button
            onClick={() => setShowShortcutsHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161616] hover:bg-[#202020] border border-[#222222] hover:border-[#333333] text-[9px] uppercase tracking-wider text-[#888888] hover:text-white rounded-sm transition-all cursor-pointer font-mono"
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-500" />
            {t('pressShortcuts', 'Press "?" for Shortcuts')}
          </button>

          <span className="uppercase tracking-widest opacity-80">
            {t('allRightsReserved', `© ${new Date().getFullYear()} VendorOS Systems. All Rights Reserved.`)}
          </span>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
