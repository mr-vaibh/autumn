"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

type LoginForm = z.infer<typeof loginSchema>;
type OTPRequestForm = z.infer<typeof otpRequestSchema>;
type OTPVerifyForm = z.infer<typeof otpVerifySchema>;

type Role = "ADMIN" | "TEACHER" | "PARENT";

const roles: { id: Role; label: string; icon: string; description: string }[] = [
  { id: "ADMIN", label: "Admin", icon: "🏛️", description: "School Administrator" },
  { id: "TEACHER", label: "Teacher", icon: "📚", description: "Teacher / Therapist" },
  { id: "PARENT", label: "Parent", icon: "👨‍👩‍👧", description: "Parent / Guardian" },
];

export default function LoginPage() {
  const { login, loginWithOTP } = useAuth();
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("ADMIN");
  const [isLoading, setIsLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerOTPReq,
    handleSubmit: handleOTPReqSubmit,
    formState: { errors: otpReqErrors },
    getValues: getOTPReqValues,
  } = useForm<OTPRequestForm>({ resolver: zodResolver(otpRequestSchema) });

  const {
    register: registerOTPVerify,
    handleSubmit: handleOTPVerifySubmit,
    formState: { errors: otpVerifyErrors },
  } = useForm<OTPVerifyForm>({ resolver: zodResolver(otpVerifySchema) });

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPRequest = async (data: OTPRequestForm) => {
    setIsLoading(true);
    try {
      const resp = await authApi.requestOTP(data.email);
      setOtpEmail(data.email);
      setOtpSent(true);
      toast.success("OTP sent! Check your phone/email.");
      if (resp.data.debug_otp) {
        toast(`Debug OTP: ${resp.data.debug_otp}`, { icon: "🔑", duration: 10000 });
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(axiosError.response?.data?.detail || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPVerify = async (data: OTPVerifyForm) => {
    setIsLoading(true);
    try {
      await loginWithOTP(data.email, data.otp);
    } catch {
      // handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
          🌟
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          GLOBAL AUTISM LEARNING
        </h1>
        <p className="text-purple-200 text-sm mt-1 font-medium">
          School Management System
        </p>
      </div>

      <div className="p-8">
        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-3">
            Select Your Role
          </p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  selectedRole === role.id
                    ? "border-purple-400 bg-purple-500/30 text-white"
                    : "border-white/20 bg-white/5 text-white/60 hover:border-white/40 hover:bg-white/10"
                }`}
              >
                <span className="text-xl mb-1">{role.icon}</span>
                <span className="text-xs font-semibold">{role.label}</span>
                <span className="text-xs opacity-70 text-center leading-tight mt-0.5">
                  {role.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle OTP / Password */}
        <div className="flex bg-white/10 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => { setUseOTP(false); setOtpSent(false); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !useOTP ? "bg-purple-600 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setUseOTP(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              useOTP ? "bg-purple-600 text-white shadow-sm" : "text-white/60 hover:text-white"
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Password Login Form */}
        {!useOTP && (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Email Address
              </label>
              <input
                {...registerLogin("email")}
                type="email"
                placeholder="admin@autism.school"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {loginErrors.email && (
                <p className="text-red-400 text-xs mt-1">{loginErrors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Password
              </label>
              <input
                {...registerLogin("password")}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {loginErrors.password && (
                <p className="text-red-400 text-xs mt-1">{loginErrors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        )}

        {/* OTP Login Form */}
        {useOTP && !otpSent && (
          <form onSubmit={handleOTPReqSubmit(onOTPRequest)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Email Address
              </label>
              <input
                {...registerOTPReq("email")}
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              />
              {otpReqErrors.email && (
                <p className="text-red-400 text-xs mt-1">{otpReqErrors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        )}

        {useOTP && otpSent && (
          <form onSubmit={handleOTPVerifySubmit(onOTPVerify)} className="space-y-4">
            <div className="bg-purple-500/20 rounded-xl p-4 text-center">
              <p className="text-white/80 text-sm">OTP sent to <strong className="text-white">{otpEmail}</strong></p>
              <p className="text-white/60 text-xs mt-1">Valid for 10 minutes</p>
            </div>
            <input type="hidden" {...registerOTPVerify("email")} value={otpEmail} />
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Enter OTP
              </label>
              <input
                {...registerOTPVerify("otp")}
                type="text"
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-center text-xl tracking-[0.5em] font-mono"
              />
              {otpVerifyErrors.otp && (
                <p className="text-red-400 text-xs mt-1">{otpVerifyErrors.otp.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Verify & Login"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/60 text-xs font-medium mb-2">Demo Credentials</p>
          <div className="space-y-1">
            <p className="text-white/80 text-xs font-mono">admin@autism.school</p>
            <p className="text-white/80 text-xs font-mono">Admin@123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
