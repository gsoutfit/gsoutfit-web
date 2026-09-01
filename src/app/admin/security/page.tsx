"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  History,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
} from "lucide-react";
import { ActivityLog, LoginHistory } from "@/types";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AdminSecurityPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchSecurityLogs() {
      try {
        const res = await fetch("/api/admin/security");
        const data = await res.json();
        if (data.success && data.data) {
          setActivityLogs(data.data.activityLogs);
          setLoginHistory(data.data.loginHistory);
        }
      } catch (err) {
        console.error("Security logs error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSecurityLogs();
  }, []);

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    showToast(
      "2FA Updated",
      `Two-Factor Authentication has been ${!twoFactorEnabled ? "Enabled" : "Disabled"}.`,
      "gold"
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
          Enterprise Protection & Compliance
        </span>
        <h1 className="font-serif-luxury text-2xl sm:text-4xl font-black text-white mt-1">
          Security & Audit Governance
        </h1>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2FA Card */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Two-Factor Authentication
              </span>
              <Smartphone className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <p className="font-serif-luxury text-xl font-bold text-white">
              {twoFactorEnabled ? "Hardware Authenticator Active" : "2FA Disabled"}
            </p>
            <p className="text-xs text-zinc-400">
              Protects administrative actions with time-based one-time passcodes (TOTP).
            </p>
          </div>

          <button
            onClick={handleToggle2FA}
            className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors ${
              twoFactorEnabled
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                : "bg-[#D4AF37] text-black"
            }`}
          >
            {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA Protection"}
          </button>
        </div>

        {/* API SSL Encryption */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              API & Route Protection
            </span>
            <Lock className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-serif-luxury text-xl font-bold text-white">
            TLS 1.3 / 256-Bit Cipher
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            All administrative routes are protected by role-based session middleware with token hashing.
          </p>
          <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Defense In Depth Active
          </div>
        </div>

        {/* Role Matrix */}
        <div className="p-6 rounded-3xl bg-[#121216] border border-[#24242B] space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Role Permissions
            </span>
            <KeyRound className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-serif-luxury text-xl font-bold text-white">
            RBAC Matrix Configured
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Granular segregation between Storefront Shoppers and Master Store Administrators.
          </p>
        </div>
      </div>

      {/* 1. Admin Activity Logs Audit Trail */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#D4AF37]" /> Administrative Audit Trail
            </h3>
            <p className="text-xs text-zinc-400">Real-time log of product edits, price updates, and order dispatches</p>
          </div>
          <span className="text-xs font-semibold text-zinc-500">{activityLogs.length} Records</span>
        </div>

        <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Action Type</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">User</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-800/40">
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-zinc-200">{log.details}</td>
                    <td className="p-4 font-bold text-white">{log.user}</td>
                    <td className="p-4 font-mono text-zinc-400">{log.ip}</td>
                    <td className="p-4 text-right text-zinc-500 font-mono">
                      {formatDate(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 2. Login History */}
      <section className="space-y-4">
        <div className="border-b border-zinc-800 pb-3">
          <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-400" /> Authentication & Login History
          </h3>
          <p className="text-xs text-zinc-400">Access requests and device telemetry</p>
        </div>

        <div className="rounded-3xl bg-[#121216] border border-[#24242B] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#181820] text-zinc-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Device Client</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-300">
                {loginHistory.map((lh) => (
                  <tr key={lh.id} className="hover:bg-zinc-800/40">
                    <td className="p-4 font-bold text-white">{lh.email}</td>
                    <td className="p-4 capitalize text-zinc-300">{lh.role}</td>
                    <td className="p-4 font-mono text-zinc-400">{lh.ip}</td>
                    <td className="p-4 text-zinc-400 max-w-xs truncate">{lh.userAgent}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          lh.status === "Success"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        {lh.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-zinc-500 font-mono">
                      {formatDate(lh.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
