import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, type User } from '@/lib/api';

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function refresh() {
    try {
      const me = await api.getProfile();
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  async function logout() {
    try { await api.logout(); } catch {}
    setUser(null);
  }

  useEffect(() => { refresh(); }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


