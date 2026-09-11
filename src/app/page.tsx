"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  PhoneCall,
  MessageSquareText,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

type TimeRange = "24h" | "7d" | "30d";

interface ChartDataPoint {
  name: string;
  calls: number;
  messages: number;
}

const timeRangeData: Record<TimeRange, ChartDataPoint[]> = {
  "24h": [
    { name: "00:00", calls: 2, messages: 8 },
    { name: "04:00", calls: 1, messages: 5 },
    { name: "08:00", calls: 8, messages: 28 },
    { name: "12:00", calls: 15, messages: 54 },
    { name: "16:00", calls: 19, messages: 62 },
    { name: "20:00", calls: 11, messages: 36 },
    { name: "23:00", calls: 4, messages: 12 },
  ],
  "7d": [
    { name: "Mon", calls: 12, messages: 45 },
    { name: "Tue", calls: 19, messages: 32 },
    { name: "Wed", calls: 15, messages: 56 },
    { name: "Thu", calls: 22, messages: 48 },
    { name: "Fri", calls: 28, messages: 61 },
    { name: "Sat", calls: 35, messages: 80 },
    { name: "Sun", calls: 30, messages: 72 },
  ],
  "30d": [
    { name: "Week 1", calls: 88, messages: 280 },
    { name: "Week 2", calls: 114, messages: 345 },
    { name: "Week 3", calls: 140, messages: 410 },
    { name: "Week 4", calls: 161, messages: 465 },
  ],
};

const statsByRange: Record<
  TimeRange,
  Array<{
    name: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon: typeof MessageSquareText;
    href: string;
    detail: string;
  }>
> = {
  "24h": [
    {
      name: "Total AI Conversations",
      value: "205",
      change: "+8.4%",
      trend: "up",
      icon: MessageSquareText,
      href: "/chat",
      detail: "View WhatsApp feed",
    },
    {
      name: "Voice Calls Handled",
      value: "60",
      change: "+11.2%",
      trend: "up",
      icon: PhoneCall,
      href: "/voice",
      detail: "Inspect voice logs",
    },
    {
      name: "Appointments Booked",
      value: "9",
      change: "+4.1%",
      trend: "up",
      icon: TrendingUp,
      href: "/voice",
      detail: "View calendar bookings",
    },
    {
      name: "Active Candidates",
      value: "4",
      change: "+2.0%",
      trend: "up",
      icon: Users,
      href: "/recruitment",
      detail: "Review screening queue",
    },
  ],
  "7d": [
    {
      name: "Total AI Conversations",
      value: "1,204",
      change: "+12.5%",
      trend: "up",
      icon: MessageSquareText,
      href: "/chat",
      detail: "View WhatsApp feed",
    },
    {
      name: "Voice Calls Handled",
      value: "161",
      change: "+4.2%",
      trend: "up",
      icon: PhoneCall,
      href: "/voice",
      detail: "Inspect voice logs",
    },
    {
      name: "Appointments Booked",
      value: "42",
      change: "-1.5%",
      trend: "down",
      icon: TrendingUp,
      href: "/voice",
      detail: "View calendar bookings",
    },
    {
      name: "Active Candidates",
      value: "14",
      change: "+18.0%",
      trend: "up",
      icon: Users,
      href: "/recruitment",
      detail: "Review screening queue",
    },
  ],
  "30d": [
    {
      name: "Total AI Conversations",
      value: "4,870",
      change: "+24.8%",
      trend: "up",
      icon: MessageSquareText,
      href: "/chat",
      detail: "View WhatsApp feed",
    },
    {
      name: "Voice Calls Handled",
      value: "682",
      change: "+15.3%",
      trend: "up",
      icon: PhoneCall,
      href: "/voice",
      detail: "Inspect voice logs",
    },
    {
      name: "Appointments Booked",
      value: "184",
      change: "+9.6%",
      trend: "up",
      icon: TrendingUp,
      href: "/voice",
      detail: "View calendar bookings",
    },
    {
      name: "Active Candidates",
      value: "46",
      change: "+31.2%",
      trend: "up",
      icon: Users,
      href: "/recruitment",
      detail: "Review screening queue",
    },
  ],
};

