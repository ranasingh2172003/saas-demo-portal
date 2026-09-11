"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Phone,
  Settings2,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Smile,
  Copy,
  RotateCcw,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface TranscriptMessage {
  role: "agent" | "user";
  text: string;
}

interface CallSummary {
  callerSentiment: string;
  sentimentScore: string;
  emergencyClassification: string;
  extractedAddress: string;
  bookedSlot: string;
  duration: string;
  totalTurns: number;
}

const CONVERSATION_SCENARIOS = {
  emergency: [
    { role: "agent" as const, text: "Hi, this is Apex Cooling. How can I help you today?" },
    { role: "user" as const, text: "My AC stopped working, it's 92 degrees inside and I need someone right away." },
    { role: "agent" as const, text: "I'm so sorry to hear that. We treat severe heat conditions as top priority. We have an emergency technician available today at 4:00 PM. Would you like me to book that slot for you?" },
    { role: "user" as const, text: "Yes, 4:00 PM works perfectly! My address is 742 Evergreen Terrace, Suite B." },
    { role: "agent" as const, text: "Great! I've confirmed Dave K. for 4:00 PM at 742 Evergreen Terrace. A confirmation text with live GPS tracking has been sent to your phone. Stay cool, and see you soon!" },
  ],
  commercial: [
    { role: "agent" as const, text: "Apex Cooling Commercial Division, how may I assist your facility today?" },
    { role: "user" as const, text: "We need an annual maintenance quote for our three rooftop HVAC chillers." },
    { role: "agent" as const, text: "Understood. Our commercial preventative contracts cover quarterly inspections, coil washing, and 24/7 zero-fee dispatch. Could you confirm your building square footage?" },
    { role: "user" as const, text: "Around 45,000 square feet over two floors." },
    { role: "agent" as const, text: "Perfect. I've scheduled our senior commercial estimator to visit tomorrow at 10:00 AM with a customized proposal. You'll receive full details via email." },
  ],
};

