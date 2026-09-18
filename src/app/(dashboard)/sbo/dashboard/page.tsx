"use client";
import { useState } from "react";
import { Bot, Mic, MessageSquare, TrendingUp, Clock, DollarSign, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const AGENTS = [
  { id: 1, name: "Salon Booking Bot", type: "WhatsApp", status: "Running", active: true, messages: 84 },
  { id: 2, name: "Customer FAQ Bot", type: "WhatsApp", status: "Running", active: true, messages: 43 },
  { id: 3, name: "Appointment Reminder", type: "Voice", status: "Paused", active: false, messages: 0 },
];

const RECENT_CONVOS = [
  { c: "Sarah Connor", m: "Do you have time tomorrow at 3?", a: "Salon Booking", t: "10:23 AM", s: "Replied" },
  { c: "Mike Smith", m: "How much is a haircut?", a: "Customer FAQ", t: "09:45 AM", s: "Replied" },
  { c: "Jenny Lee", m: "Confirming my 5pm appointment.", a: "Appt Reminder", t: "Yesterday", s: "Logged" },
  { c: "David B.", m: "Location?", a: "Customer FAQ", t: "Yesterday", s: "Replied" },
  { c: "Emma W.", m: "Cancel my booking.", a: "Salon Booking", t: "Yesterday", s: "Action Taken" },
];

const KPI_STATUS: Record<string, string> = {
  "Replied": "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  "Logged": "bg-slate-700/50 text-slate-400 border border-slate-700",
  "Action Taken": "bg-green-500/10 text-green-400 border border-green-500/20",
};

export default function SBODashboard() {
  const [agents, setAgents] = useState(AGENTS);

  const toggleAgent = (id: number) => {
    setAgents(agents.map((a) =>
      a.id === id ? { ...a, active: !a.active, status: !a.active ? "Running" : "Paused" } : a
    ));
  };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Summary</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Your AI agents are running. Real-time overview of all activity.
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Active Agents", value: "3", sub: "all systems go", icon: Activity, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
          { label: "Messages Today", value: "127", sub: "+18% vs yesterday", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Voice Mins Used", value: "38/100", sub: "62 mins remaining", icon: Mic, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Cost This Month", value: "$2.48", sub: "↓ from $3.10 last mo.", icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={item}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {kpi.sub}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Agents Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">My AI Agents</h2>
          <Link
            href="/developer/agents"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              variants={item}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{agent.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{agent.type} Agent</p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => toggleAgent(agent.id)}
                  className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors focus:outline-none ${agent.active ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"}`}
                  aria-label={`Toggle ${agent.name}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${agent.active ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between text-xs mt-auto">
                <span className={`px-2 py-0.5 rounded-full font-medium ${agent.active ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                  {agent.status}
                </span>
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last active 2m ago
                </span>
              </div>
              {agent.active && (
                <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{agent.messages}</span> messages handled today
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/sbo" className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-shadow">
          <div>
            <p className="text-xs font-semibold opacity-80 mb-1">AI VOICE BUILDER</p>
            <p className="text-base font-bold">Build a New Agent</p>
            <p className="text-xs opacity-70 mt-0.5">Talk to our AI architect to create a custom module</p>
          </div>
          <Mic className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform shrink-0" />
        </Link>
        <Link href="/chat" className="group bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-5 text-white flex items-center justify-between shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow">
          <div>
            <p className="text-xs font-semibold opacity-80 mb-1">WHATSAPP AGENTS</p>
            <p className="text-base font-bold">View Live Conversations</p>
            <p className="text-xs opacity-70 mt-0.5">Monitor and respond to customer messages in real-time</p>
          </div>
          <MessageSquare className="w-10 h-10 opacity-80 group-hover:scale-110 transition-transform shrink-0" />
        </Link>
      </div>

      {/* Recent Conversations Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Conversations</h2>
          <Link href="/chat" className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {RECENT_CONVOS.map((row, i) => (
              <div key={i} className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{row.c}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${KPI_STATUS[row.s] || "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{row.s}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.m}</p>
                <p className="text-[10px] text-slate-400">{row.a} · {row.t}</p>
              </div>
            ))}
          </div>
          {/* Desktop: table */}
          <table className="hidden sm:table w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Message</th>
                <th className="p-4 font-semibold">Agent</th>
                <th className="p-4 font-semibold">Time</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {RECENT_CONVOS.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-medium text-slate-900 dark:text-white">{row.c}</td>
                  <td className="p-4 text-slate-400 truncate max-w-[200px]">{row.m}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{row.a}</td>
                  <td className="p-4 text-slate-400 text-xs">{row.t}</td>
                  <td className="p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${KPI_STATUS[row.s] || "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>{row.s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
