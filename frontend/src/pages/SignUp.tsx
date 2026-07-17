import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import dbStore from '../services/store';
import { Company } from '../types';
import api from '../services/api';
import { 
  Layers, ChevronRight, User, Mail, Key, Shield, Building, Search, CheckCircle, XCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

interface SignUpProps {
  onNavigateToLogin: () => void;
}

const sanitizeErrorMessage = (message: string): string => {
  if (!message) return 'An unexpected error occurred.';
  
  // Replace absolute Windows/Unix paths and files
  let clean = message
    .replace(/[a-zA-Z]:\\[\\\w\-\.\s]+/g, '[System Path]')
    .replace(/\/[\w\-\.\/]+\.(ts|tsx|js|jsx|json)/g, '[File]');
  
  // Handle specific Firebase domain/auth errors
  if (clean.includes('auth/unauthorized-domain')) {
    return 'This domain is not authorized to run Google Sign-In. Please add this domain to the Firebase Console Authorized Domains list.';
  }
  if (clean.includes('auth/popup-closed-by-user')) {
    return 'Sign-In popup closed before completing the authentication.';
  }
  
  return clean;
};

export const SignUp: React.FC<SignUpProps> = ({ onNavigateToLogin }) => {
  const { registerOwner, registerManagerOrWorker, registerCustomer, loginWithGoogle } = useAuth();

  // Mode state: 'owner' | 'employee' | 'customer'
  const [signUpMode, setSignUpMode] = useState<'owner' | 'employee' | 'customer'>('owner');

  // Generic states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || 'Google Sign-Up failed.'));
      setLoading(false);
    }
  };

  // Owner specific state
  const [companyName, setCompanyName] = useState('');
  const [isCompanyAvailable, setIsCompanyAvailable] = useState<boolean | null>(null);

  // Employee specific state
  const [role, setRole] = useState<'Manager' | 'Worker'>('Worker');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [companySearchQuery, setCompanySearchQuery] = useState('');
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
            subscription: c.subscription
          }));
          setAllCompanies(mapped);
        } else {
          setAllCompanies(dbStore.getCompanies());
        }
      } catch (err) {
        console.error("Failed to fetch companies from backend, falling back to local store:", err);
        setAllCompanies(dbStore.getCompanies());
      }
    };
    
    fetchCompanies();
    
    const unsubscribe = dbStore.subscribe(() => {
      fetchCompanies();
    });
    return () => unsubscribe();
  }, []);

  // Check company name availability instantly
  useEffect(() => {
    if (signUpMode !== 'owner') return;
    if (!companyName.trim()) {
      setIsCompanyAvailable(null);
      return;
    }
    const avail = dbStore.isCompanyNameAvailable(companyName);
    setIsCompanyAvailable(avail);
  }, [companyName, signUpMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (signUpMode === 'owner') {
        if (!isCompanyAvailable) {
          throw new Error('Please choose a unique and available company name.');
        }
        await registerOwner(name, email, companyName, phone, password);
      } else if (signUpMode === 'employee') {
        if (!selectedCompanyId) {
          throw new Error('Please select a valid company to join.');
        }
        await registerManagerOrWorker(name, email, selectedCompanyId, role, phone, password);
      } else {
        await registerCustomer(name, email, phone, password);
      }
    } catch (err: any) {
      setError(sanitizeErrorMessage(err.message || 'Registration failed.'));
      setLoading(false);
    }
  };

  const filteredCompanies = allCompanies.filter(c => 
    (c.name || '').toLowerCase().includes(companySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Centered Logo block */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex items-center justify-center mx-auto w-10 h-10 bg-white rounded-sm text-black">
          <Layers className="w-5 h-5" />
        </div>
        <h2 className="mt-6 text-4xl font-light font-serif italic text-white tracking-tight">
          Register with VendorOS
        </h2>
        <p className="mt-2 text-xs uppercase tracking-widest text-[#666666] font-sans">
          Create owner profile, join existing vendor, or request services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111111] py-8 px-4 border border-[#222222] rounded-sm sm:px-10"
        >
          {/* Sign Up Mode Tabs */}
          <div className="grid grid-cols-3 bg-[#0A0A0A] p-1 border border-[#222222] rounded-sm mb-6 gap-1">
            <button
              type="button"
              onClick={() => { setSignUpMode('owner'); setError(''); }}
              className={`py-2 px-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all truncate text-center ${
                signUpMode === 'owner'
                  ? 'bg-white text-black font-extrabold'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              Start Company
            </button>
            <button
              type="button"
              onClick={() => { setSignUpMode('employee'); setError(''); }}
              className={`py-2 px-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all truncate text-center ${
                signUpMode === 'employee'
                  ? 'bg-white text-black font-extrabold'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              Join Vendor
            </button>
            <button
              type="button"
              onClick={() => { setSignUpMode('customer'); setError(''); }}
              className={`py-2 px-1 text-[10px] font-bold rounded-sm uppercase tracking-wider transition-all truncate text-center ${
                signUpMode === 'customer'
                  ? 'bg-white text-black font-extrabold'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              Client / User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-sm text-xs font-semibold text-red-400 flex items-center font-mono">
                <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Standard Profile Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-sm shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alice Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-sm shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alice@mycompany.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative rounded-sm shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                />
              </div>
            </div>

            {/* OWNER SIGNUP SPECIFIC FIELDS */}
            {signUpMode === 'owner' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-[#1D1D1D]"
              >
                <div>
                  <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                    Company Name
                  </label>
                  <div className="relative rounded-sm shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
                      <Building className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Plumbing Services"
                      className="w-full pl-10 pr-10 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:ring-white focus:border-white text-xs font-mono placeholder-[#333333]"
                    />
                    
                    {/* Instant Company Availability Verification Feedback Indicator */}
                    {isCompanyAvailable !== null && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {isCompanyAvailable ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500" title="Company Name Available!" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" title="Name Already Registered!" />
                        )}
                      </div>
                    )}
                  </div>

                  {isCompanyAvailable !== null && (
                    <p className={`text-xs mt-1.5 font-semibold ${isCompanyAvailable ? 'text-emerald-500' : 'text-red-400'}`}>
                      {isCompanyAvailable ? '✓ Beautiful! This company name is available for registration.' : '✗ Warning: This company name is already registered.'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* EMPLOYEE SIGNUP SPECIFIC FIELDS */}
            {signUpMode === 'employee' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-[#1D1D1D]"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                      Operational Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'Manager' | 'Worker')}
                      className="w-full px-3 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:border-white text-xs font-mono"
                    >
                      <option value="Worker">Worker / Field Tech</option>
                      <option value="Manager">Operations Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                      Join Access Privilege
                    </label>
                    <div className="w-full px-3 py-2.5 rounded-sm bg-[#0D0D0D] border border-[#222222] text-[#888888] text-xs font-semibold flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      Immediate Testing Access
                    </div>
                  </div>
                </div>

                {/* Company Autocomplete / Search Panel */}
                <div>
                  <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                    Select Vendor Company to Join
                  </label>
                  
                  <div className="border border-[#222222] rounded-sm p-3 bg-[#0A0A0A] space-y-2">
                    <div className="relative rounded-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#444444]">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        placeholder="Search existing vendors..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:border-white text-xs font-mono placeholder-[#333333]"
                      />
                    </div>

                    <div className="max-h-24 overflow-y-auto space-y-1 mt-1 pr-1">
                      {filteredCompanies.length === 0 ? (
                        <p className="text-[11px] text-[#666666] italic text-center py-2">No vendor companies match your query.</p>
                      ) : (
                        filteredCompanies.map((c) => {
                          const isSelected = selectedCompanyId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCompanyId(c.id)}
                              className={`w-full text-left px-3 py-1.5 rounded-sm text-xs font-semibold flex justify-between items-center transition-colors ${
                                isSelected 
                                  ? 'bg-white text-black font-extrabold' 
                                  : 'hover:bg-[#1A1A1A] text-[#888888] bg-transparent hover:text-white'
                              }`}
                            >
                              <span>{c.name}</span>
                              <span className={`text-[10px] font-mono ${isSelected ? 'text-black' : 'text-[#444444]'}`}>{c.id}</span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CUSTOMER SIGNUP SPECIFIC FIELDS */}
            {signUpMode === 'customer' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-[#1D1D1D]"
              >
                <div>
                  <label className="block text-[10px] font-mono font-medium text-[#666666] uppercase tracking-widest mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                    className="w-full px-4 py-2.5 rounded-sm border border-[#222222] bg-[#0D0D0D] text-white focus:outline-none focus:ring-1 focus:border-white text-xs font-mono placeholder-[#333333]"
                  />
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-white hover:bg-[#E5E5E5] text-black text-[11px] font-bold uppercase tracking-widest rounded-sm transition-all focus:outline-none disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="font-mono text-[10px] uppercase tracking-widest">Registering Account...</span>
              ) : (
                <>
                  <span className="tracking-widest">Create Account</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#222222]"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono text-[#444444] uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-[#222222]"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 bg-[#111111] hover:bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-widest rounded-sm border border-[#222222] hover:border-[#444444] transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.34 -0.03,-0.68 -0.09,-1H21.35z" fill="#4285F4" />
                <path d="M12,20.6c2.32,0 4.27,-0.77 5.7,-2.09l-3.3,-2.58c-0.91,0.61 -2.08,0.97 -3.3,0.97c-2.54,0 -4.7,-1.72 -5.47,-4.04H2.17v2.66c1.5,2.98 4.6,4.92 8.16,4.92z" fill="#34A853" />
                <path d="M6.53,12.92C6.46,12.5 6.42,12.06 6.42,11.6c0,-0.46 0.04,-0.9 0.11,-1.32V7.62H2.17c-0.45,0.9 -0.71,1.91 -0.71,2.98c0,1.07 0.26,2.08 0.71,2.98L6.53,12.92z" fill="#FBBC05" />
                <path d="M12,5.2c1.26,0 2.39,0.44 3.28,1.29l2.46,-2.46c-1.48,-1.38 -3.43,-2.23 -5.74,-2.23c-3.56,0 -6.66,1.94 -8.16,4.92L6.53,9.38C7.3,7.06 9.46,5.2 12,5.2z" fill="#EA4335" />
              </svg>
              <span className="tracking-widest">Sign Up with Google</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-[#666666]">Already registered? </span>
            <button
              onClick={onNavigateToLogin}
              className="font-bold uppercase tracking-wider text-[10px] text-white hover:text-[#888888] underline focus:outline-none cursor-pointer"
            >
              Sign In Instead
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
