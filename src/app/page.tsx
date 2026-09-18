"use client";
import { motion } from "framer-motion";
import { Mic, Code2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootRedirect() {
  const router = useRouter();

  // If the user has already chosen a track, redirect them to the right place.
  // For now, redirect to the SBO dashboard as the default landing experience.
  useEffect(() => {
    const track = typeof window !== "undefined" ? localStorage.getItem("user_track") : null;
    if (track === "developer") {
      router.replace("/developer");
    } else if (track === "sbo") {
      router.replace("/sbo/dashboard");
    }
    // If no track set, show the onboarding fork screen below
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-8 text-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">🚀 AI Agent Platform</h1>
        <p className="text-xl text-gray-400">Two tracks. One powerful platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex-1"
        >
          <Link
            href="/sbo/dashboard"
            onClick={() => typeof window !== "undefined" && localStorage.setItem("user_track", "sbo")}
          >
            <div className="h-full flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-blue-950 to-blue-900 border border-blue-700 hover:scale-105 transition-transform cursor-pointer">
              <Mic className="w-16 h-16 text-blue-400 mb-6" />
              <h2 className="text-2xl font-semibold mb-3">I&apos;m a Business Owner</h2>
              <p className="text-blue-200 mb-8 flex-1">Build AI agents by talking. No code needed.</p>
              <span className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors w-full text-center block">
                Enter as Business Owner
              </span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex-1"
        >
          <Link
            href="/developer"
            onClick={() => typeof window !== "undefined" && localStorage.setItem("user_track", "developer")}
          >
            <div className="h-full flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-b from-green-950 to-green-900 border border-green-700 hover:scale-105 transition-transform cursor-pointer">
              <Code2 className="w-16 h-16 text-green-400 mb-6" />
              <h2 className="text-2xl font-semibold mb-3">I&apos;m a Developer</h2>
              <p className="text-green-200 mb-8 flex-1">Build AI agents visually with drag &amp; drop IDE.</p>
              <span className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors w-full text-center block">
                Enter as Developer
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      <p className="mt-12 text-gray-600 text-sm">
        Already set up?{" "}
        <Link href="/sbo/dashboard" className="text-blue-400 hover:underline">Go to Dashboard →</Link>
      </p>
    </div>
  );
}
