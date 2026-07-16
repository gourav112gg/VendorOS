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
  themeMode: 'dark' | 'light';
  themeName: 'slate' | 'sage' | 'sapphire' | 'warm' | 'tokyo' | 'custom';
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

interface AuthContextType {
  user: UserProfile | null;
  company: Company | null;
  loading: boolean;
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  updateProfile: (name: string, phone?: string) => Promise<void>;
  login: (email: string, password?: string, category?: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => void;
  registerOwner: (name: string, email: string, companyName: string) => Promise<{ user: UserProfile; company: Company }>;
  registerManagerOrWorker: (name: string, email: string, companyId: string, role: 'Manager' | 'Worker') => Promise<UserProfile>;
  registerCustomer: (name: string, email: string, phone?: string) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    currency: 'INR',
    navAlignment: 'left',
    navStyle: 'sidebar',
    sidebarPosition: 'right',
    notifyEmail: true,
    notifySMS: false,
    notifyPush: true,
    themeMode: 'dark',
    themeName: 'slate',
  });

  // Sync state from localStorage on init
  useEffect(() => {
    const savedUserId = localStorage.getItem('vendoros_current_user_id');
    const savedPrefs = localStorage.getItem('vendoros_user_preferences');
    
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error('Failed to parse preferences', e);
      }
    }

    if (savedUserId) {
      const allUsers = dbStore.getUsers();
      const foundUser = allUsers.find(u => u.id === savedUserId);
      if (foundUser && dbStore.isSessionActive(savedUserId)) {
        setUser(foundUser);
        if (foundUser.companyId) {
          const comps = dbStore.getCompanies();
          const foundComp = comps.find(c => c.id === foundUser.companyId);
          setCompany(foundComp || null);
        }
      } else {
        localStorage.removeItem('vendoros_current_user_id');
      }
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
  // This achieves the "Immediate Logout on Session Revocation" trigger
  useEffect(() => {
    if (!user) return;

    const unsubscribe = dbStore.subscribe(() => {
      const allUsers = dbStore.getUsers();
      const stillExists = allUsers.find(u => u.id === user.id);
      const isSessionActive = dbStore.isSessionActive(user.id);

      if (!stillExists || !isSessionActive) {
        // Force immediate logout
        setUser(null);
        setCompany(null);
        localStorage.removeItem('vendoros_current_user_id');
      } else {
        // Update user state if name or details change
        setUser(stillExists);
        if (stillExists.companyId) {
          const comps = dbStore.getCompanies();
          const foundComp = comps.find(c => c.id === stillExists.companyId);
          setCompany(foundComp || null);
        }
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

    const { signInWithEmailAndPassword, signOut, getIdToken } = await import('firebase/auth');
    const { auth: firebaseAuth } = await import('../services/firebase');

    try {
      // 1. Authenticate credentials at Firebase Auth layer
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      // 2. Obtain Firebase ID token to send to backend (never send raw password)
      const idToken = await getIdToken(userCredential.user);

      // 3. Validate selected category against actual identity in MongoDB
      try {
        const res = await api.auth.login({ idToken, email, category });

        const loggedUser: UserProfile = {
          id: res.user._id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role.charAt(0).toUpperCase() + res.user.role.slice(1),
          companyId: res.user.company ? res.user.company._id : undefined,
          createdAt: res.user.createdAt,
        };

        setUser(loggedUser);
        localStorage.setItem('vendoros_current_user_id', loggedUser.id);

        if (res.user.company) {
          const companyObj: Company = {
            id: res.user.company._id,
            name: res.user.company.companyName,
            createdAt: res.user.company.createdAt,
            minOrderValue: res.user.company.minimumOrderValue,
            subscription: res.user.company.subscription,
          };
          setCompany(companyObj);
        } else {
          setCompany(null);
        }

        // Sync with simulated local db
        dbStore.syncUserSession(loggedUser, res.user.company);

        return loggedUser;
      } catch (backendErr: any) {
        // Sign out Firebase if category validation fails (zero leakage)
        await signOut(firebaseAuth);
        await api.auth.reportFailure({ email });
        throw new Error('Incorrect email or password');
      }
    } catch (fbErr: any) {
      if (fbErr.code && fbErr.message !== 'Incorrect email or password') {
        // Firebase auth failure — report and use generic message
        try { await api.auth.reportFailure({ email }); } catch (_) {}
      }
      throw new Error('Incorrect email or password');
    }
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
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
      // Auto-register as Customer
      const displayName = result.user.displayName || 'Google User';
      const phone = result.user.phoneNumber || undefined;
      loggedUser = dbStore.registerCustomer(displayName, email, phone);
    }

    setUser(loggedUser);
    localStorage.setItem('vendoros_current_user_id', loggedUser.id);
    if (loggedUser.companyId) {
      const comps = dbStore.getCompanies();
      const foundComp = comps.find(c => c.id === loggedUser.companyId);
      setCompany(foundComp || null);
    } else {
      setCompany(null);
    }
    
    return loggedUser;
  };


  const logout = () => {
    if (user) {
      dbStore.logout(user.id);
    }
    setUser(null);
    setCompany(null);
    localStorage.removeItem('vendoros_current_user_id');
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
      // Don't distinguish whether email already exists in Firebase — generic message
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
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const registerManagerOrWorker = async (name: string, email: string, companyId: string, role: 'Manager' | 'Worker', phone?: string): Promise<UserProfile> => {
    // Manager/Worker accounts are created by the Owner via the Admin SDK server-side.
    // On the frontend (self-registration flow), we simply record locally.
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = dbStore.getUsers().find(u => u.email.toLowerCase() === normalizedEmail && !u.companyId);
        if (existingUser) {
          // Already registered — generic message, no email leak confirmation
          reject(new Error('Something went wrong, please try again or contact support'));
          return;
        }

        const newUser = dbStore.registerManagerOrWorker(name, email, companyId, role);
        setUser(newUser);
        localStorage.setItem('vendoros_current_user_id', newUser.id);
        
        const comps = dbStore.getCompanies();
        const foundComp = comps.find(c => c.id === companyId);
        setCompany(foundComp || null);

        resolve(newUser);
      }, 600);
    });
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
      throw new Error('Something went wrong, please try again or contact support');
    }
  };

  const updateProfile = async (name: string, phone?: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (user) {
          dbStore.updateUserProfile(user.id, name, phone);
        }
        resolve();
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      company,
      loading,
      preferences,
      updatePreference,
      updateProfile,
      login,
      loginWithGoogle,
      logout,
      registerOwner,
      registerManagerOrWorker,
      registerCustomer
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
