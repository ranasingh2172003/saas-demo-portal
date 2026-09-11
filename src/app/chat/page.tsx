"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Zap,
  CheckCheck,
  Bot,
  Radio,
  Server,
  Sparkles,
  Send,
  AlertTriangle,
  Search,
  X,
  UserCheck,
  CornerDownLeft,
  Filter,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/Toast";

// ─── Intent classifier (runs on the client for demo) ──────────────────────────
interface IntentRule {
  pattern?: RegExp;
  label: string;
  color: string;
  emoji: string;
}

const INTENT_RULES: IntentRule[] = [
  {
    pattern: /book|appoint|schedule|slot|availab|when can|come over|visit/i,
    label: "Booking Request",
    color:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
    emoji: "📅",
  },
  {
    pattern: /price|cost|charge|fee|how much|rate|quote|estimate/i,
    label: "Price Inquiry",
    color:
      "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
    emoji: "💰",
  },
  {
    pattern: /emergency|urgent|broken|leak|not work|issue|problem|help/i,
    label: "Urgent Issue",
    color:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
    emoji: "🚨",
  },
  {
    pattern: /thank|thanks|great|awesome|perfect|received|got it/i,
    label: "Positive Feedback",
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
    emoji: "👍",
  },
  {
    pattern: /reschedule|cancel|postpone|change.*(date|time|appoint)/i,
    label: "Reschedule",
    color:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/30",
    emoji: "🔄",
  },
  {
    pattern: /install|replace|new|upgrade|add/i,
    label: "Installation Query",
    color:
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30",
    emoji: "🔧",
  },
];

function classifyIntent(text: string): IntentRule {
  for (const rule of INTENT_RULES) {
    if (rule.pattern?.test(text)) return rule;
  }
  return {
    label: "General Inquiry",
    color:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    emoji: "💬",
  };
}

