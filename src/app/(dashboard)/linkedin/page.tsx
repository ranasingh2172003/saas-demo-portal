"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Send,
  UserPlus,
  Calendar,
  BarChart3,
  Pause,
  Play,
  Plus,
  MessageSquare,
  Sparkles,
  Bot,
  TrendingUp,
} from "lucide-react";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface InboxMessage {
  id: string;
  sender: "lead" | "user" | "ai";
  senderName: string;
  text: string;
  time: string;
}

interface LeadConversation {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarColor: string;
  sentiment: "Positive Intent (98%)" | "Meeting Requested (95%)" | "Polite Objection" | "Qualified (92%)";
  sentimentType: "positive" | "neutral";
  time: string;
  status: "Qualified" | "Meeting Booked" | "In Nurture";
  messages: InboxMessage[];
  aiSuggestedReply: string;
}

interface CampaignData {
  id: string;
  name: string;
  isRunning: boolean;
  targetIndustry: string;
  targetTitles: string[];
  location: string;
  connectionTemplate: string;
  followUpTemplate: string;
}

const INITIAL_CAMPAIGNS: CampaignData[] = [
  {
    id: "camp-1",
    name: "Commercial Real Estate & High-Rise Operations",
    isRunning: true,
    targetIndustry: "Commercial Real Estate",
    targetTitles: ["Property Managers", "Facility Directors", "Real Estate Owners"],
    location: "Greater Metropolitan Area (50 miles)",
    connectionTemplate:
      "Hi {firstName}, noticed you manage commercial facilities across {company}. We provide certified 24/7 commercial HVAC maintenance and rapid 2-hour response. Would love to connect!",
    followUpTemplate:
      "Checking in {firstName}! If you ever need emergency AC service or seasonal preventive maintenance, we offer free facility evaluations.",
  },
  {
    id: "camp-2",
    name: "Data Centers & Mission-Critical Cooling",
    isRunning: false,
    targetIndustry: "Data Centers & Telecommunications",
    targetTitles: ["VP of Infrastructure", "Data Center Manager", "Critical Systems Director"],
    location: "Tri-State Technology Corridor",
    connectionTemplate:
      "Hi {firstName}, saw your expansion at {company}. We specialize in 99.999% precision CRAC and chilled water loop redundancy for high-density server halls.",
    followUpTemplate:
      "Hi {firstName}, happy to share our 2026 redundancy case study on preventing thermal throttle in tier-3 data facilities.",
  },
];

