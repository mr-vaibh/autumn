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

const roles: { id: Role; label: string; description: string }[] = [
  { id: "ADMIN", label: "Admin", description: "School Administrator" },
  { id: "TEACHER", label: "Teacher / Therapist", description: "Teacher, Therapist, Dietician" },
  { id: "PARENT", label: "Parent", description: "Parent / Guardian" },
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
        toast(`Debug OTP: ${resp.data.debug_otp}`, { duration: 10000 });
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
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-black p-8 text-center">
        <h1 className="text-xl font-semibold text-white tracking-tight">
          Global Autism Learning
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          School Management System
        </p>
      </div>

      <div className="p-8">
        {/* Role Selector */}
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
            Select Your Role
          </p>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedRole === role.id
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                }`}
              >
                <span className="text-sm font-medium">{role.label}</span>
                <span className="text-xs opacity-70 text-center leading-tight mt-0.5">
                  {role.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle OTP / Password */}
        <div className="flex bg-neutral-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => { setUseOTP(false); setOtpSent(false); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !useOTP ? "bg-black text-white" : "text-neutral-500 hover:text-black"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setUseOTP(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              useOTP ? "bg-black text-white" : "text-neutral-500 hover:text-black"
            }`}
          >
            OTP
          </button>
        </div>

        {/* Password Login Form */}
        {!useOTP && (
          <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <input
                {...registerLogin("email")}
                type="email"
                placeholder="admin@autism.school"
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              {loginErrors.email && (
                <p className="text-red-600 text-xs mt-1">{loginErrors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Password
              </label>
              <input
                {...registerLogin("password")}
                type="password"
                placeholder="Enter your password"
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              {loginErrors.password && (
                <p className="text-red-600 text-xs mt-1">{loginErrors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin"></div>
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
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <input
                {...registerOTPReq("email")}
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              {otpReqErrors.email && (
                <p className="text-red-600 text-xs mt-1">{otpReqErrors.email.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin"></div>
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
            <div className="bg-neutral-100 rounded-lg p-4 text-center">
              <p className="text-neutral-600 text-sm">OTP sent to <strong className="text-black">{otpEmail}</strong></p>
              <p className="text-neutral-400 text-xs mt-1">Valid for 10 minutes</p>
            </div>
            <input type="hidden" {...registerOTPVerify("email")} value={otpEmail} />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Enter OTP
              </label>
              <input
                {...registerOTPVerify("otp")}
                type="text"
                placeholder="123456"
                maxLength={6}
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 rounded-lg text-black placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all text-center text-xl tracking-[0.5em] font-mono"
              />
              {otpVerifyErrors.otp && (
                <p className="text-red-600 text-xs mt-1">{otpVerifyErrors.otp.message}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="flex-1 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-black font-medium rounded-lg transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Verify & Login"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <p className="text-neutral-500 text-xs font-medium mb-3">Demo Credentials</p>
          <div className="space-y-2">
            {[
              { role: "Admin", email: "admin@autism.school", pass: "Admin@123" },
              { role: "Teacher", email: "teacher@autism.school", pass: "Test@1234" },
              { role: "Therapist", email: "therapist@autism.school", pass: "Test@1234" },
              { role: "Parent", email: "parent@autism.school", pass: "Test@1234" },
            ].map(({ role, email, pass }) => (
              <div key={role} className="flex items-center justify-between gap-2">
                <span className="text-neutral-400 text-xs w-16">{role}</span>
                <span className="text-neutral-700 text-xs font-mono flex-1">{email}</span>
                <span className="text-neutral-500 text-xs font-mono">{pass}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
