import React from 'react';
import { api } from '../api/client';

type User = { id: string; username: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (u: string, p: string) => Promise<string | null>;
  register: (u: string, p: string) => Promise<string | null>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }
      const { data, error } = await api.me();
      if (data?.user) setUser(data.user);
      if (error) {
        try { localStorage.removeItem('authToken'); } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const login = React.useCallback(async (username: string, password: string) => {
    const { data, error } = await api.login(username, password);
    if (error) return error;
    if (data?.token) localStorage.setItem('authToken', data.token);
    setUser(data?.user ?? null);
    return null;
  }, []);

  const register = React.useCallback(async (username: string, password: string) => {
    const { data, error } = await api.register(username, password);
    if (error) return error;
    if (data?.token) localStorage.setItem('authToken', data.token);
    setUser(data?.user ?? null);
    return null;
  }, []);

  const logout = React.useCallback(() => {
    try { localStorage.removeItem('authToken'); } catch {}
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return React.useContext(AuthContext);
}


