import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layers, Shield, Mail, Key, UserCheck, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onNavigateToSignUp: () => void;
  onNavigateToPublic?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToSignUp, onNavigateToPublic }) => {
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState<'vendor' | 'customer'>('vendor');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError('');
    setLoading(true);

    try {
      await login(email);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setLoading(false);
    }
  };

  const handlePrepopulate = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Centered Logo block */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center mx-auto w-10 h-10 bg-white rounded-sm text-black">
          <Layers className="w-5 h-5" />
        </div>
        <h2 className="mt-6 text-4xl font-light font-serif italic text-white tracking-tight">
          Welcome to VendorOS
        </h2>
        <p className="mt-2 text-xs uppercase tracking-widest text-[#666666] font-sans">
          B2B Operations & Field Service Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111111] py-8 px-4 border border-[#222222] rounded-sm sm:px-10"
        >
          {/* Tabs Selector */}
          <div className="flex bg-[#0A0A0A] p-1 border border-[#222222] rounded-sm mb-6">
            <button
              type="button"
              onClick={() => { setRoleType('vendor'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                roleType === 'vendor'
                  ? 'bg-white text-black font-extrabold'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              Vendor Member
            </button>
            <button
              type="button"
              onClick={() => { setRoleType('customer'); setError(''); }}
              className={`flex-1 py-2 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all ${
                roleType === 'customer'
                  ? 'bg-white text-black font-extrabold'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              Client / Customer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-sm text-xs font-semibold text-red-400 flex items-center font-mono">
                <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-sm shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative rounded-sm shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-white hover:bg-[#E5E5E5] text-black text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="font-mono text-[10px] tracking-widest uppercase">Authenticating Claims...</span>
              ) : (
                <>
                  <span className="tracking-widest">Sign In</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Preset Accounts Prepopulation Section (Extremely Useful for Verification!) */}
          <div className="mt-6 pt-6 border-t border-[#1A1A1A]">
            <span className="text-[9px] font-mono font-bold text-[#444444] uppercase tracking-widest block mb-3 flex items-center">
              <UserCheck className="w-3.5 h-3.5 mr-1 text-[#666666]" />
              Demo Accounts Quick Access:
            </span>
            <div className="flex flex-wrap gap-2">
              {roleType === 'vendor' ? (
                <>
                  <button
                    onClick={() => handlePrepopulate('alice@apex.com')}
                    className="text-[10px] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white px-2.5 py-1.5 rounded-sm border border-[#222222] hover:border-[#444444] transition-all font-mono font-semibold"
                  >
                    Alice (Owner)
                  </button>
                  <button
                    onClick={() => handlePrepopulate('bob@apex.com')}
                    className="text-[10px] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white px-2.5 py-1.5 rounded-sm border border-[#222222] hover:border-[#444444] transition-all font-mono font-semibold"
                  >
                    Bob (Manager)
                  </button>
                  <button
                    onClick={() => handlePrepopulate('charlie@apex.com')}
                    className="text-[10px] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white px-2.5 py-1.5 rounded-sm border border-[#222222] hover:border-[#444444] transition-all font-mono font-semibold"
                  >
                    Charlie (Worker)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handlePrepopulate('dave@gmail.com')}
                  className="text-[10px] bg-[#0A0A0A] hover:bg-[#1A1A1A] text-[#888888] hover:text-white px-2.5 py-1.5 rounded-sm border border-[#222222] hover:border-[#444444] transition-all font-mono font-semibold"
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
                className="font-mono text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-widest bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 hover:border-emerald-800/40 px-4 py-2 rounded-sm cursor-pointer transition-all w-full"
              >
                Place Self-Serve Order (Guest)
              </button>
            )}
            <div className="text-xs">
              <span className="text-[#666666]">Don't have an account? </span>
              <button
                onClick={onNavigateToSignUp}
                className="font-bold uppercase tracking-wider text-[10px] text-white hover:text-[#888888] underline focus:outline-none cursor-pointer"
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
