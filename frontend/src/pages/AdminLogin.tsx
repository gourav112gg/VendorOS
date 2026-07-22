import React, { useState } from 'react';
import { useSuperAdmin } from '../context/AdminContext';
import { ShieldCheck, Key, Mail, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-center items-center p-4 font-mono select-none">
      {/* Background ambient security glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/20 via-[#09090B] to-[#09090B] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl p-8 relative z-10 space-y-6"
      >
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center border-b border-[#27272A] pb-6">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 text-white shadow-inner">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#A1A1AA] bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            Restricted Core Surface
          </span>
          <h1 className="text-xl font-bold tracking-wider text-[#FAFAFA] mt-3 uppercase font-display">
            VendorOS Super Admin
          </h1>
          <p className="text-[11px] text-[#A1A1AA] mt-1 font-mono">
            3-Factor Security Authentication Required
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-[#09090B] border border-[#27272A] p-3.5 rounded-lg flex items-start space-x-2.5 text-xs text-[#A1A1AA]">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#A1A1AA] leading-relaxed font-mono">
            Unauthorized access attempts are logged with IP addresses and subject to immediate 60-minute automated account lockouts.
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg font-mono flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Factor 1: Email */}
          <div>
            <label className="block text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1.5 font-bold">
              Factor 1: Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@vendoros.com"
                className="w-full pl-9 pr-3 py-2 bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-[#52525B] text-xs rounded-lg focus:outline-none focus:border-[#A1A1AA] transition-colors"
              />
            </div>
          </div>

          {/* Factor 2: Password */}
          <div>
            <label className="block text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1.5 font-bold">
              Factor 2: Master Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-[#52525B] text-xs rounded-lg focus:outline-none focus:border-[#A1A1AA] transition-colors"
              />
            </div>
          </div>

          {/* Factor 3: Static Passphrase */}
          <div>
            <label className="block text-[10px] text-[#A1A1AA] uppercase tracking-widest mb-1.5 font-bold">
              Factor 3: Secret Security Passphrase
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#09090B] border border-[#27272A] text-[#FAFAFA] placeholder-[#52525B] text-xs rounded-lg focus:outline-none focus:border-[#A1A1AA] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-widest rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-lg"
          >
            <span>{isLoading ? 'Authenticating...' : 'Authenticate & Unlock Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-3 border-t border-[#27272A]">
          <span className="text-[9px] text-[#71717A] uppercase font-bold tracking-widest">
            VendorOS Core Infrastructure • Immutable Security Trail Active
          </span>
        </div>
      </motion.div>
    </div>
  );
};