// ─── Simulated messages for interactive demo ─────────────────────────────────
const DEMO_SCENARIOS = [
  {
    label: "Book Emergency AC",
    text: "Hey! Do you guys do emergency AC repairs on weekends?",
    sender: "+1 (555) 0192",
  },
  {
    label: "Tune-up Price",
    text: "How much does a commercial HVAC tune-up and filter change cost?",
    sender: "+1 (555) 9931",
  },
  {
    label: "Book Tech",
    text: "I need to book a technician for tomorrow morning at our main office.",
    sender: "+1 (555) 2341",
  },
  {
    label: "Rattling Noise",
    text: "The chiller installed last week is making a weird rattling noise.",
    sender: "+1 (555) 6622",
  },
  {
    label: "Service Thanks",
    text: "Thanks! Received the maintenance report. Really appreciate the quick dispatch.",
    sender: "+1 (555) 1177",
  },
  {
    label: "Reschedule",
    text: "Can I reschedule our rooftop inspection from Thursday to Friday afternoon?",
    sender: "+1 (555) 8843",
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface LiveMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  intent: IntentRule;
  aiReply: string;
  replying: boolean;
  replied: boolean;
  operatorReply?: string;
  operatorTime?: string;
  operatorName?: string;
}

type IntentFilterType = "All" | "Emergency" | "Maintenance" | "Quote" | "Lead";

export default function ChatAgent() {
  const toast = useToast();

  const [mode, setMode] = useState<"simulator" | "live">("simulator");
  const [liveStatus, setLiveStatus] = useState<
    "connecting" | "qr_ready" | "connected" | "logged_out"
  >("connecting");
  const status = mode === "simulator" ? "connected" : liveStatus;
  const [liveServerUrl] = useState(
    process.env.NEXT_PUBLIC_WHATSAPP_STREAM_URL || "http://localhost:3000/api/stream"
  );
  const [liveError, setLiveError] = useState<string | null>(null);

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [qrExpired, setQrExpired] = useState(false);

  // Search & Intent filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState<IntentFilterType>("All");

  // Operator manual takeover state
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(1);
  const [operatorReplyText, setOperatorReplyText] = useState("");

  // Initial rich sample conversation
  const [messages, setMessages] = useState<LiveMessage[]>([
    {
      id: 1,
      sender: "+1 (555) 0192",
      text: "Hey! Do you guys do emergency AC repairs on weekends?",
      time: "10:14 AM",
      intent: classifyIntent("emergency AC repairs"),
      aiReply:
        "We're on it! 🚨 I'm flagging this as urgent and checking technician availability right now. Can you share your facility address so we can dispatch the nearest technician?",
      replying: false,
      replied: true,
      operatorReply:
        "On-call dispatch update: Senior technician Dave K. has been assigned and is rolling out from our Central Depot. ETA is 25 minutes.",
      operatorTime: "10:16 AM",
      operatorName: "Sarah (Lead Dispatcher)",
    },
    {
      id: 2,
      sender: "+1 (555) 2341",
      text: "I need to book a technician for tomorrow morning at 9 AM.",
      time: "10:28 AM",
      intent: classifyIntent("book a technician for tomorrow morning"),
      aiReply:
        "Hi! 👋 We have slots available tomorrow at 9 AM and 2 PM. I have tentatively reserved 9 AM for your company. Would you like me to send the calendar confirmation?",
      replying: false,
      replied: true,
    },
  ]);

  const [totalHandled, setTotalHandled] = useState(2);
  const [simulating, setSimulating] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const switchMode = (newMode: "simulator" | "live") => {
    setMode(newMode);
    if (newMode === "simulator") {
      setLiveError(null);
      toast.info("Switched to Interactive Demo Simulator");
    } else {
      toast.info("Connecting to Live WhatsApp Server...");
    }
  };

  // ─── SSE: connect to live WhatsApp backend only when in 'live' mode ─────────
  useEffect(() => {
    if (mode !== "live") return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(liveServerUrl);

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "status") {
            setLiveStatus(data.status);
            if (data.qr) {
              setQrCode(data.qr);
              setQrExpired(false);
              startTimer();
            }
            if (data.status === "connected") {
              setQrCode(null);
              stopTimer();
              toast.success("WhatsApp Daemon Connected Successfully!");
            }
          }
          if (data.type === "message") {
            pushMessage(data.sender, data.text);
          }
        } catch (e) {
          console.error("SSE parse error:", e);
        }
      };

      es.onerror = () => {
        setLiveStatus("connecting");
        setLiveError(
          `Live WhatsApp daemon at ${liveServerUrl} is unreachable. You can continue testing in Interactive Demo Simulator.`
        );
      };
    } catch (err) {
      console.warn("EventSource initialization error:", err);
    }

    return () => {
      if (es) es.close();
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, liveServerUrl]);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  // ─── QR Timer ──────────────────────────────────────────────────────────────
  function startTimer() {
    stopTimer();
    setTimerSeconds(60);
    setQrExpired(false);
    timerRef.current = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          stopTimer();
          setQrExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }
  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // ─── AI reply generator ───────────────────────────────────────────────────
  function generateReply(intent: string): string {
    const replies: Record<string, string> = {
      "Booking Request":
        "Hi! 👋 We have slots available tomorrow at 9 AM and 2 PM. Which works better for you? I can confirm your booking right away!",
      "Price Inquiry":
        "Great question! Our standard commercial HVAC tune-up is $129, which includes a 24-point inspection and coil cleaning. We also offer quarterly maintenance contracts. Would you like our complete rate sheet?",
      "Urgent Issue":
        "We're on it! 🚨 I've flagged your message as an emergency and checked technician availability. Can you provide your facility address so our nearest response unit can roll out?",
      "Positive Feedback":
        "So glad to hear that! 😊 We really appreciate your kind words. If you ever need emergency AC service, we are available 24/7. Have a wonderful day!",
      Reschedule:
        "No problem at all! I've noted your reschedule request. What date and time works best for you? I'll update your appointment immediately.",
      "Installation Query":
        "Absolutely! We handle rooftop unit installations and high-efficiency heat pump replacements. Could you tell me your building square footage? I'll prepare a preliminary quote.",
      "General Inquiry":
        "Thanks for reaching out to Apex Cooling! 👋 Happy to help. Could you share a few more details about your HVAC requirements? Our dispatch team is standing by.",
    };
    return replies[intent] || replies["General Inquiry"];
  }

  // ─── Push incoming message ─────────────────────────────────────────────────
  function pushMessage(sender: string, text: string) {
    const intent = classifyIntent(text);
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const id = Date.now();

    const msg: LiveMessage = {
      id,
      sender,
      text,
      time: now,
      intent,
      aiReply: "",
      replying: true,
      replied: false,
    };
    setMessages((prev) => [...prev, msg]);
    setSelectedTargetId(id);
    setTotalHandled((n) => n + 1);

    toast.info("Incoming WhatsApp message", `${sender}: "${text.slice(0, 35)}..."`);

    // Simulate AI thinking delay, then display response
    setTimeout(() => {
      const reply = generateReply(intent.label);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, aiReply: reply, replying: false, replied: true } : m
        )
      );
    }, 1200);
  }

  // ─── Simulate random message ───────────────────────────────────────────────
  function runSimulation(scenario?: (typeof DEMO_SCENARIOS)[0]) {
    if (simulating) return;
    setSimulating(true);
    const chosen = scenario || DEMO_SCENARIOS[Math.floor(Math.random() * DEMO_SCENARIOS.length)];
    pushMessage(chosen.sender, chosen.text);
    setTimeout(() => setSimulating(false), 1500);
  }

  // ─── Custom Message Handler ────────────────────────────────────────────────
  function handleCustomSend(e: React.FormEvent) {
    e.preventDefault();
    if (!customInput.trim() || simulating) return;
    pushMessage("+1 (555) 7490", customInput.trim());
    setCustomInput("");
  }

  // ─── Operator Takeover Handler ─────────────────────────────────────────────
  function handleOperatorSend(e?: React.FormEvent, presetText?: string) {
    if (e) e.preventDefault();
    const replyContent = presetText || operatorReplyText;
    if (!replyContent.trim()) return;

    const targetMsg = messages.find((m) => m.id === selectedTargetId) || messages[messages.length - 1];
    if (!targetMsg) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) =>
      prev.map((m) =>
        m.id === targetMsg.id
          ? {
              ...m,
              operatorReply: replyContent.trim(),
              operatorTime: now,
              operatorName: "Sarah (Human Dispatcher)",
            }
          : m
      )
    );

    setOperatorReplyText("");
    toast.success("Operator reply dispatched!", `Sent to ${targetMsg.sender}`);
  }

  // ─── Compute Filtered Messages & Counts ────────────────────────────────────
  const intentCounts = {
    All: messages.length,
    Emergency: messages.filter((m) => m.intent.label === "Urgent Issue").length,
    Maintenance: messages.filter(
      (m) => m.intent.label === "Installation Query" || m.intent.label === "Reschedule"
    ).length,
    Quote: messages.filter((m) => m.intent.label === "Price Inquiry").length,
    Lead: messages.filter(
      (m) =>
        m.intent.label === "Booking Request" ||
        m.intent.label === "General Inquiry" ||
        m.intent.label === "Positive Feedback"
    ).length,
  };

  const filteredMessages = messages.filter((msg) => {
    // Intent filter
    if (intentFilter === "Emergency" && msg.intent.label !== "Urgent Issue") return false;
    if (
      intentFilter === "Maintenance" &&
      msg.intent.label !== "Installation Query" &&
      msg.intent.label !== "Reschedule"
    )
      return false;
    if (intentFilter === "Quote" && msg.intent.label !== "Price Inquiry") return false;
    if (
      intentFilter === "Lead" &&
      msg.intent.label !== "Booking Request" &&
      msg.intent.label !== "General Inquiry" &&
      msg.intent.label !== "Positive Feedback"
    )
      return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        msg.sender.toLowerCase().includes(q) ||
        msg.text.toLowerCase().includes(q) ||
        msg.aiReply.toLowerCase().includes(q) ||
        (msg.operatorReply && msg.operatorReply.toLowerCase().includes(q)) ||
        msg.intent.label.toLowerCase().includes(q);
      if (!matches) return false;
    }

    return true;
  });

  const selectedTargetMessage =
    messages.find((m) => m.id === selectedTargetId) || messages[messages.length - 1];

  const timerPct = (timerSeconds / 60) * 100;
  const timerColor = timerSeconds > 30 ? "#25d366" : timerSeconds > 15 ? "#f59e0b" : "#ef4444";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <MessageSquare className="w-8 h-8 text-[#25D366]" />
            WhatsApp AI Agent
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Real-time conversational intake, zero-latency intent classification, search filters, and operator manual takeover.
          </p>
        </div>

        {/* Mode Switcher & Telemetry Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => switchMode("simulator")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                mode === "simulator"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Demo Simulator
            </button>
            <button
              onClick={() => switchMode("live")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                mode === "live"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              Live Server
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#1da851] dark:text-[#25D366] text-xs font-semibold px-3 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            {totalHandled} processed
          </div>
        </div>
      </div>

      {/* Live Server Mode Warning */}
      {mode === "live" && liveError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Local daemon offline</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{liveError}</p>
            </div>
          </div>
          <button
            onClick={() => switchMode("simulator")}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
          >
            Switch to Demo Simulator
          </button>
        </div>
      )}

      {/* ── LIVE LOGIN CARD (only in Live Server mode when not connected) ── */}
      {mode === "live" &&
        (status === "connecting" || status === "qr_ready" || status === "logged_out") && (
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white dark:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-[#f0f2f5] dark:bg-[#111b21] border-b border-slate-200 dark:border-[#2a3942] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white text-lg">
                    💬
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      WhatsApp Web Protocol
                    </div>
                    <div className="text-xs text-slate-500 dark:text-[#8696a0]">
                      Powered by Baileys · Multi-device
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => switchMode("simulator")}
                  className="text-xs text-[#25D366] font-semibold hover:underline"
                >
                  Use Simulator
                </button>
              </div>

              <div className="px-6 py-8 flex flex-col items-center text-center">
                {(status === "connecting" || status === "logged_out") && (
                  <>
                    <div className="w-14 h-14 border-4 border-slate-200 dark:border-[#2a3942] border-t-[#25D366] rounded-full animate-spin mb-5" />
                    <div className="text-base font-semibold text-slate-800 dark:text-white mb-1">
                      {status === "logged_out"
                        ? "Session ended — reconnecting..."
                        : "Attempting server link..."}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#8696a0] max-w-xs mb-4">
                      Listening for Baileys daemon at <code>{liveServerUrl}</code>.
                    </p>
                    <button
                      onClick={() => switchMode("simulator")}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Bypass & Open Simulator Feed
                    </button>
                  </>
                )}

                {status === "qr_ready" && qrCode && (
                  <>
                    <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      Scan to Connect
                    </div>
                    <div className="text-sm text-slate-500 dark:text-[#8696a0] mb-6 leading-relaxed">
                      Open WhatsApp → Linked Devices → Link a Device
                      <br />
                      then point your camera at this code.
                    </div>
                    <div className="relative mb-5">
                      <div
                        className={`rounded-xl overflow-hidden transition-all ${
                          qrExpired ? "opacity-30 blur-xs" : ""
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={qrCode}
                          alt="WhatsApp QR Code"
                          width={240}
                          height={240}
                          className="block"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      {qrExpired && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-[#202c33]/80 rounded-xl gap-2">
                          <div className="text-3xl">🔄</div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-white">
                            QR Expired
                          </div>
                          <div className="text-xs text-slate-500 dark:text-[#8696a0]">
                            Waiting for new code...
                          </div>
                        </div>
                      )}
                    </div>
                    {!qrExpired && (
                      <div className="w-full mb-6">
                        <div className="flex justify-between text-xs text-slate-400 dark:text-[#8696a0] mb-1.5">
                          <span>Expires in</span>
                          <span
                            style={{ color: timerColor }}
                            className="font-semibold tabular-nums"
                          >
                            {timerSeconds}s
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-[#2a3942] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${timerPct}%`, background: timerColor }}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

      {/* ── CONVERSATION & SIMULATION VIEW ── */}
      {(mode === "simulator" || status === "connected") && (
        <div className="space-y-4">
          {/* Quick Scenario Buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-[#25D366]" />
                Simulate Customer Inquiries
              </div>
              <button
                onClick={() => runSimulation()}
                disabled={simulating}
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                {simulating ? "Simulating..." : "Random Inbound Message"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {DEMO_SCENARIOS.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => runSimulation(scenario)}
                  disabled={simulating}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span>{scenario.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar & Intent Filter Pills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3 transition-colors">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversation threads by phone, inquiry text, or keywords..."
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-10 text-xs focus:ring-2 focus:ring-[#25D366] dark:text-white dark:placeholder-slate-400 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Intent Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Intent:
              </span>
              {(
                [
                  { id: "All", label: "All" },
                  { id: "Emergency", label: "🚨 Emergency" },
                  { id: "Maintenance", label: "🔧 Maintenance" },
                  { id: "Quote", label: "💰 Quote" },
                  { id: "Lead", label: "📅 Lead" },
                ] as const
              ).map((filter) => {
                const count = intentCounts[filter.id];
                const isActive = intentFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setIntentFilter(filter.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      isActive
                        ? "bg-[#25D366] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white font-bold"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Conversation Feed */}
          <div className="bg-white dark:bg-[#202c33] border border-slate-200 dark:border-[#2a3942] rounded-2xl overflow-hidden shadow-sm transition-colors">
            {/* Feed header */}
            <div className="bg-[#f0f2f5] dark:bg-[#111b21] border-b border-slate-200 dark:border-[#2a3942] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                    Apex Cooling AI Dispatcher
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#8696a0]">
                    Zero-wait responses · Automated intent routing · Human takeover enabled
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs text-[#25D366] font-semibold bg-[#25D366]/10 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                  Active Feed ({filteredMessages.length})
                </span>
              </div>
            </div>

            {/* Messages container */}
            <div
              ref={feedRef}
              className="max-h-[460px] min-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-[#2a3942] p-2"
            >
              {filteredMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-[#8696a0] text-sm gap-2">
                  <MessageSquare className="w-8 h-8 opacity-30" />
                  <span>No messages match your search or filter.</span>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIntentFilter("All");
                    }}
                    className="text-xs text-[#25D366] font-semibold hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}

              {filteredMessages.map((msg) => {
                const isSelected = selectedTargetId === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedTargetId(msg.id)}
                    className={`p-4 space-y-3 cursor-pointer transition-colors rounded-xl ${
                      isSelected
                        ? "bg-slate-50/90 dark:bg-[#182229]/90 ring-1 ring-[#25D366]/30"
                        : "hover:bg-slate-50/50 dark:hover:bg-[#202c33]/50"
                    }`}
                  >
                    {/* Incoming customer message row */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                        {msg.sender.slice(-2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {msg.sender}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-[#8696a0]">
                            {msg.time}
                          </span>
                          {/* Intent badge with verified contrast */}
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${msg.intent.color}`}
                          >
                            {msg.intent.emoji} {msg.intent.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#25D366]/10 text-[#1da851] dark:text-[#25D366] font-bold px-2 py-0.5 rounded-full">
                              Target for Takeover
                            </span>
                          )}
                        </div>
                        <div className="inline-block bg-slate-100 dark:bg-[#111b21] border border-slate-200 dark:border-[#2a3942] rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-800 dark:text-white max-w-lg shadow-xs">
                          {msg.text}
                        </div>
                      </div>
                    </div>

                    {/* AI automated response row */}
                    <div className="flex items-start gap-3 pl-6 sm:pl-10">
                      <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 text-[#25D366]">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-bold text-[#1da851] dark:text-[#25D366] tracking-wide">
                            Apex AI Assistant
                          </span>
                          {msg.replying && (
                            <span className="flex gap-1 items-center text-xs text-slate-400 dark:text-[#8696a0]">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </span>
                          )}
                          {msg.replied && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        {msg.replied && (
                          <div className="inline-block bg-[#d9fdd3] dark:bg-[#005c4b] border border-[#c3f2bd] dark:border-[#026c59] rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-900 dark:text-white max-w-lg shadow-xs">
                            {msg.aiReply}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operator Manual Takeover Row (if sent) */}
                    {msg.operatorReply && (
                      <div className="flex items-start gap-3 pl-6 sm:pl-10 pt-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <UserCheck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              {msg.operatorName || "Human Dispatcher"}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {msg.operatorTime}
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                              Manual Takeover
                            </span>
                          </div>
                          <div className="inline-block bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-slate-900 dark:text-white max-w-lg shadow-xs leading-relaxed">
                            {msg.operatorReply}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Operator Manual Takeover Reply Dock */}
            <div className="p-4 bg-slate-50 dark:bg-[#182229] border-t border-slate-200 dark:border-[#2a3942] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Operator Manual Takeover:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-normal">
                    {selectedTargetMessage
                      ? `Replying to ${selectedTargetMessage.sender}`
                      : "Select a message above"}
                  </span>
                </div>

                {/* Preset Quick Takeover Replies */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() =>
                      handleOperatorSend(
                        undefined,
                        "Senior technician Dave K. has been dispatched and is 20 minutes away."
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Tech Dispatched (20m)
                  </button>
                  <button
                    onClick={() =>
                      handleOperatorSend(
                        undefined,
                        "I have reviewed your account and applied a $50 credit toward today's diagnostic."
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Apply $50 Credit
                  </button>
                  <button
                    onClick={() =>
                      handleOperatorSend(
                        undefined,
                        "Calling your phone directly from the Apex dispatch desk now."
                      )
                    }
                    className="text-[11px] px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Calling Customer Now
                  </button>
                </div>
              </div>

              {/* Operator Reply Input Form */}
              <form onSubmit={handleOperatorSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={operatorReplyText}
                  onChange={(e) => setOperatorReplyText(e.target.value)}
                  placeholder="Type a manual response as human operator to intervene in thread..."
                  className="flex-1 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!operatorReplyText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                  Send Takeover
                </button>
              </form>
            </div>

            {/* Customer Test Inquiry Bar */}
            <form
              onSubmit={handleCustomSend}
              className="p-3 bg-white dark:bg-[#111b21] border-t border-slate-200 dark:border-[#2a3942] flex items-center gap-2"
            >
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Simulate customer inquiry (e.g. 'Can someone inspect our rooftop unit?')..."
                className="flex-1 bg-slate-100 dark:bg-[#202c33] border border-transparent focus:border-[#25D366] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!customInput.trim() || simulating}
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe5d] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


