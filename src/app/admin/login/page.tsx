"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, KeyRound, AlertCircle, Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setUnverifiedEmail(null);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.message || "Invalid administrative credentials.");
        if (res.message?.includes("verification") || res.message?.includes("verify")) {
          setUnverifiedEmail(identifier);
        }
      }
    } catch {
      setError("Authentication failed. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37] shadow-gold">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-widest text-white mt-3">
            GENTLEMAN SAVAGE
          </h1>
          <p className="text-xs uppercase font-bold tracking-[0.25em] text-[#D4AF37]">
            Master Administrative Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="p-8 rounded-3xl bg-[#121216] border border-[#24242B] shadow-2xl space-y-6">
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Secure Staff Authentication
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Authorized personnel only. Sessions are monitored and rate-limited.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 space-y-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              {unverifiedEmail && (
                <div className="pt-1">
                  <Link
                    href={`/admin/verify?email=${encodeURIComponent(unverifiedEmail)}`}
                    className="inline-flex items-center gap-1 text-[#D4AF37] font-bold hover:underline"
                  >
                    Click here to enter your 6-digit verification code →
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                Administrator Username or Email
              </label>
              <input
                type="text"
                required
                placeholder="Resol or resol@gentlemensavage.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1 uppercase tracking-wider">
                Master Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-[#18181f] border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#E5C365] via-[#D4AF37] to-[#A98725] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-gold disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Authenticate Session <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secondary Actions */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-col gap-2.5 text-xs text-zinc-400">
            <div className="flex justify-between items-center">
              <Link
                href="/admin/register"
                className="text-zinc-300 hover:text-[#D4AF37] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#D4AF37]" /> Register New Admin
              </Link>

              <Link
                href="/admin/verify"
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Verify 6-Digit OTP Code
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link href="/" className="text-zinc-500 hover:text-[#D4AF37] transition-colors text-[11px]">
                ← Return to Customer Storefront
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
