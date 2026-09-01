"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

function AdminVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = searchParams?.get("email") || "";
  const initialUsername = searchParams?.get("username") || "Resol";

  const [identifier, setIdentifier] = useState(initialEmail || initialUsername);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(30);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Pasted full 6-digit code
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next box
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const fullCode = otp.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    if (!identifier) {
      setError("Please provide your admin email or username.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/verify-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : undefined,
          username: !identifier.includes("@") ? identifier : undefined,
          code: fullCode,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Verification successful! Opening Admin Console...");
        setTimeout(() => {
          router.push("/admin");
        }, 1200);
      } else {
        setError(data.message || "Invalid code. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Verification request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : undefined,
          username: !identifier.includes("@") ? identifier : undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg(data.message || "A fresh code has been sent.");
        setResendCooldown(45);
      } else {
        setError(data.message || "Could not resend code.");
      }
    } catch (err: any) {
      setError(err?.message || "Resend failed.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#141418] border border-[#D4AF37]/40 shadow-gold mb-2">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <div className="font-cinzel text-xl font-black tracking-[0.25em] text-white">
            GENTLEMAN
          </div>
          <div className="text-[10px] font-extrabold tracking-[0.5em] text-[#D4AF37] uppercase -mt-1">
            SAVAGE
          </div>
          <h1 className="text-base font-bold text-white pt-1">
            Admin OTP Verification
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Enter the 6-digit authentication pin dispatched to your executive email.
          </p>
        </div>

        {/* Verification Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121216] border border-[#24242B] shadow-2xl space-y-6">
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

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-1.5 tracking-wider">
                Admin Username or Email
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Resol or resol@gentlemensavage.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#0a0a0d] border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#D4AF37] text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase font-bold text-zinc-400 mb-2.5 tracking-wider text-center">
                6-Digit Security Code
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black rounded-2xl bg-[#0a0a0d] border-2 border-zinc-800 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-[#D4AF37] transition-all outline-none"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C365] text-black font-bold uppercase tracking-wider text-xs shadow-gold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Security Credentials...
                </>
              ) : (
                <>
                  Verify & Activate Admin Access <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Resend Actions */}
          <div className="pt-3 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-zinc-400">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-[#D4AF37] transition-colors disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
            </button>

            <Link href="/admin/login" className="hover:text-[#D4AF37] transition-colors">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070709] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
        </div>
      }
    >
      <AdminVerifyContent />
    </Suspense>
  );
}
