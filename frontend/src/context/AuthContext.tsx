import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Company } from '../types';
import dbStore from '../services/store';

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
  login: (email: string) => Promise<UserProfile>;
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

  const login = async (email: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
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
          reject(new Error('Invalid email or user does not exist.'));
        }
      }, 500);
    });
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

  const registerOwner = async (name: string, email: string, companyName: string): Promise<{ user: UserProfile; company: Company }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = dbStore.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);
        if (existingUser) {
          reject(new Error('Email is already registered.'));
          return;
        }

        if (!dbStore.isCompanyNameAvailable(companyName)) {
          reject(new Error('Company name is already taken.'));
          return;
        }

        const res = dbStore.registerOwner(name, email, companyName);
        setUser(res.user);
        setCompany(res.company);
        localStorage.setItem('vendoros_current_user_id', res.user.id);
        resolve(res);
      }, 600);
    });
  };

  const registerManagerOrWorker = async (name: string, email: string, companyId: string, role: 'Manager' | 'Worker'): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = dbStore.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);
        if (existingUser) {
          reject(new Error('Email is already registered.'));
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

  const registerCustomer = async (name: string, email: string, phone?: string): Promise<UserProfile> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = dbStore.getUsers().find(u => u.email.toLowerCase() === normalizedEmail);
        if (existingUser) {
          reject(new Error('Email is already registered.'));
          return;
        }

        const newUser = dbStore.registerCustomer(name, email, phone);
        setUser(newUser);
        localStorage.setItem('vendoros_current_user_id', newUser.id);
        setCompany(null);
        resolve(newUser);
      }, 600);
    });
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
