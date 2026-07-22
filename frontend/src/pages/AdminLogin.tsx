import React, { useState } from 'react';
import { useSuperAdmin } from '../context/AdminContext';
import { Shield, ShieldAlert, Key, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
  const { login } = useSuperAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, passphrase);
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080606] text-white flex flex-col justify-center items-center p-4 font-mono select-none">
      {/* Background ambient security glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-950/20 via-black to-black pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#100B0B] border border-red-950/60 rounded-sm shadow-2xl p-8 relative z-10 space-y-6"
      >
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center border-b border-red-950/40 pb-6">
          <div className="w-12 h-12 rounded-sm bg-red-950/60 border border-red-800/40 flex items-center justify-center mb-3 text-red-500 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-red-500 bg-red-950/40 border border-red-900/30 px-2.5 py-0.5 rounded-sm">
            Restricted Security Surface
          </span>
          <h1 className="text-xl font-bold tracking-wider text-white mt-2 uppercase">
            VendorOS Super Admin
          </h1>
          <p className="text-[11px] text-red-400/70 mt-1 font-mono">
            3-Factor Authentication Required
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#1C0D0D] border border-red-900/50 p-3 rounded-sm flex items-start space-x-2.5 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-red-300/80 leading-relaxed font-mono">
            Unauthorized access attempts are logged with IP addresses and subject to immediate 60-minute automated account lockouts.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-600 text-red-200 text-xs p-3 rounded-sm font-mono flex items-center space-x-2 animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Factor 1: Email */}
          <div>
            <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1 font-bold">
              Factor 1: Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-red-500/60 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vendoros.com"
                className="w-full pl-9 pr-3 py-2 bg-[#0A0707] border border-red-950 text-red-100 placeholder-red-950 text-xs rounded-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          {/* Factor 2: Password */}
          <div>
            <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1 font-bold">
              Factor 2: Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-red-500/60 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#0A0707] border border-red-950 text-red-100 placeholder-red-950 text-xs rounded-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          {/* Factor 3: Static Passphrase */}
          <div>
            <label className="block text-[10px] text-red-400 uppercase tracking-widest mb-1 font-bold">
              Factor 3: Secret Security Passphrase
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-red-500/60 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#0A0707] border border-red-950 text-red-100 placeholder-red-950 text-xs rounded-sm focus:outline-none focus:border-red-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-2.5 bg-red-900 hover:bg-red-800 border border-red-600/40 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Authenticate & Unlock Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-red-950/40">
          <span className="text-[9px] text-red-900 uppercase font-bold tracking-widest">
            VendorOS Core Infrastructure • Immutable Security Trail Active
          </span>
        </div>
      </motion.div>
    </div>
  );
};
