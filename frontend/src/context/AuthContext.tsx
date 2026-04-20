/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { authAPI } from "../services/api";
import type { User, RegisterData } from "../types";

// Define what the context provides
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });

    // Save token
    localStorage.setItem("token", response.token);
    setToken(response.token);

    // Save user
    setUser(response.user);
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData) => {
    const response = await authAPI.register(data);

    localStorage.setItem("token", response.token);
    setToken(response.token);
    setUser(response.user);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const value = useMemo(
    () => ({ user, token, login, register, logout, isLoading }),
    [user, token, login, register, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
