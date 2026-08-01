import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type LoginPayload, type RegisterPayload, type User } from '@/types';
import { getMeApi, loginApi, registerApi } from '@/utils/api';
import toast from 'react-hot-toast';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Synchronously extract token from URL query or localStorage on initial mount
const getInitialToken = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  const urlError = params.get('error');

  if (urlError) {
    toast.error('Google login failed. Please try again.');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  if (urlToken) {
    console.log('🔑 OAuth Token synchronously loaded from URL callback');
    localStorage.setItem('token', urlToken);
    window.history.replaceState({}, document.title, window.location.pathname);
    return urlToken;
  }

  return localStorage.getItem('token');
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile whenever token changes
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const u = await getMeApi();
        setUser(u);
        console.log(`✅ Session loaded for ${u.username}`);
      } catch (err) {
        console.error('Failed to load user session:', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  const login = async (payload: LoginPayload) => {
    try {
      const data = await loginApi(payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.username}!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const data = await registerApi(payload);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success(`Account created! Welcome, ${data.user.username}!`);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
