import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Company } from '../types';
import dbStore from '../services/store';
import api from '../services/api';

export interface UserPreferences {
  currency: 'INR' | 'USD';
  navAlignment: 'right' | 'left';
  navStyle: 'horizontal' | 'sidebar';
  sidebarPosition: 'left' | 'right';
  notifyEmail?: boolean;
  notifySMS?: boolean;
  notifyPush?: boolean;
  themeMode: 'dark' | 'light' | 'system';
  themeName: 'midnight' | 'obsidian' | 'pine' | 'graphite' | 'custom' | string;
  language?: 'en' | 'hi' | 'pa';
  customThemePrompt?: string;
  customThemeColors?: {
    bgApp: string;
    bgCard: string;
    bgSecondary: string;
    bgInput: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
  };
}

export const normalizeRole = (role?: string): 'Owner' | 'Manager' | 'Worker' | 'Customer' => {
  if (!role) return 'Customer';
  const clean = role.toLowerCase().trim();
  if (clean === 'owner') return 'Owner';
  if (clean === 'manager') return 'Manager';
  if (clean === 'worker') return 'Worker';
  return 'Customer';
};

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
  loading: boolean;
  preferences: UserPreferences;
  pendingRequest: any | null;
  setPendingRequest: React.Dispatch<React.SetStateAction<any | null>>;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updateProfile: (name: string, phone?: string, role?: string, companyId?: string, email?: string) => Promise<void>;
  updateCompany: (companyDetails: { description?: string; address?: string; minimumOrderValue?: number }) => Promise<void>;
  login: (email: string, password?: string, category?: string) => Promise<UserProfile>;
  loginWithGoogle: (targetRole?: string) => Promise<UserProfile>;
  logout: () => void;
  registerOwner: (name: string, email: string, companyName: string, phone?: string, password?: string) => Promise<{ user: UserProfile; company: Company }>;
  registerManagerOrWorker: (name: string, email: string, companyId: string, role: 'Manager' | 'Worker', phone?: string, password?: string) => Promise<UserProfile>;
  registerCustomer: (name: string, email: string, phone?: string, password?: string) => Promise<UserProfile>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingRequest, setPendingRequest] = useState<any | null>(null);

  useEffect(() => {
    const checkPendingRequest = async () => {
      if (!user) {
        setPendingRequest(null);
        return;
      }
      if (api.getToken() && (user.role === 'Worker' || user.role === 'Manager') && !user.companyId) {
        try {
          const res = await api.joinRequests.getMyPending();
          if (res.success && res.request) {
            setPendingRequest(res.request);
          } else {
            setPendingRequest(null);
          }
        } catch (err) {
          console.error("Error fetching my pending request:", err);
          setPendingRequest(null);
        }
      } else {
        setPendingRequest(null);
      }
    };
    checkPendingRequest();
  }, [user]);

  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'INR',
    navAlignment: 'left',
    navStyle: 'sidebar',
    sidebarPosition: 'right',
    notifyEmail: true,
    notifySMS: false,
    notifyPush: true,
    themeMode: 'dark',
    themeName: 'midnight',
  });

  // Helper to persist session
  const saveSession = (u: UserProfile | null, c: Company | null) => {
    if (u) {
      localStorage.setItem('vendoros_current_user_id', u.id);
      localStorage.setItem('vendoros_user_profile', JSON.stringify(u));
      if (!api.getToken()) {
        api.saveToken(`vos_session_${u.id}`);
      }
      dbStore.syncUserSession(u, c);
    } else {
      localStorage.removeItem('vendoros_current_user_id');
      localStorage.removeItem('vendoros_user_profile');
      api.clearToken();
    }

    if (c) {
      localStorage.setItem('vendoros_company_profile', JSON.stringify(c));
    } else {
      localStorage.removeItem('vendoros_company_profile');
    }
  };

  // Sync state from localStorage on init
  useEffect(() => {
    const savedUserId = localStorage.getItem('vendoros_current_user_id');
    const savedUserProfile = localStorage.getItem('vendoros_user_profile');
    const savedCompanyProfile = localStorage.getItem('vendoros_company_profile');
    const savedPrefs = localStorage.getItem('vendoros_user_preferences');
    
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        if (parsed.themeName) {
          if (parsed.themeName === 'slate' || parsed.themeName === 'sapphire') parsed.themeName = 'obsidian';
          else if (parsed.themeName === 'sage' || parsed.themeName === 'warm') parsed.themeName = 'pine';
          else if (parsed.themeName === 'tokyo' || parsed.themeName === 'azure') parsed.themeName = 'graphite';
        }
        setPreferences(parsed);
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }

    let activeUser: UserProfile | null = null;
    let activeCompany: Company | null = null;

    if (savedUserProfile) {
      try {
        activeUser = JSON.parse(savedUserProfile);
      } catch (e) {
        console.error('Failed to parse saved user profile', e);
      }
    }

    if (savedCompanyProfile) {
      try {
        activeCompany = JSON.parse(savedCompanyProfile);
      } catch (e) {
        console.error('Failed to parse saved company profile', e);
      }
    }

    if (!activeUser && savedUserId) {
      const allUsers = dbStore.getUsers();
      activeUser = allUsers.find(u => u.id === savedUserId) || null;
      if (activeUser?.companyId) {
        activeCompany = dbStore.getCompanies().find(comp => comp.id === activeUser?.companyId) || null;
      }
    }

    if (activeUser) {
      setUser(activeUser);
      setCompany(activeCompany);
      if (!api.getToken()) {
        api.saveToken(`vos_session_${activeUser.id}`);
      }
      dbStore.syncUserSession(activeUser, activeCompany);
    }

    // Real-time API Profile Hydration from MongoDB
    if (api.getToken()) {
      api.users.getProfile().then(res => {
        if (res.success && res.user) {
          const freshUser: UserProfile = {
            id: res.user._id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            role: normalizeRole(res.user.role),
            companyId: res.user.company ? (res.user.company._id || res.user.company) : undefined,
            createdAt: res.user.createdAt,
          };
          setUser(freshUser);

          let freshCompany: Company | null = null;
          if (res.user.company && typeof res.user.company === 'object') {
            freshCompany = {
              id: res.user.company._id,
              name: res.user.company.companyName,
              createdAt: res.user.company.createdAt,
              minOrderValue: res.user.company.minimumOrderValue,
              subscription: res.user.company.subscription,
              description: res.user.company.description,
              address: res.user.company.address,
            };
            setCompany(freshCompany);
          }
          saveSession(freshUser, freshCompany);
        }
      }).catch(err => {
        console.error("Failed to hydrate profile from backend API:", err);
      });
    }

    setLoading(false);
  }, []);

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('vendoros_user_preferences', JSON.stringify(updated));
      return updated;
    });
  };

  // Set up real-time listener for the store.
  useEffect(() => {
    if (!user) return;

    const unsubscribe = dbStore.subscribe(() => {
      const savedUserProfile = localStorage.getItem('vendoros_user_profile');
      const savedUserId = localStorage.getItem('vendoros_current_user_id');
      const hasToken = !!api.getToken();

      // If session is active and persisted in localStorage, never forcibly log out or overwrite user state
      if (hasToken || savedUserProfile || savedUserId) {
        return;
      }

      const allUsers = dbStore.getUsers();
      const stillExists = allUsers.find(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      const isSessionActive = dbStore.isSessionActive(user.id);

      if (!stillExists || !isSessionActive) {
        setUser(null);
        setCompany(null);
        localStorage.removeItem('vendoros_current_user_id');
        localStorage.removeItem('vendoros_user_profile');
        localStorage.removeItem('vendoros_company_profile');
      }
    });

    return () => unsubscribe();
  }, [user]);

  const login = async (email: string, password?: string, category?: string): Promise<UserProfile> => {
    // compatibility fallback if params are missing (local testing)
    if (!password || !category) {
      return new Promise((resolve, reject) => {
        const loggedUser = dbStore.login(email);
        if (loggedUser) {
          setUser(loggedUser);
          localStorage.setItem('vendoros_current_user_id', loggedUser.id);
          if (loggedUser.companyId) {
            const comps = dbStore.getCompanies();
            const foundComp = comps.find(c => c.id === loggedUser.companyId);
            setCompany(foundComp || null);
          } else {
            setCompany(null);
          }
          resolve(loggedUser);
        } else {
          reject(new Error('Incorrect email or password'));
        }
      });
    }

    const demoEmails = [
      "alice@apex.com", "bob@apex.com", "charlie@apex.com", "dave@gmail.com",
      "kaushal@gmail.com", "rahul@gmail.com", "amit@gmail.com", "saransh@gargops.com", "amit@gargops.com", "dave@apex.com"
    ];
    const isDemoBypass = demoEmails.includes(email.toLowerCase().trim()) || import.meta.env.DEV;

    if (isDemoBypass) {
      try {
        const res = await api.auth.login({ idToken: "bypass_token", email, category });

        const loggedUser: UserProfile = {
          id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: normalizeRole(res.user.role),
          companyId: res.user.company ? res.user.company._id : undefined,
          createdAt: res.user.createdAt,
        };

        setUser(loggedUser);
        let companyObj: Company | null = null;
        if (res.user.company) {
          companyObj = {
            id: res.user.company._id,
            name: res.user.company.companyName,
            createdAt: res.user.company.createdAt,
            minOrderValue: res.user.company.minimumOrderValue,
            subscription: res.user.company.subscription,
            description: res.user.company.description,
            address: res.user.company.address,
          };
          setCompany(companyObj);
        } else {
          setCompany(null);
        }

        saveSession(loggedUser, companyObj);
        return loggedUser;
      } catch (backendErr: any) {
        console.warn("[Login Fallback to Simulated DB]", backendErr);
        const loggedUser = dbStore.login(email);
        if (loggedUser) {
          setUser(loggedUser);
          let companyObj: Company | null = null;
          if (loggedUser.companyId) {
            const comps = dbStore.getCompanies();
            companyObj = comps.find(c => c.id === loggedUser.companyId) || null;
            setCompany(companyObj);
          } else {
            setCompany(null);
          }
          saveSession(loggedUser, companyObj);
          return loggedUser;
        }

        const roleMap: Record<string, 'Owner' | 'Manager' | 'Worker' | 'Customer'> = {
          owner: 'Owner',
          vendor: 'Manager',
          customer: 'Customer'
        };
        const fallbackRole = roleMap[category] || normalizeRole(category) || 'Owner';
        const fallbackUser: UserProfile = {
          id: 'usr_demo_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          role: fallbackRole,
          companyId: fallbackRole === 'Customer' ? undefined : 'comp_apex',
          createdAt: new Date().toISOString()
        };
        setUser(fallbackUser);
        const apexComp = dbStore.getCompanies()[0] || null;
        setCompany(fallbackRole === 'Customer' ? null : apexComp);
        saveSession(fallbackUser, fallbackRole === 'Customer' ? null : apexComp);
        return fallbackUser;
      }
    }

    const { signInWithEmailAndPassword, signOut, getIdToken } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    try {
      // 1. Authenticate credentials at Firebase Auth layer
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const idToken = await getIdToken(userCredential.user);
      
      // 2. Validate selected category against actual identity in MongoDB
      try {
        const res = await api.auth.login({ idToken, email, category });

        const loggedUser: UserProfile = {
          id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: normalizeRole(res.user.role),
          companyId: res.user.company ? res.user.company._id : undefined,
          createdAt: res.user.createdAt,
        };

        setUser(loggedUser);

        let companyObj: Company | null = null;
        if (res.user.company) {
          companyObj = {
            id: res.user.company._id,
            name: res.user.company.companyName,
            createdAt: res.user.company.createdAt,
            minOrderValue: res.user.company.minimumOrderValue,
            subscription: res.user.company.subscription,
            description: res.user.company.description,
            address: res.user.company.address,
          };
          setCompany(companyObj);
        } else {
          setCompany(null);
        }

        saveSession(loggedUser, companyObj);
        return loggedUser;
      } catch (backendErr: any) {
        // Sign out Firebase if category validation fails (zero leakage)
        await signOut(firebaseAuth);
        
        // Report failure to backend
        await api.auth.reportFailure({ email });
        
        throw new Error(backendErr.message || 'Incorrect email or password');
      }
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/user-disabled') {
        throw new Error('Too many failed attempts. Try again in 15 minutes.');
      }
      
      // Report failed credentials attempt to backend
      await api.auth.reportFailure({ email });
      throw new Error('Incorrect email or password');
    }
  };

  const loginWithGoogle = async (targetRole?: string): Promise<UserProfile> => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');
    
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(firebaseAuth, provider);
    const email = result.user.email;
    if (!email) {
      throw new Error('Google Sign-In did not return an email address.');
    }

    const allUsers = dbStore.getUsers();
    let loggedUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!loggedUser) {
      const displayName = result.user.displayName || 'Google User';
      const phone = result.user.phoneNumber || undefined;
      const desiredRole = normalizeRole(targetRole);

      if (desiredRole === 'Owner') {
        const reg = dbStore.registerOwner(displayName, email, `${displayName}'s Enterprise`);
        loggedUser = reg.user;
      } else if (desiredRole === 'Manager' || desiredRole === 'Worker') {
        const apexComp = dbStore.getCompanies()[0];
        loggedUser = dbStore.registerManagerOrWorker(displayName, email, apexComp?.id || 'comp_apex', desiredRole);
      } else {
        loggedUser = dbStore.registerCustomer(displayName, email, phone);
      }
    }

    loggedUser = {
      ...loggedUser,
      role: normalizeRole(loggedUser.role)
    };

    setUser(loggedUser);
    let companyObj: Company | null = null;
    if (loggedUser.companyId) {
      const comps = dbStore.getCompanies();
      companyObj = comps.find(c => c.id === loggedUser.companyId) || null;
      setCompany(companyObj);
    } else {
      setCompany(null);
    }
    
    saveSession(loggedUser, companyObj);
    return loggedUser;
  };


  const logout = () => {
    if (user) {
      dbStore.logout(user.id);
    }
    setUser(null);
    setCompany(null);
    saveSession(null, null);
    api.clearToken();
  };

  const registerOwner = async (name: string, email: string, companyName: string, phone?: string, password?: string): Promise<{ user: UserProfile; company: Company }> => {
    const { createUserWithEmailAndPassword, getIdToken } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    // 1. Create account in Firebase Authentication
    let idToken: string;
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password || Math.random().toString(36) + 'Aa1!');
      idToken = await getIdToken(credential.user);
    } catch (fbErr: any) {
      console.error("[Firebase Auth Owner Signup Error]", fbErr);
      throw new Error('Something went wrong, please try again or contact support');
    }

    try {
      // 2. Register profile in MongoDB via backend (sends idToken, not password)
      const res = await api.auth.ownerSignup({ idToken, name, email, phone: phone || '', companyName });

      // 3. Mirror session in local simulated store
      if (!dbStore.isCompanyNameAvailable(companyName)) {
        // Already in store — just find and set
        const users = dbStore.getUsers();
        const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setUser(existing);
          const comps = dbStore.getCompanies();
          const comp = comps.find(c => c.id === existing.companyId);
          setCompany(comp || null);
          localStorage.setItem('vendoros_current_user_id', existing.id);
          return { user: existing, company: comp as Company };
        }
      }

      const localRes = dbStore.registerOwner(name, email, companyName);
      setUser(localRes.user);
      setCompany(localRes.company);
      localStorage.setItem('vendoros_current_user_id', localRes.user.id);
      return localRes;
    } catch (err: any) {
      console.error("[Backend Owner Signup Error]", err);
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const registerManagerOrWorker = async (name: string, email: string, companyId: string, role: 'Manager' | 'Worker', phone?: string, password?: string): Promise<UserProfile> => {
    const { createUserWithEmailAndPassword, getIdToken } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    // 1. Create account in Firebase Authentication
    let idToken: string;
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password || Math.random().toString(36) + 'Aa1!');
      idToken = await getIdToken(credential.user);
    } catch (fbErr: any) {
      console.error("[Firebase Auth Vendor Signup Error]", fbErr);
      throw new Error('Something went wrong, please try again or contact support');
    }

    try {
      // 2. Register profile in MongoDB via backend
      const res = await api.auth.vendorSignup({ idToken, name, email, phone, companyId, role });

      // 3. Mirror in local simulated store
      const users = dbStore.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setUser(existing);
        localStorage.setItem('vendoros_current_user_id', existing.id);
        const comps = dbStore.getCompanies();
        const foundComp = comps.find(c => c.id === companyId);
        setCompany(foundComp || null);
        return existing;
      }

      const newUser = dbStore.registerManagerOrWorker(name, email, companyId, role);
      setUser(newUser);
      localStorage.setItem('vendoros_current_user_id', newUser.id);
      const comps = dbStore.getCompanies();
      const foundComp = comps.find(c => c.id === companyId);
      setCompany(foundComp || null);

      return newUser;
    } catch (err: any) {
      console.error("[Backend Vendor Signup Error]", err);
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const registerCustomer = async (name: string, email: string, phone?: string, password?: string): Promise<UserProfile> => {
    const { createUserWithEmailAndPassword, getIdToken } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    // 1. Create account in Firebase Authentication
    let idToken: string;
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password || Math.random().toString(36) + 'Aa1!');
      idToken = await getIdToken(credential.user);
    } catch (fbErr: any) {
      console.error("[Firebase Auth Customer Signup Error]", fbErr);
      throw new Error('Something went wrong, please try again or contact support');
    }

    try {
      // 2. Register customer profile in MongoDB via backend
      await api.auth.customerSignup({ idToken, name, email, phone });

      // 3. Mirror in local simulated store
      const users = dbStore.getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        setUser(existing);
        localStorage.setItem('vendoros_current_user_id', existing.id);
        setCompany(null);
        return existing;
      }

      const newUser = dbStore.registerCustomer(name, email, phone);
      setUser(newUser);
      localStorage.setItem('vendoros_current_user_id', newUser.id);
      setCompany(null);
      return newUser;
    } catch (err: any) {
      console.error("[Backend Customer Signup Error]", err);
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
    } catch (fbErr: any) {
      console.error("[Firebase Password Reset Error]", fbErr);
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const updateProfile = async (name: string, phone?: string, role?: string, companyId?: string, email?: string): Promise<void> => {
    const trimmedName = name.trim();
    const trimmedPhone = phone ? phone.trim() : undefined;
    const trimmedEmail = email ? email.trim() : undefined;

    let updatedUser: UserProfile | null = null;
    let updatedCompany: Company | null = company;

    if (api.getToken() && user) {
      try {
        const res = await api.users.updateProfile({ 
          name: trimmedName, 
          phone: trimmedPhone, 
          role, 
          companyId, 
          email: trimmedEmail 
        });
        if (res.success && res.user) {
          updatedUser = {
            id: res.user._id,
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone,
            role: normalizeRole(res.user.role),
            companyId: res.user.company ? (res.user.company._id || res.user.company) : undefined,
            createdAt: res.user.createdAt,
          };
          if (res.user.company && typeof res.user.company === 'object') {
            updatedCompany = {
              id: res.user.company._id,
              name: res.user.company.companyName,
              createdAt: res.user.company.createdAt,
              minOrderValue: res.user.company.minimumOrderValue,
              subscription: res.user.company.subscription,
              description: res.user.company.description,
              address: res.user.company.address,
            };
          }
        }
      } catch (err) {
        console.error("Backend updateProfile error, syncing locally:", err);
      }
    }

    if (!updatedUser && user) {
      updatedUser = {
        ...user,
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || user.email,
        role: role ? normalizeRole(role) : user.role,
        companyId: companyId !== undefined ? (companyId || undefined) : user.companyId,
      };
    }

    if (updatedUser) {
      setUser(updatedUser);
      if (updatedCompany) setCompany(updatedCompany);

      if (user) {
        dbStore.updateUserProfile(user.id, trimmedName, trimmedPhone, trimmedEmail);
        if (role || companyId !== undefined) {
          dbStore.updateUserRoleAndCompany(
            user.id,
            role ? (role.charAt(0).toUpperCase() + role.slice(1) as any) : undefined,
            companyId
          );
        }
      }

      saveSession(updatedUser, updatedCompany);
    }
  };

  const updateCompany = async (companyDetails: { description?: string; address?: string; minimumOrderValue?: number }): Promise<void> => {
    if (!company) return;

    let updatedComp: Company = {
      ...company,
      description: companyDetails.description !== undefined ? companyDetails.description : company.description,
      address: companyDetails.address !== undefined ? companyDetails.address : company.address,
      minOrderValue: companyDetails.minimumOrderValue !== undefined ? companyDetails.minimumOrderValue : company.minOrderValue,
    };

    if (api.getToken()) {
      try {
        const res = await api.companies.updateMe(companyDetails);
        if (res.success && res.company) {
          updatedComp = {
            id: res.company._id,
            name: res.company.companyName,
            createdAt: res.company.createdAt,
            minOrderValue: res.company.minimumOrderValue,
            subscription: res.company.subscription,
            description: res.company.description,
            address: res.company.address,
          };
        }
      } catch (err) {
        console.error("Backend updateCompany error, syncing locally:", err);
      }
    }

    setCompany(updatedComp);
    dbStore.updateCompanyProfile(company.id, companyDetails);
    saveSession(user, updatedComp);
  };

  return (
    <AuthContext.Provider value={{
      user,
      company,
      loading,
      preferences,
      pendingRequest,
      setPendingRequest,
      updatePreference,
      updateProfile,
      updateCompany,
      login,
      loginWithGoogle,
      logout,
      registerOwner,
      registerManagerOrWorker,
      registerCustomer,
      sendPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
