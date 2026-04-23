"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, usersApi } from "@/lib/api";
import { setTokens, removeTokens, setUser, getUser, getAccessToken, getDashboardPath } from "@/lib/auth";
import toast from "react-hot-toast";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_verified: boolean;
  profile_pic: string | null;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOTP: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await usersApi.getMe();
      const userData = response.data;
      setUserState(userData);
      setUser(userData);
    } catch {
      removeTokens();
      setUserState(null);
    }
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      const cachedUser = getUser();
      if (cachedUser) {
        setUserState(cachedUser as UserData);
      }
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { access, refresh, user: userData } = response.data;
      setTokens(access, refresh);
      setUser(userData);
      setUserState(userData);
      toast.success(`Welcome back, ${userData.full_name}!`);
      router.push(getDashboardPath(userData.role));
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || "Invalid email or password";
      toast.error(message);
      throw error;
    }
  };

  const loginWithOTP = async (email: string, otp: string) => {
    try {
      const response = await authApi.verifyOTP(email, otp);
      const { access, refresh, user: userData } = response.data;
      setTokens(access, refresh);
      setUser(userData);
      setUserState(userData);
      toast.success(`Welcome back, ${userData.full_name}!`);
      router.push(getDashboardPath(userData.role));
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      const message = axiosError.response?.data?.detail || "Invalid or expired OTP";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        await authApi.logout(refresh);
      }
    } catch {
      // silently fail
    } finally {
      removeTokens();
      setUserState(null);
      router.push("/login");
      toast.success("Logged out successfully");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithOTP, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
