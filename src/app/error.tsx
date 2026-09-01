"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 rounded-full bg-rose-950/40 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-400">
            System Anomaly
          </p>
          <h1 className="font-serif-luxury text-3xl font-black text-white">
            Something Went Wrong
          </h1>
          <p className="text-xs text-zinc-400">
            An unexpected error occurred while loading this page.
          </p>
        </div>

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-gold"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
