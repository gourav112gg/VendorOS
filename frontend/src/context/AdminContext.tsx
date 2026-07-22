import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../services/adminApi';

interface AdminContextType {
  admin: any | null;
  loading: boolean;
  login: (email: string, password: string, passphrase: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initSession = async () => {
      const token = adminApi.getAdminToken();
      if (token) {
        try {
          const res = await adminApi.getMe();
          if (res.success && res.admin) {
            setAdmin(res.admin);
          } else {
            adminApi.logout();
            setAdmin(null);
          }
        } catch (err) {
          console.error("Super Admin session restore failed:", err);
          adminApi.logout();
          setAdmin(null);
        }
      }
      setLoading(false);
    };
    initSession();
  }, []);

  const login = async (email: string, password: string, passphrase: string) => {
    const res = await adminApi.login({ email, password, passphrase });
    if (res.success && res.admin) {
      setAdmin(res.admin);
    }
  };

  const logout = () => {
    adminApi.logout();
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useSuperAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useSuperAdmin must be used within an AdminProvider');
  }
  return context;
};