const INITIAL_CONVERSATIONS: LeadConversation[] = [
  {
    id: "lead-1",
    name: "Robert Chen",
    role: "Director of Facilities",
    company: "Metro Commercial Properties",
    avatarColor: "bg-blue-600",
    sentiment: "Positive Intent (98%)",
    sentimentType: "positive",
    time: "2h ago",
    status: "Qualified",
    aiSuggestedReply:
      "Absolutely Robert! I understand how critical 100% uptime is for a 45-story commercial high-rise. I can have our Commercial Engineering Lead reach out directly. Does Tuesday at 10 AM or Wednesday at 2 PM work for a brief 15-minute introductory call?",
    messages: [
      {
        id: "m1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Robert, noticed you manage commercial buildings for Metro Commercial Properties in downtown. We handle commercial HVAC maintenance and 2-hour emergency chiller response. Would love to connect!",
        time: "Yesterday, 9:30 AM",
      },
      {
        id: "m2",
        sender: "lead",
        senderName: "Robert Chen",
        text: "Actually, we are actively looking for a new commercial HVAC vendor for our downtown 45-story high-rise. Our current vendor took 6 hours to respond during the last heatwave. Can we schedule a call?",
        time: "2h ago",
      },
      {
        id: "m3",
        sender: "ai",
        senderName: "Apex AI Assistant",
        text: "Auto-replied: 'Absolutely Robert! We guarantee 2-hour on-site SLA for commercial accounts. I'll have our commercial VP coordinate. Does Tuesday at 10 AM work for a quick introductory discussion?'",
        time: "1h ago",
      },
    ],
  },
  {
    id: "lead-2",
    name: "Marcus Vance",
    role: "VP Operations",
    company: "Apex Data Infrastructure",
    avatarColor: "bg-indigo-600",
    sentiment: "Meeting Requested (95%)",
    sentimentType: "positive",
    time: "4h ago",
    status: "Meeting Booked",
    aiSuggestedReply:
      "Hi Marcus, sending over our Tier-3 redundant CRAC spec sheets and our chiller loop maintenance checklist now. Looking forward to our call this Thursday!",
    messages: [
      {
        id: "mv1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Marcus, saw your expansion of the Tier-3 data center facility in the north district. Precision cooling and redundant CRAC units are vital. Open to connecting?",
        time: "2 days ago",
      },
      {
        id: "mv2",
        sender: "lead",
        senderName: "Marcus Vance",
        text: "Thanks for reaching out. We are adding 200 high-density server racks next quarter and reviewing cooling redundancy SLAs. Send over your precision CRAC maintenance specs.",
        time: "4h ago",
      },
    ],
  },
  {
    id: "lead-3",
    name: "Amanda Smith",
    role: "Senior Property Manager",
    company: "Beacon Residential Group",
    avatarColor: "bg-emerald-600",
    sentiment: "Polite Objection",
    sentimentType: "neutral",
    time: "6h ago",
    status: "In Nurture",
    aiSuggestedReply:
      "Understood Amanda! We often partner with in-house crews solely as an overflow safety net for after-hours emergency calls. I will keep in touch next quarter.",
    messages: [
      {
        id: "as1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Amanda, hope your week is off to a great start! We assist residential property managers across the metro area with rapid heat pump and AC repairs.",
        time: "1 day ago",
      },
      {
        id: "as2",
        sender: "lead",
        senderName: "Amanda Smith",
        text: "We currently have an in-house engineering team handling regular maintenance, so we wouldn't need a full vendor contract right now. Appreciate you reaching out though!",
        time: "6h ago",
      },
    ],
  },
  {
    id: "lead-4",
    name: "Jennifer Hayes",
    role: "Director of Operations",
    company: "Grandview Luxury Hotels",
    avatarColor: "bg-purple-600",
    sentiment: "Qualified (92%)",
    sentimentType: "positive",
    time: "1 day ago",
    status: "Qualified",
    aiSuggestedReply:
      "Hi Jennifer! Hotel guest comfort is our top priority. We provide 24/7 dedicated chiller tech dispatch with zero guest disruption. Let's set up a site evaluation.",
    messages: [
      {
        id: "jh1",
        sender: "user",
        senderName: "Apex Cooling B2B Outreach",
        text: "Hi Jennifer, hospitality guest comfort is everything during peak season. We provide priority 24/7 chiller contracts for luxury hotels.",
        time: "3 days ago",
      },
      {
        id: "jh2",
        sender: "lead",
        senderName: "Jennifer Hayes",
        text: "Our chiller failed during our busiest conference weekend last year. What is your guaranteed emergency response time for hospitality properties?",
        time: "1 day ago",
      },
    ],
  },
];

