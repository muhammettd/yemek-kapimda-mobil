import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authApi from '@/src/api/auth';
import {
  clearAuth,
  getAuthToken,
  loadStoredToken,
  registerUnauthorizedHandler,
  setAuthToken,
} from '@/src/api/client';
import { LoginRequest, RegisterRequest, User } from '@/src/types';
import { getStoredUser, saveStoredUser } from '@/src/utils/tokenStorage';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    await clearAuth();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      void logout();
    });
  }, [logout]);

  useEffect(() => {
    void (async () => {
      const token = await loadStoredToken();
      const storedUser = await getStoredUser();
      if (token && storedUser) {
        setUser(storedUser);
        setIsAuthenticated(true);
      } else if (token || storedUser) {
        await clearAuth();
      }
      setIsLoading(false);
    })();
  }, []);

  const persistSession = useCallback(async (token: string, sessionUser: User) => {
    await setAuthToken(token);
    await saveStoredUser(sessionUser);
    setUser(sessionUser);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const result = await authApi.login(data);
      await persistSession(result.token, result.user);
    },
    [persistSession],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await authApi.register(data);
      await persistSession(result.token, result.user);
    },
    [persistSession],
  );

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      login,
      register,
      logout,
    }),
    [isLoading, isAuthenticated, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function useAuthToken(): string | null {
  return getAuthToken();
}
