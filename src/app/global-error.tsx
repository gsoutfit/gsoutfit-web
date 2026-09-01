"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0B0C] text-[#FAF8F5] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-rose-950/40 border border-rose-800/60 flex items-center justify-center mx-auto text-rose-400">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Application Error</h1>
            <p className="text-xs text-zinc-400">
              A critical error occurred. Please reload the application.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
