import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminApi, type AdminUser } from '@/lib/adminApi';

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthCtx = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => adminApi.getCachedUser());
  const [token, setToken] = useState<string | null>(() => (adminApi.isAuthenticated() ? 'present' : null));
  const [loading, setLoading] = useState(() => adminApi.isAuthenticated());

  // On mount, if a token exists, refresh the user profile to validate the session.
  useEffect(() => {
    if (!adminApi.isAuthenticated()) return;
    setLoading(true);
    adminApi
      .me()
      .then((u) => {
        setUser(u);
        adminApi.localMode = false;
      })
      .catch((err) => {
        // If it's a 401 (expired token), clear auth and redirect to login
        if (err?.status === 401) {
          adminApi.logout();
          adminApi.localMode = false;
          setUser(null);
          setToken(null);
        } else {
          // Network error — backend is offline. Enable local mode so admin pages
          // show fallback UI instead of crashing.
          console.warn('[Admin] Backend unreachable, enabling local mode:', err?.message);
          adminApi.localMode = true;
          // Keep cached user so the guard doesn't redirect
          const cached = adminApi.getCachedUser();
          if (cached) {
            setUser(cached);
            setToken('present');
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    adminApi.localMode = false;
    try {
      const { user: u } = await adminApi.login(email, password);
      setUser(u);
      setToken('present');
    } catch {
      throw new Error('Invalid credentials');
    }
  }, []);

  const logout = useCallback(() => {
    adminApi.logout();
    adminApi.localMode = false;
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AdminAuthCtx.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AdminAuthCtx.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthCtx);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
