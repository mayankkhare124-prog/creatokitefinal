import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const saveSession = useCallback((token, refresh, userData) => {
    localStorage.setItem('ck_token',   token);
    localStorage.setItem('ck_refresh', refresh);
    setUser(userData);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('ck_token');
    localStorage.removeItem('ck_refresh');
    setUser(null);
  }, []);

  /* Restore session on mount */
  useEffect(() => {
    const token = localStorage.getItem('ck_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(d => setUser(d.user))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const d = await authAPI.login({ email, password });
    saveSession(d.token, d.refreshToken, d.user);
    return d.user;
  }, [saveSession]);

  const register = useCallback(async (data) => {
    const d = await authAPI.register(data);
    saveSession(d.token, d.refreshToken, d.user);
    return d.user;
  }, [saveSession]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch(e) {}
    clearSession();
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const d = await authAPI.me();
    setUser(d.user);
    return d.user;
  }, []);

  const value = { user, loading, login, register, logout, refreshUser, setUser,
    isAdmin:   user?.role==='admin',
    isBrand:   user?.role==='brand',
    isCreator: user?.role==='creator',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
