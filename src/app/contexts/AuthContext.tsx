import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, user as userApi } from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  bio: string;
  avatar_url: string;
  date_of_birth: string;
  goals: string;
  notif_task_reminders: number;
  notif_habit_alerts: number;
  notif_weekly_summary: number;
  xp: number;
  level: number;
  coins: number;
  streak: number;
  life_score: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  deleteAccount: () => Promise<void>;
}

const ADMIN_EMAIL = "azayrth1319@gmail.com";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (auth.isLoggedIn()) {
      userApi
        .getProfile()
        .then(setUser)
        .catch(() => {
          auth.clearToken();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await auth.login(email, password);
    auth.setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await auth.register(name, email, password);
    auth.setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    auth.clearToken();
    setUser(null);
  };

  const refreshUser = async () => {
    const profile = await userApi.getProfile();
    setUser(profile);
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const deleteAccount = async () => {
    await userApi.deleteAccount();
    auth.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin, login, register, logout, refreshUser, updateUser, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
