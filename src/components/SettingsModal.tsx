"use client";

import React, { useState } from "react";
import Modal from "./Modal";
import {
  Building2,
  Cpu,
  CreditCard,
  CheckCircle2,
  Save,
  Zap,
  ShieldCheck,
  Download,
  Phone,
  Clock,
  Mail,
  Sparkles
} from "lucide-react";
import { useToast } from "./Toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "business" | "ai" | "plan";

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("business");

  // Business Profile State
  const [businessName, setBusinessName] = useState("Apex Cooling Solutions");
  const [industry, setIndustry] = useState("HVAC & Commercial Refrigeration");
  const [operatingHours, setOperatingHours] = useState("24/7 Emergency Dispatch");
  const [dispatchPhone, setDispatchPhone] = useState("+1 (555) 924-APEX");
  const [supportEmail, setSupportEmail] = useState("dispatch@apexcooling.com");
  const [description, setDescription] = useState(
    "Premier commercial and residential HVAC repair, preventative maintenance, and rapid chiller dispatch across Greater Texas."
  );

  // AI Configuration State
  const [activeModel, setActiveModel] = useState("gemini-3.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [promptOverride, setPromptOverride] = useState(
    "You are the Apex Cooling enterprise dispatch AI. Always prioritize emergency refrigeration leaks, medical/cold storage failures, and high-temperature complaints. Respond concisely with authoritative technical guidance."
  );

  // Subscription State
  const [isUpgraded, setIsUpgraded] = useState(false);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Business Profile Saved", "Business details updated successfully.");
    onClose();
  };

  const handleSaveAI = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("AI Configuration Saved", `Active model set to ${activeModel} with temp ${temperature}.`);
    onClose();
  };

  const handleUpgrade = () => {
    setIsUpgraded(true);
    toast.success("Plan Upgraded", "Upgraded to Apex Unlimited Enterprise tier ($499/mo).");
  };

  const handleDownloadInvoice = () => {
    toast.info("Invoice Generated", "Downloading statement for September 2026.");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      title="Settings & System Configuration"
      description="Manage business metadata, Gemini AI runtime parameters, and subscription quotas."
    >
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 -mx-6 px-6 mb-6 gap-2 sm:gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("business")}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "business"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Business Profile
        </button>

        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "ai"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <Cpu className="w-4 h-4" />
          AI Configuration
        </button>

        <button
          onClick={() => setActiveTab("plan")}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "plan"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Plan & Subscription
        </button>
      </div>

      {/* Tab 1: Business Profile */}
      {activeTab === "business" && (
        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Business Legal Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Primary Industry
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Operating Hours
                </span>
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Emergency Dispatch Phone
                </span>
              </label>
              <input
                type="text"
                value={dispatchPhone}
                onChange={(e) => setDispatchPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Support & Inquiries Email
              </span>
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Business Scope & Dispatch Overview
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: AI Configuration */}
      {activeTab === "ai" && (
        <form onSubmit={handleSaveAI} className="space-y-5">
          {/* Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">API Key Status</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Connected & Verified
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Generative Runtime</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Google Gemini SDK
                </p>
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Active Foundation Model
            </label>
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (Recommended: Low Latency & High Reasoning)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (High Speed Multimodal)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep Complex Analysis)</option>
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Temperature: {temperature}
                </label>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  {temperature <= 0.3 ? "Deterministic" : temperature <= 0.7 ? "Balanced" : "Creative"}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Lower values provide precise factual replies; higher values add conversational nuance.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Max Output Tokens: {maxTokens}
                </label>
              </div>
              <input
                type="range"
                min="512"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Maximum token limit generated per service interaction.
              </p>
            </div>
          </div>

          {/* System Prompt Override */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Enterprise Dispatch Persona & System Prompt Override
            </label>
            <textarea
              rows={4}
              value={promptOverride}
              onChange={(e) => setPromptOverride(e.target.value)}
              className="w-full px-3.5 py-2.5 font-mono text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors leading-relaxed"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              Save AI Configuration
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Plan & Subscription */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {/* Current Tier Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-medium backdrop-blur-md mb-2">
                  Active Subscription
                </span>
                <h4 className="text-xl font-bold flex items-center gap-2">
                  {isUpgraded ? "Apex Unlimited Enterprise" : "Apex Enterprise Pro"}
                  <ShieldCheck className="w-5 h-5 text-emerald-300" />
                </h4>
                <p className="text-xs text-blue-100 mt-1">
                  Renews on October 1, 2026 via Visa •••• 4242 ($ {isUpgraded ? "499" : "299"}/mo)
                </p>
              </div>

              {!isUpgraded && (
                <button
                  onClick={handleUpgrade}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold shadow-md hover:bg-blue-50 transition-colors self-start sm:self-auto"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Upgrade to Unlimited
                </button>
              )}
            </div>
          </div>

          {/* Quota Usage Meter */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>AI Conversational Quota</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">
                  8,420 / 10,000 queries ({isUpgraded ? "Unlimited" : "84% used"})
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isUpgraded
                      ? "bg-emerald-500 w-1/4"
                      : "bg-gradient-to-r from-blue-500 to-amber-500 w-[84%]"
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Telephony Voice Minutes</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono">
                  420 / 500 mins (84% used)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 w-[84%]" />
              </div>
            </div>
          </div>

          {/* Billing statements */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Monthly Billing Statements
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tax invoice & PDF receipts for corporate expense reconciliation
              </p>
            </div>
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Statement
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
