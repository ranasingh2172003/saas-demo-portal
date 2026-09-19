"use client";
import { Mic } from "lucide-react";

export default function VoiceReceptionist() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-[#0a0a0f] text-slate-900 dark:text-white flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voice Receptionist</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">AI-powered voice agent — backend rebuilding.</p>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[400px]">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-5">
          <Mic className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Backend Rebuilding</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
          The voice agent backend is being rebuilt from scratch with a better architecture. Check back soon.
        </p>
      </div>
    </div>
  );
}
