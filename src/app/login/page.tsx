"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please verify credentials.");
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const quickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Zeetork@2026");
    setErrorMessage(null);
  };

  return (
    <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-200 sm:px-10">
      <h2 className="text-lg font-bold text-slate-900 mb-6 text-center">
        Sign in to your account
      </h2>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Corporate Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@zeetork.com"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#FF2D01] focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#FF2D01] hover:bg-[#e02800] active:bg-[#c72300] shadow-md transition disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/zeetork-logo.jpeg"
            alt="Zeetork Automation & Controls"
            className="h-12 w-auto object-contain"
          />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Zeetork Automation & Controls
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Quality Control & Certificate Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Suspense
          fallback={
            <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
              Loading login portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        <div className="text-center mt-6 text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>Restricted to Authorized Company Personnel</span>
        </div>
      </div>
    </div>
  );
}