const serviceHealth = [
  {
    name: "WhatsApp AI Dispatcher",
    channel: "Multi-device Engine",
    latency: "42ms",
    status: "Operational",
    uptime: "99.99%",
  },
  {
    name: "AI Voice Receptionist",
    channel: "TTS & Inbound Line",
    latency: "115ms",
    status: "Operational",
    uptime: "99.95%",
  },
  {
    name: "Website Architect",
    channel: "Gemini 1.5 Engine",
    latency: "190ms",
    status: "Operational",
    uptime: "99.90%",
  },
  {
    name: "Recruitment Screener",
    channel: "Candidate Parser",
    latency: "68ms",
    status: "Operational",
    uptime: "100%",
  },
  {
    name: "YouTube Influencer Bot",
    channel: "Content Pipeline",
    latency: "Idle",
    status: "Operational",
    uptime: "99.85%",
  },
  {
    name: "LinkedIn Lead Bot",
    channel: "B2B Outreach Queue",
    latency: "84ms",
    status: "Operational",
    uptime: "99.92%",
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-2 min-w-[170px]">
        <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Activity</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {entry.name}:
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const currentStats = statsByRange[timeRange];
  const currentChartData = timeRangeData[timeRange];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header with Title and Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, John
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Operational telemetry & automated frontline services for Apex Cooling.
          </p>
        </div>

        {/* Time-range filter pills */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60 shadow-xs self-start sm:self-auto">
          {(
            [
              { id: "24h", label: "Last 24 Hours" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeRange(filter.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeRange === filter.id
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Interactive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentStats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => router.push(stat.href)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                router.push(stat.href);
              }
            }}
            className="group cursor-pointer bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/50 dark:hover:border-blue-500/40 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <stat.icon className="w-5 h-5" />
              </div>
              <span
                className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                  stat.trend === "up"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {stat.change}
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 ml-0.5" />
                )}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {stat.name}
              </h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1.5 tracking-tight">
                {stat.value}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <span>{stat.detail}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Engagement AreaChart with Gradients */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Engagement Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI message volume vs inbound phone calls handled automatically
              </p>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-time sync active</span>
            </div>
          </div>

          <div className="h-80 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.38} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200/80 dark:text-slate-800/80"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: "12px" }}
                  formatter={(value) => (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1">
                      {value}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="messages"
                  name="AI Messages"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMessages)"
                  activeDot={{
                    r: 6,
                    stroke: "#2563eb",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="calls"
                  name="Voice Calls"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCalls)"
                  activeDot={{
                    r: 6,
                    stroke: "#0ea5e9",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent AI Activity Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Recent AI Activity
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Frontline actions logged across services
              </p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-4 flex-1">
            {[
              {
                title: "Voice Receptionist",
                desc: "Booked emergency AC repair for Sarah M. at 4:00 PM.",
                time: "10 mins ago",
                color: "bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400",
                href: "/voice",
              },
              {
                title: "WhatsApp Agent",
                desc: "Classified 'Price Inquiry' and sent HVAC PDF to +1 (555) 0192.",
                time: "48 mins ago",
                color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
                href: "/chat",
              },
              {
                title: "Recruitment AI",
                desc: "Completed WhatsApp interview with 'Michael T.' (Score: 85/100).",
                time: "2 hours ago",
                color: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
                href: "/recruitment",
              },
              {
                title: "YouTube Influencer",
                desc: "Rendered script and hook for 'Top 5 Summer AC Tips'.",
                time: "Yesterday",
                color: "bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400",
                href: "/youtube",
              },
            ].map((activity, i) => (
              <div
                key={i}
                onClick={() => router.push(activity.href)}
                className="group flex gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${activity.color}`}
                >
                  <div className="w-2 h-2 rounded-full bg-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {activity.title}
                    </p>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {activity.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Service Health Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Live Service Health & Agent Status
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                  All Systems Operational
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time heartbeat and automated agent response latencies
              </p>
            </div>
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>99.98% Global Uptime (30-day trailing)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {serviceHealth.map((srv) => (
            <div
              key={srv.name}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {srv.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 truncate">
                    {srv.channel}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 pl-2">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {srv.status}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {srv.latency}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

