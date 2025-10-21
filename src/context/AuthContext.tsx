import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, type User } from '@/lib/api';

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component for LumiFlix - mini project 2
 * 
 * This component provides the authentication context to the application.
 * It manages the user authentication state and provides functions to refresh the user data and logout.
 * 
 * @component
 * @returns {JSX.Element} The AuthProvider component with the authentication context
 * 
 * @example
 * ```tsx
 * import { AuthProvider } from './context/AuthContext';
 * 
 * function App() {
 *   return <AuthProvider><App /></AuthProvider>;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  /**
   * Refresh the user data
   * 
   * This function fetches the current user's profile information from the API.
   * It sets the user data in the context and handles errors by setting the user to null.
   * 
   * @returns {Promise<void>} Promise that resolves when the user data is refreshed
   * 
   * @since 1.0.0
   */
  async function refresh() {
    try {
      const me = await api.getProfile();
      setUser(me);
    } catch {
      setUser(null);
    }
  }

  /**
   * Logout the user
   * 
   * This function logs out the user by calling the API logout endpoint.
   * It sets the user data to null and handles errors by setting the user to null.
   * 
   * @returns {Promise<void>} Promise that resolves when the user is logged out
   * 
   * @since 1.0.0
   */
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

/**
 * useAuth hook for LumiFlix - mini project 2
 * 
 * This hook is used to access the authentication context.
 * It returns the user data and the functions to refresh the user data and logout.
 * 
 * @returns {AuthContextType} The authentication context
 * 
 * @example
 * ```tsx
 * import { useAuth } from './context/AuthContext';
 * 
 * function App() {
 *   const { user, refresh, logout } = useAuth();
 *   return <div>{user?.email}</div>;
 * }
 * ```
 * 
 * @since 1.0.0
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


