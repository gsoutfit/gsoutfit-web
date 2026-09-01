"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("Resol");
  const [username, setUsername] = useState("Resol");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminSecretKey, setAdminSecretKey] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name || !username || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          adminSecretKey: adminSecretKey || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "Verification code dispatched.");
        setTimeout(() => {
          router.push(
            `/admin/verify?email=${encodeURIComponent(email)}&username=${encodeURIComponent(
              username
            )}`
          );
        }, 1500);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err?.message || "A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#141418] border border-[#D4AF37]/40 shadow-gold mb-2">
            <Shield className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="font-cinzel text-xl font-black tracking-[0.25em] text-white">
            GENTLEMAN
          </div>
          <div className="text-[10px] font-extrabold tracking-[0.5em] text-[#D4AF37] uppercase -mt-1">
            SAVAGE
          </div>
          <p className="text-xs text-zinc-400 font-medium pt-1">
            Executive Admin Onboarding & Security Verification
          </p>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Resol"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                Admin Username
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Resol"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                Corporate / Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resol@gentlemensavage.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1 tracking-wider">
                Admin Master Passcode <span className="text-zinc-600 lowercase font-normal">(optional)</span>
              </label>
              <input
                type="password"
                value={adminSecretKey}
                onChange={(e) => setAdminSecretKey(e.target.value)}
                placeholder="Leave blank for standard onboarding"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold uppercase tracking-wider text-xs shadow-gold transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Verification Pin...
                </>
              ) : (
                <>
                  Register Admin & Send OTP <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center text-xs text-zinc-400">
            <Link href="/admin/login" className="hover:text-[#D4AF37] transition-colors">
              ← Back to Admin Login
            </Link>
            <Link href="/admin/verify" className="text-[#D4AF37] font-semibold hover:underline">
              Have a 6-digit Code?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