export default function LinkedInAutomation() {
  const { success, info } = useToast();

  // Campaign State
  const [campaigns, setCampaigns] = useState<CampaignData[]>(INITIAL_CAMPAIGNS);
  const [activeCampaignIndex, setActiveCampaignIndex] = useState<number>(0);
  const activeCampaign = campaigns[activeCampaignIndex];

  // Inbox & Conversation State
  const [conversations, setConversations] = useState<LeadConversation[]>(INITIAL_CONVERSATIONS);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("lead-1");
  const [replyText, setReplyText] = useState<string>("");

  // Modals
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState<boolean>(false);
  const [newCampaignName, setNewCampaignName] = useState<string>("");
  const [newCampaignIndustry, setNewCampaignIndustry] = useState<string>("Healthcare & Hospitals");
  const [newCampaignTitles, setNewCampaignTitles] = useState<string>("Chief Engineer, Facilities Director");
  const [newCampaignLocation, setNewCampaignLocation] = useState<string>("Tri-State Region (100 miles)");
  const [newCampaignTemplate, setNewCampaignTemplate] = useState<string>(
    "Hi {firstName}, noticed you oversee critical operations at {company}. We offer emergency HVAC & surgical suite air filtration maintenance..."
  );

  const selectedLead =
    conversations.find((l) => l.id === selectedLeadId) || conversations[0];

  // Handler: Pause / Resume Campaign Toggle
  const handleToggleCampaignStatus = () => {
    const nextStatus = !activeCampaign.isRunning;
    setCampaigns((prev) =>
      prev.map((c, i) =>
        i === activeCampaignIndex ? { ...c, isRunning: nextStatus } : c
      )
    );

    if (nextStatus) {
      success(
        "Campaign Resumed",
        `Active outreach resumed for "${activeCampaign.name}". Auto-follow ups running.`
      );
    } else {
      info(
        "Campaign Paused",
        `Outreach paused for "${activeCampaign.name}". Scheduled invitations queued.`
      );
    }
  };

  // Handler: Send Reply to Lead
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: InboxMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      senderName: "You (Apex Cooling)",
      text: replyText.trim(),
      time: "Just now",
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedLead.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              time: "Just now",
            }
          : c
      )
    );

    setReplyText("");
    success(
      "Message Sent!",
      `Follow-up delivered to ${selectedLead.name} (${selectedLead.company}).`
    );
  };

  // Handler: Use AI suggested reply
  const handleUseAiSuggestion = () => {
    setReplyText(selectedLead.aiSuggestedReply);
    info("AI Suggestion Loaded", "Review and click Send when ready.");
  };

  // Handler: Create New Campaign
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const created: CampaignData = {
      id: `camp-${Date.now()}`,
      name: newCampaignName.trim(),
      isRunning: true,
      targetIndustry: newCampaignIndustry,
      targetTitles: newCampaignTitles.split(",").map((s) => s.trim()),
      location: newCampaignLocation,
      connectionTemplate: newCampaignTemplate,
      followUpTemplate: "Checking in {firstName}! Hope your systems are running smoothly...",
    };

    setCampaigns((prev) => [created, ...prev]);
    setActiveCampaignIndex(0);
    setIsNewCampaignModalOpen(false);
    setNewCampaignName("");
    success(
      "New Campaign Launched!",
      `"${created.name}" is now running with automated sequence targeting ${created.targetIndustry}.`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-[#0a66c2]" />
            LinkedIn Automation
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Auto-connects, nurtures, and books commercial HVAC contracts with facility directors & property managers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewCampaignModalOpen(true)}
            className="px-4 py-2.5 bg-[#0a66c2] hover:bg-[#084d93] text-white rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#0a66c2] mb-1">
            <UserPlus className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              New Connections
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">142</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12% this week
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#0a66c2] mb-1">
            <Send className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outreach Sent
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">890</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Multi-step sequence active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#0a66c2] mb-1">
            <MessageSquare className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Qualified Leads
            </h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">38</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for sales discovery</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-colors">
          <div className="flex items-center gap-2 text-[#0a66c2] mb-1">
            <Calendar className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meetings Booked
            </h3>
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">14</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">High-value commercial bids</p>
        </div>
      </div>

      {/* Conversion Funnel Visualizer */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0a66c2]" />
              B2B Conversion Funnel Visualizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live progression from initial connection request to signed commercial maintenance contracts
            </p>
          </div>
          <span className="text-xs font-bold text-[#0a66c2] bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
            Overall Funnel Efficiency: 4.6%
          </span>
        </div>

        {/* Funnel Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            {
              stage: "1. Outreach Sent",
              count: 890,
              rate: "100%",
              sub: "Personalized invites",
              color: "bg-blue-500",
              textColor: "text-blue-600 dark:text-blue-400",
            },
            {
              stage: "2. Accepted",
              count: 412,
              rate: "46.3%",
              sub: "Connection rate (+15% vs avg)",
              color: "bg-indigo-500",
              textColor: "text-indigo-600 dark:text-indigo-400",
            },
            {
              stage: "3. Replied",
              count: 142,
              rate: "34.5%",
              sub: "Inbound interest",
              color: "bg-purple-500",
              textColor: "text-purple-600 dark:text-purple-400",
            },
            {
              stage: "4. Qualified",
              count: 38,
              rate: "26.8%",
              sub: "Active HVAC opportunities",
              color: "bg-emerald-500",
              textColor: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {step.stage}
                </span>
                <span className={`text-xs font-extrabold ${step.textColor}`}>{step.rate}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{step.count}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{step.sub}</p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${step.color}`} style={{ width: step.rate }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main 2-Column Layout: Campaign Controls (1 col) + Split-Screen AI Inbox (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Active Campaign Settings & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors">
            
            {/* Header with Pause/Resume Toggle */}
            <div className="border-b border-slate-100 dark:border-slate-800 p-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <span className="text-[10px] font-bold text-[#0a66c2] uppercase tracking-wider">
                  Campaign Control
                </span>
                <h2 className="font-bold text-base text-slate-900 dark:text-white truncate max-w-[220px]">
                  {activeCampaign.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Pill */}
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border ${
                    activeCampaign.isRunning
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeCampaign.isRunning ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  {activeCampaign.isRunning ? "Running" : "Paused"}
                </span>

                {/* Pause/Resume Toggle Button */}
                <button
                  onClick={handleToggleCampaignStatus}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                    activeCampaign.isRunning
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 hover:bg-amber-100"
                      : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 hover:bg-emerald-100"
                  }`}
                  title={activeCampaign.isRunning ? "Pause Outreach" : "Resume Outreach"}
                >
                  {activeCampaign.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Campaign Select tabs if multiple exist */}
            {campaigns.length > 1 && (
              <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-1.5 gap-1">
                {campaigns.map((c, idx) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveCampaignIndex(idx)}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold truncate transition-colors cursor-pointer ${
                      activeCampaignIndex === idx
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {c.targetIndustry}
                  </button>
                ))}
              </div>
            )}

            {/* Campaign Body Details */}
            <div className="p-5 space-y-5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Target Audience
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeCampaign.targetTitles.map((title, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Location Radius
                </label>
                <p className="font-semibold text-slate-900 dark:text-white">{activeCampaign.location}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-[#0a66c2]" /> AI Message Sequence
                </label>
                <div className="space-y-2.5">
                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="font-bold text-[#0a66c2] text-[11px] mb-1">
                      Step 1: Connection Request (Day 0)
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      &quot;{activeCampaign.connectionTemplate}&quot;
                    </p>
                  </div>

                  <div className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/40">
                    <p className="font-bold text-slate-500 dark:text-slate-400 text-[11px] mb-1">
                      Step 2: Auto Follow-up (Day 3 if no reply)
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                      &quot;{activeCampaign.followUpTemplate}&quot;
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Interactive AI Inbox with Split Screen Thread View (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[580px] transition-colors">
          
          <div className="border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0a66c2]" />
              Interactive AI Lead Inbox
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {conversations.length} Active Conversations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 flex-1">
            
            {/* Conversation List Sidebar (5 cols) */}
            <div className="sm:col-span-5 border-r border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[520px] overflow-y-auto">
              {conversations.map((lead) => {
                const isSelected = lead.id === selectedLead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-l-[#0a66c2]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {lead.name}
                      </div>
                      <span className="text-[10px] text-slate-400">{lead.time}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lead.role}
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-tight">
                      {lead.messages[lead.messages.length - 1]?.text}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          lead.sentimentType === "positive"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200"
                        }`}
                      >
                        {lead.sentiment}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Lead Thread & Reply Composer (7 cols) */}
            <div className="sm:col-span-7 flex flex-col justify-between p-4 max-h-[520px] overflow-y-auto">
              
              {/* Thread Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {selectedLead.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedLead.role} • {selectedLead.company}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                    {selectedLead.status}
                  </span>
                </div>
              </div>

              {/* Message History Bubble Feed */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {selectedLead.messages.map((m) => {
                  const isLead = m.sender === "lead";
                  const isAi = m.sender === "ai";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isLead ? "items-start" : "items-end"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        {isAi ? (
                          <span className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400">
                            <Bot className="w-3 h-3" /> Apex AI Auto-Reply
                          </span>
                        ) : isLead ? (
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {m.senderName}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            You
                          </span>
                        )}
                        <span>• {m.time}</span>
                      </div>

                      <div
                        className={`max-w-[90%] p-2.5 rounded-xl text-xs leading-relaxed ${
                          isLead
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                            : isAi
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-500/20"
                            : "bg-[#0a66c2] text-white rounded-tr-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Suggestion Box */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-blue-50/80 dark:bg-blue-500/10 p-2.5 rounded-xl border border-blue-100 dark:border-blue-500/20 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-900 dark:text-blue-300 uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600" /> AI Suggested Reply
                    </span>
                    <button
                      onClick={handleUseAiSuggestion}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Use Suggestion
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-900/80 dark:text-blue-200/80 italic line-clamp-2">
                    &quot;{selectedLead.aiSuggestedReply}&quot;
                  </p>
                </div>

                {/* Reply Composer Form */}
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${selectedLead.name}...`}
                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[#0a66c2] hover:bg-[#084d93] text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* MODAL: New B2B Outreach Campaign */}
      <Modal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
        size="lg"
        title="Launch New B2B Outreach Campaign"
        description="Configure target prospect criteria and automated LinkedIn sequence rules."
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 py-2 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Campaign Name *
            </label>
            <input
              type="text"
              required
              value={newCampaignName}
              onChange={(e) => setNewCampaignName(e.target.value)}
              placeholder="e.g. Healthcare Facilities & Hospital Chillers"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Industry
              </label>
              <select
                value={newCampaignIndustry}
                onChange={(e) => setNewCampaignIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              >
                <option value="Commercial Real Estate">Commercial Real Estate</option>
                <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                <option value="Data Centers & Tech">Data Centers & Tech</option>
                <option value="Hotels & Hospitality">Hotels & Hospitality</option>
                <option value="Universities & Education">Universities & Education</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Geographic Radius
              </label>
              <input
                type="text"
                value={newCampaignLocation}
                onChange={(e) => setNewCampaignLocation(e.target.value)}
                placeholder="e.g. Tri-State Region (100 miles)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Job Titles (Comma-separated)
            </label>
            <input
              type="text"
              value={newCampaignTitles}
              onChange={(e) => setNewCampaignTitles(e.target.value)}
              placeholder="e.g. Facilities Director, VP Operations, Building Manager"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Connection Message Template
              </label>
              <span className="text-[10px] text-slate-400">Available: {"{firstName}"}, {"{company}"}</span>
            </div>
            <textarea
              rows={3}
              value={newCampaignTemplate}
              onChange={(e) => setNewCampaignTemplate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
            />
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl text-blue-900 dark:text-blue-300">
            <strong>Automated Cadence:</strong> Invitations are staggered to keep account limits safe (25 invites/day), with automatic smart follow-ups once connection requests are accepted.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewCampaignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0a66c2] hover:bg-[#084d93] text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              Launch Campaign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