export default function VoiceReceptionist() {
  const toast = useToast();

  const [isActive, setIsActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<"emergency" | "commercial">("emergency");

  const [transcript, setTranscript] = useState<TranscriptMessage[]>([
    { role: "agent", text: "Hi, this is Apex Cooling. How can I help you today?" },
  ]);

  const [callEnded, setCallEnded] = useState(false);
  const [lastCallSummary, setLastCallSummary] = useState<CallSummary | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Configuration Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [agentPersona, setAgentPersona] = useState(
    "You are Alex, an empathetic and highly professional virtual receptionist for Apex Cooling & HVAC. Your goal is to de-escalate customer stress, classify heating and AC emergencies, and book certified technician appointments with zero friction."
  );
  const [greetingText, setGreetingText] = useState(
    "Hi, this is Apex Cooling. How can I help you today?"
  );
  const [escalationRules, setEscalationRules] = useState(
    "Escalate immediately if caller mentions gas smells, electrical burning, water leaking into living areas, or total HVAC loss during temperatures exceeding 90°F or below 40°F."
  );
  const [selectedVoice, setSelectedVoice] = useState("en-US-Neural2-F");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // Web Speech API Voice synthesis helper
  const speakDialogue = useCallback(
    (text: string) => {
      if (isAudioMuted) return;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.volume = 1.0;

        // Pick matching voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(
          (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Google"))
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    },
    [isAudioMuted]
  );

  // Call Duration Ticker
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive]);

  // Auto scroll transcript
  useEffect(() => {
    if (transcriptBottomRef.current) {
      transcriptBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript]);

  const handleEndCall = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsActive(false);
    setCallEnded(true);

    const mins = Math.floor(callSeconds / 60);
    const secs = callSeconds % 60;
    const formattedDuration = `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;

    const summary: CallSummary = {
      callerSentiment:
        selectedScenario === "emergency"
          ? "Relieved / Highly Satisfied"
          : "Professional / Interested",
      sentimentScore: "96% Positive",
      emergencyClassification:
        selectedScenario === "emergency"
          ? "Priority Residential Dispatch (AC Failure in High Heat)"
          : "Standard Commercial Lead (HVAC Chiller Maintenance)",
      extractedAddress:
        selectedScenario === "emergency"
          ? "742 Evergreen Terrace, Suite B"
          : "45,000 sq ft Commercial Facility (Central District)",
      bookedSlot:
        selectedScenario === "emergency"
          ? "Today at 4:00 PM (Tech: Dave K. assigned)"
          : "Tomorrow at 10:00 AM (Commercial Estimator assigned)",
      duration: formattedDuration === "00:00" ? "00:14" : formattedDuration,
      totalTurns: transcript.length,
    };

    setLastCallSummary(summary);
    toast.success("Call completed", "Post-call summary card generated.");
  }, [callSeconds, selectedScenario, transcript.length, toast]);

  const handleStartCall = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const script = CONVERSATION_SCENARIOS[selectedScenario];
    setTranscript([{ role: "agent", text: greetingText || script[0].text }]);
    setCallSeconds(0);
    setCallEnded(false);
    setLastCallSummary(null);
    setIsActive(true);
    toast.info("Call started", "Inbound simulation connected.");
    speakDialogue(greetingText || script[0].text);
  }, [greetingText, selectedScenario, speakDialogue, toast]);

  // Simulated Conversation Step Machine
  useEffect(() => {
    if (!isActive) return;

    const script = CONVERSATION_SCENARIOS[selectedScenario];
    const currentIndex = transcript.length;

    if (currentIndex === 1) {
      // Speak initial greeting
      speakDialogue(script[0].text);
    }

    if (currentIndex < script.length) {
      const nextMessage = script[currentIndex];
      const delay = nextMessage.role === "user" ? 3000 : 3500;

      const timer = setTimeout(() => {
        setTranscript((prev) => [...prev, nextMessage]);
        if (nextMessage.role === "agent") {
          speakDialogue(nextMessage.text);
        }
      }, delay);

      return () => clearTimeout(timer);
    } else if (currentIndex >= script.length) {
      // Script completed automatically
      const endTimer = setTimeout(() => {
        handleEndCall();
      }, 4000);
      return () => clearTimeout(endTimer);
    }
  }, [isActive, transcript.length, selectedScenario, speakDialogue, handleEndCall]);

  const copySummaryText = () => {
    if (!lastCallSummary) return;
    const text = `Apex Cooling Post-Call Summary\n- Duration: ${lastCallSummary.duration}\n- Sentiment: ${lastCallSummary.callerSentiment} (${lastCallSummary.sentimentScore})\n- Classification: ${lastCallSummary.emergencyClassification}\n- Address: ${lastCallSummary.extractedAddress}\n- Booked Slot: ${lastCallSummary.bookedSlot}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Mic className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            AI Voice Receptionist
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Answers inbound customer phone calls 24/7, handles objections, speaks aloud, and books appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Audio Mute / Unmute Toggle */}
          <button
            onClick={() => {
              const nextMuted = !isAudioMuted;
              setIsAudioMuted(nextMuted);
              if (nextMuted && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              toast.info(nextMuted ? "Voice audio muted" : "Voice audio enabled (TTS)");
            }}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
              isAudioMuted
                ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isAudioMuted ? "Audio Muted" : "TTS Speech Active"}</span>
          </button>

          {/* Configure AI Prompt Button */}
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Configure AI Prompt
          </button>
        </div>
      </div>

      {/* Scenario Selector & Call Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">
            Scenario:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={isActive}
              onClick={() => setSelectedScenario("emergency")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedScenario === "emergency"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              } disabled:opacity-50`}
            >
              Residential Emergency AC
            </button>
            <button
              disabled={isActive}
              onClick={() => setSelectedScenario("commercial")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedScenario === "commercial"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              } disabled:opacity-50`}
            >
              Commercial HVAC Quote
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pr-2">
          {isActive ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                LIVE {formatTimer(callSeconds)}
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Line Ready
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Simulator & Live Transcript */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left: Call Simulator Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-between shadow-sm relative overflow-hidden transition-colors min-h-[440px]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 dark:from-blue-900/10 to-transparent pointer-events-none" />

          {/* Top telemetry in card */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 z-10">
            <span className="font-mono">Inbound Line #419</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Web Speech API
            </span>
          </div>

          {/* Center Mic & Visualizer Waves */}
          <div className="relative z-10 flex flex-col items-center my-6">
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none"
              >
                <div className="w-48 h-48 bg-blue-100 dark:bg-blue-500/20 rounded-full animate-ping opacity-75" />
                <div className="absolute w-64 h-64 bg-blue-50 dark:bg-blue-500/10 rounded-full animate-ping opacity-50 animation-delay-500" />
              </motion.div>
            )}

            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 z-10 ${
                isActive
                  ? "bg-blue-600 shadow-blue-600/40 scale-105"
                  : "bg-slate-100 dark:bg-slate-800 shadow-slate-200/50 dark:shadow-none"
              }`}
            >
              <Mic
                className={`w-10 h-10 ${
                  isActive ? "text-white animate-pulse" : "text-slate-400 dark:text-slate-500"
                }`}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-6">
              {isActive ? "Call in Progress..." : "Virtual Receptionist Ready"}
            </h2>

            {/* Real-time Audio Waveform */}
            <div className="mt-4 flex items-center justify-center gap-1.5 h-10 px-4">
              {[35, 65, 80, 50, 95, 75, 45, 85, 90, 60, 70, 85, 55, 95, 70, 40].map(
                (height, i) => (
                  <motion.span
                    key={i}
                    animate={{
                      height: isActive
                        ? [`${Math.max(15, height * 0.25)}%`, `${height}%`, `${Math.max(15, height * 0.2)}%`]
                        : "15%",
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.7 + (i % 4) * 0.2,
                      ease: "easeInOut",
                    }}
                    className={`w-1 rounded-full transition-colors ${
                      isActive ? "bg-blue-500 dark:bg-blue-400" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )
              )}
            </div>

            <p className="text-slate-500 dark:text-slate-400 mt-3 text-center max-w-xs text-xs leading-relaxed">
              {isActive
                ? "AI receptionist is speaking aloud and listening with sub-600ms latency."
                : "Simulate an inbound customer phone call to test speech synthesis, objection handling, and booking."}
            </p>
          </div>

          {/* Action Button */}
          <div className="z-10 w-full flex justify-center">
            <button
              onClick={() => {
                if (isActive) {
                  handleEndCall();
                } else {
                  handleStartCall();
                }
              }}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                isActive
                  ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
              }`}
            >
              {isActive ? (
                <>
                  <PhoneOff className="w-4 h-4" /> End Call
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" /> Simulate Call
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Live Transcript & Post-Call Summary */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors min-h-[440px]">
          {/* Transcript Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-950/50 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Live Conversation Transcript
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audio synthesized & transcribed in real-time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {transcript.length} turns
              </span>
            </div>
          </div>

          {/* Transcript Messages Container */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
            {transcript.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 opacity-75">
                    {msg.role === "agent" && <Sparkles className="w-3 h-3 text-blue-500" />}
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      {msg.role === "user" ? "Inbound Caller" : "Alex (Virtual Receptionist)"}
                    </p>
                  </div>
                  <p className="leading-relaxed text-xs sm:text-sm">{msg.text}</p>
                </div>
              </motion.div>
            ))}
            <div ref={transcriptBottomRef} />
          </div>

          {/* Post-Call Summary Card (Displayed when call has concluded) */}
          {callEnded && lastCallSummary && (
            <div className="border-t border-slate-200 dark:border-slate-800 p-5 bg-blue-50/40 dark:bg-blue-950/20 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Post-Call Operational Summary
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Auto-extracted call telemetry & dispatch record
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={copySummaryText}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors shadow-xs"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStartCall}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 transition-colors shadow-xs"
                  >
                    <RotateCcw className="w-3 h-3" /> New Call
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <Smile className="w-3.5 h-3.5 text-emerald-500" /> Caller Sentiment
                  </div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{lastCallSummary.callerSentiment}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                      {lastCallSummary.sentimentScore}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Classification
                  </div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white truncate">
                    {lastCallSummary.emergencyClassification}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Extracted Address
                  </div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white truncate">
                    {lastCallSummary.extractedAddress}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Booked Appointment
                  </div>
                  <div className="mt-1 font-bold text-slate-900 dark:text-white truncate">
                    {lastCallSummary.bookedSlot}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── MODAL: CONFIGURE AI PROMPT ────────────────────────────────────────── */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" />
            <span>Configure AI Receptionist Persona & Rules</span>
          </div>
        }
        description="Fine-tune how your automated agent handles calls, identifies emergencies, and greets new callers."
        size="2xl"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsConfigOpen(false);
                toast.success("AI Receptionist configuration updated successfully!");
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Initial Greeting Text
            </label>
            <input
              type="text"
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              AI Persona & Behavior System Prompt
            </label>
            <textarea
              rows={4}
              value={agentPersona}
              onChange={(e) => setAgentPersona(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Emergency Escalation Rules
            </label>
            <textarea
              rows={3}
              value={escalationRules}
              onChange={(e) => setEscalationRules(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Synthetic Voice Model
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en-US-Neural2-F">Alex (Neural Female - Warm & Reassuring)</option>
                <option value="en-US-Neural2-D">David (Neural Male - Professional Dispatch)</option>
                <option value="en-GB-Standard-A">Emma (British English - Calm)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Inactivity Timeout
              </label>
              <select className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>8 seconds (Standard)</option>
                <option>12 seconds (Patient)</option>
                <option>5 seconds (Fast Dispatch)</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

