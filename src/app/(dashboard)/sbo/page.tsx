"use client";
import { Cpu } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VoiceBuilder() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col p-6 md:p-10 relative">
      <Link href="/sbo/dashboard" className="absolute top-8 left-8 p-2 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Back to Dashboard</span>
      </Link>
      <div className="max-w-4xl mx-auto w-full mt-16 flex flex-col items-center justify-center flex-1 text-center">
        <div className="w-20 h-20 bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <Cpu className="w-9 h-9 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">AI Architect</h1>
        <p className="text-slate-400 max-w-md">The AI Architect backend is being rebuilt from scratch with a better, faster architecture. This will be live very soon.</p>
      </div>
    </div>
  );
}
