"use client";

import { useState } from "react";
import {
  Globe,
  RefreshCw,
  Send,
  Sparkles,
  LayoutTemplate,
  MessageSquare,
  Monitor,
  Smartphone,
  CheckCircle2,
  Code,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Check,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import Modal from "@/components/Modal";
import { useToast } from "@/components/Toast";

interface TemplateItem {
  id: number;
  name: string;
  style: string;
  image: string;
  prompt: string;
  features: string[];
}

const templates: TemplateItem[] = [
  {
    id: 1,
    name: "SaaS Dark Pro",
    style: "Premium, Dark Mode, Purple Accents",
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600",
    prompt:
      "Build a premium SaaS landing page in dark mode. Use DaisyUI 'luxury' or 'dark' theme. Include a sticky glassmorphism navbar, a massive hero section with a glowing purple gradient button, a 3-column features grid with FontAwesome icons, a social proof/trusted-by logo strip, a testimonials section using cards, and a dark footer.",
    features: [
      "Glassmorphism sticky navbar",
      "Glowing purple gradient CTA",
      "3-column feature grid with modern icons",
      "Enterprise social proof logo strip",
      "Dark-mode testimonials cards & footer",
    ],
  },
  {
    id: 2,
    name: "Modern Local Business",
    style: "Clean, Blue, Trustworthy",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600",
    prompt:
      "Build a modern local business website (e.g. for plumbing or HVAC). Use DaisyUI 'corporate' or 'light' theme. It MUST look incredibly trustworthy and professional. Include a top bar with phone number, a navbar with 'Request Quote' button, a hero section with a background image of a professional at work with a semi-transparent dark overlay, a 'Our Services' grid with icons, a 'Why Choose Us' section, and a footer.",
    features: [
      "Top announcement bar with click-to-call phone number",
      "Quote request hero with instant conversion CTA",
      "Comprehensive services cards with pricing indicators",
      "Trust badges and licensed technician credentials",
      "Google reviews integration preview",
    ],
  },
  {
    id: 3,
    name: "Creative Agency",
    style: "Vibrant, Pastel, Bold Typography",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600",
    prompt:
      "Build a creative design agency portfolio landing page. Use DaisyUI 'cupcake' or 'pastel' theme. Use huge, bold typography. Include a creative navbar, an offset hero section with abstract shapes or vibrant colors, a masonry grid for portfolio items, a scrolling marquee of clients, and an oversized footer with a bold 'Let's Talk' CTA.",
    features: [
      "Editorial headline typography with fluid scale",
      "Offset hero with vibrant abstract color palette",
      "Masonry grid for case studies and visual work",
      "Infinite scrolling partner marquee",
      "High-contrast footer consultation form",
    ],
  },
  {
    id: 4,
    name: "AI Startup",
    style: "Futuristic, Neon, Minimal",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600",
    prompt:
      "Build a futuristic AI startup landing page. Use a dark theme with neon cyan and magenta accents. The hero section should be minimal with a massive gradient headline, a 'Start Building' button, and a command-line style code snippet graphic. Include a features section with glowing borders on cards, a pricing table, and a footer.",
    features: [
      "Neon cyan & magenta linear gradients",
      "Interactive code snippet terminal preview",
      "Bento grid with glowing border effects",
      "Tiered pricing matrix with monthly/annual toggle",
      "API documentation link strip",
    ],
  },
];

const defaultStarterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex Cooling - Commercial & Residential HVAC</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 antialiased font-sans">
  <nav class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white">❄</div>
      <span class="font-bold text-xl text-white tracking-tight">Apex Cooling & HVAC</span>
    </div>
    <div class="flex items-center gap-4 text-sm font-medium">
      <a href="#services" class="text-slate-300 hover:text-white transition-colors">Services</a>
      <a href="#about" class="text-slate-300 hover:text-white transition-colors">Emergency</a>
      <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
        Call Dispatch: (555) 0192
      </button>
    </div>
  </nav>

  <header class="py-20 px-6 text-center max-w-4xl mx-auto">
    <span class="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-3 py-1 rounded-full font-semibold">
      <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
      24/7 Rapid Emergency Response Active
    </span>
    <h1 class="text-4xl sm:text-6xl font-extrabold mt-6 tracking-tight text-white">
      Precision Climate Solutions for Facilities & Modern Homes
    </h1>
    <p class="text-slate-400 mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
      Sub-60-minute emergency dispatch, certified master technicians, and energy-efficient HVAC installations engineered to last.
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <button class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20">
        Book Immediate Technician
      </button>
      <button class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-6 py-3 rounded-xl font-bold transition-colors">
        Explore Commercial Rates
      </button>
    </div>
  </header>

  <section id="services" class="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
      <div class="text-blue-400 text-2xl mb-3">⚡</div>
      <h3 class="text-lg font-bold text-white mb-2">Emergency AC Repair</h3>
      <p class="text-slate-400 text-sm leading-relaxed">Full system diagnostics, refrigerant leak detection, and compressor repairs within 1 hour.</p>
    </div>
    <div class="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
      <div class="text-blue-400 text-2xl mb-3">🏢</div>
      <h3 class="text-lg font-bold text-white mb-2">Commercial Chillers & VRF</h3>
      <p class="text-slate-400 text-sm leading-relaxed">Preventative maintenance, rooftop multi-unit retrofits, and smart building thermostat integration.</p>
    </div>
    <div class="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl">
      <div class="text-blue-400 text-2xl mb-3">🍃</div>
      <h3 class="text-lg font-bold text-white mb-2">Air Quality & Purification</h3>
      <p class="text-slate-400 text-sm leading-relaxed">HEPA filtration, UV-C germicidal air scrubbers, and hospital-grade duct sanitation services.</p>
    </div>
  </section>

  <footer class="border-t border-slate-800 text-center py-8 text-xs text-slate-500">
    © 2026 Apex Cooling & Mechanical Services Inc. Powered by Apex AI Architect.
  </footer>
</body>
</html>`;

export default function WebsiteGenerator() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<"chat" | "templates">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hi! I'm your AI Website Architect. To get started, you can pick a template from the Theme Library tab, or just tell me about your business. What services do you offer?",
    },
  ]);

  const liveDeploymentUrl = "https://apex-cooling-hvac.saas.app";
  const activeHtmlToDisplay = generatedHtml || defaultStarterHtml;

  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const userPrompt = customPrompt || chatInput;
    if (!userPrompt.trim() || isGenerating) return;

    setActiveTab("chat");
    setMessages((prev) => [...prev, { role: "user", text: userPrompt }]);
    setChatInput("");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate website");
      }

      setGeneratedHtml(data.html);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I've generated a new layout based on your request. Check the Live Preview canvas! You can toggle between Desktop and Mobile preview or click 'Publish to Web'.",
        },
      ]);
      toast.success("Website architecture generated successfully!");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Sorry, I encountered an error: ${errorMessage}` },
      ]);
      toast.error("Generation failed", errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyLiveUrl = () => {
    navigator.clipboard.writeText(liveDeploymentUrl);
    setCopiedLink(true);
    toast.success("Link copied to clipboard!", liveDeploymentUrl);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyHtmlSource = () => {
    navigator.clipboard.writeText(activeHtmlToDisplay);
    setCopiedCode(true);
    toast.success("HTML source code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const downloadHtmlFile = () => {
    const blob = new Blob([activeHtmlToDisplay], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded index.html successfully!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Globe className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            AI Website Architect
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Generate, inspect, and deploy high-converting landing pages through natural conversation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setGeneratedHtml(null);
              setMessages([
                {
                  role: "ai",
                  text: "Canvas reset. What kind of website should we architect next?",
                },
              ]);
              toast.info("Canvas reset to clean state");
            }}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Canvas
          </button>

          <button
            onClick={() => setIsCodeModalOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Code className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            View Code
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all hover:shadow-md"
          >
            <Globe className="w-3.5 h-3.5" />
            Publish to Web
          </button>
        </div>
      </div>

      {/* Main Builder Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Panel: Chat & Templates */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-colors min-h-[460px]">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 transition-colors shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "chat"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/20 dark:bg-blue-950/20"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Builder Chat
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-3.5 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                activeTab === "templates"
                  ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/20 dark:bg-blue-950/20"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <LayoutTemplate className="w-4 h-4" /> Theme Library
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-50/50 dark:bg-slate-950/50 transition-colors">
            {/* Chat Tab */}
            {activeTab === "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none text-sm"
                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none text-sm"
                        }`}
                      >
                        {msg.role === "ai" && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              AI Architect
                            </span>
                          </div>
                        )}
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none p-4 shadow-xs flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-blue-500 animate-spin" />
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Gemini is architecting HTML & Tailwind layout...
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors shrink-0">
                  <form onSubmit={handleSendMessage} className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isGenerating}
                      placeholder={
                        isGenerating
                          ? "Gemini is building..."
                          : "E.g. 'Build a high-trust HVAC emergency landing page'..."
                      }
                      className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-4 pr-12 text-xs focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-slate-400 transition-colors disabled:opacity-50"
                    />
                    <button
                      disabled={isGenerating || !chatInput.trim()}
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors"
                      aria-label="Send prompt"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </>
            )}

            {/* Templates Tab */}
            {activeTab === "templates" && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-xs hover:shadow-md"
                  >
                    <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tpl.image}
                        alt={tpl.name}
                        className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="font-bold text-sm leading-tight">{tpl.name}</h3>
                        <p className="text-[11px] opacity-80 mt-0.5">{tpl.style}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-800 flex justify-between items-center transition-colors">
                      <button
                        onClick={() => handleSendMessage(undefined, tpl.prompt)}
                        className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                      >
                        1-Click Apply
                      </button>
                      <button
                        onClick={() => setPreviewingTemplate(tpl)}
                        className="text-blue-600 dark:text-blue-400 font-semibold text-xs hover:underline flex items-center gap-1"
                      >
                        <Layers className="w-3 h-3" /> Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Live Canvas Preview */}
        <div className="lg:col-span-8 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-inner transition-colors min-h-[460px]">
          {/* Mock Browser Header */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between transition-colors shrink-0">
            <div className="flex gap-1.5 items-center">
              <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80" />
              <span className="hidden sm:inline-block ml-3 text-xs text-slate-400 font-mono">
                {deviceView === "desktop" ? "100% Desktop Viewport" : "375px Mobile Frame"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Live Preview
              </div>
            </div>

            {/* Device Switcher (Desktop 100% vs Mobile 375px) */}
            <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setDeviceView("desktop")}
                title="Desktop View (100% width)"
                className={`p-1.5 rounded-md transition-all ${
                  deviceView === "desktop"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView("mobile")}
                title="Mobile View (375px centered frame)"
                className={`p-1.5 rounded-md transition-all ${
                  deviceView === "mobile"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mock Website Canvas Container */}
          <div className="flex-1 relative bg-slate-200/50 dark:bg-slate-900/60 transition-colors overflow-auto flex items-center justify-center p-2 sm:p-4">
            {isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-blue-100 dark:bg-blue-500/20 rounded-full animate-ping opacity-75" />
                  <div className="relative w-full h-full bg-white dark:bg-slate-800 rounded-full border-4 border-blue-500 flex items-center justify-center shadow-xl z-10 transition-colors">
                    <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Gemini is architecting...
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs max-w-sm">
                  Generating custom semantic HTML, CSS styles, and responsive layout elements.
                </p>
              </div>
            ) : generatedHtml ? (
              deviceView === "desktop" ? (
                <div className="w-full h-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                  <iframe
                    srcDoc={generatedHtml}
                    title="Generated Website Desktop Preview"
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              ) : (
                /* Mobile Phone Frame Mockup */
                <div className="w-[375px] max-w-full h-[667px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 flex flex-col relative transition-all duration-300">
                  {/* Dynamic Island / Speaker Pill */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-900 rounded-full z-20 flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
                    <div className="w-8 h-1 rounded-full bg-slate-800" />
                  </div>
                  {/* Screen Frame */}
                  <div className="w-full h-full rounded-[34px] overflow-hidden bg-white pt-5">
                    <iframe
                      srcDoc={generatedHtml}
                      title="Generated Website Mobile Preview"
                      className="w-full h-full border-none bg-white"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              )
            ) : (
              /* Starter / Empty Canvas State */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Globe className="w-9 h-9 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Canvas is Ready
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-xs leading-relaxed">
                  Select a pre-built layout from the Theme Library or prompt the AI Architect to generate a custom site. You can also view starter HTML code.
                </p>
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => handleSendMessage(undefined, templates[0].prompt)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
                  >
                    Load SaaS Dark Pro
                  </button>
                  <button
                    onClick={() => handleSendMessage(undefined, templates[1].prompt)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Load HVAC Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MODAL 1: PUBLISH TO WEB MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <span>Publish Website to Production</span>
          </div>
        }
        description="Deploy your AI-generated website to the global edge network with instant SSL and custom domain routing."
        size="xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Edge CDN Active
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <a
                href={liveDeploymentUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => toast.info("Opening simulated production URL...")}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                Visit Site <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Live URL Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Production Live URL
              </div>
              <div className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                {liveDeploymentUrl}
              </div>
            </div>
            <button
              onClick={copyLiveUrl}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Link
                </>
              )}
            </button>
          </div>

          {/* QR Code Preview and Deployment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* QR Code Card */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center justify-center text-center">
              <div className="w-36 h-36 bg-white p-2 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center mb-3">
                {/* Clean SVG QR Code */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-32 h-32 text-slate-900"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" />
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" />
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" />
                  <rect x="14" y="14" width="3" height="3" fill="currentColor" />
                  <rect x="18" y="14" width="3" height="3" fill="currentColor" />
                  <rect x="14" y="18" width="3" height="3" fill="currentColor" />
                  <rect x="18" y="18" width="3" height="3" fill="currentColor" />
                </svg>
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-blue-500" /> Scan to preview on mobile
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant mobile preview QR</p>
            </div>

            {/* Edge Deployment Checklist */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deployment Pipeline
              </h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">SSL Certificate</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active (TLS 1.3)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Global Edge Regions</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    32 Regions (US, EU, APAC)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Cache Invalidation</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Purged 12s ago
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">SEO Meta Tags</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> OpenGraph Configured
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL 2: TEMPLATE PREVIEW MODAL ──────────────────────────────────────── */}
      {previewingTemplate && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewingTemplate(null)}
          title={`Template: ${previewingTemplate.name}`}
          description={previewingTemplate.style}
          size="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back to Library
              </button>
              <button
                onClick={() => {
                  const prompt = previewingTemplate.prompt;
                  setPreviewingTemplate(null);
                  handleSendMessage(undefined, prompt);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                1-Click Apply This Template
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="h-56 w-full rounded-xl overflow-hidden relative shadow-sm border border-slate-200 dark:border-slate-700">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewingTemplate.image}
                alt={previewingTemplate.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-600/80 px-2.5 py-0.5 rounded-md">
                  Theme Preset
                </span>
                <h3 className="text-xl font-bold mt-1">{previewingTemplate.name}</h3>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Included Components & Styling
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {previewingTemplate.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Architect Prompt Directive
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-mono leading-relaxed line-clamp-3">
                {previewingTemplate.prompt}
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── MODAL 3: VIEW CODE MODAL ────────────────────────────────────────────── */}
      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span>Generated HTML & Tailwind Source</span>
          </div>
        }
        description="Inspect clean semantic HTML5 markup. Copy directly to your clipboard or download index.html for deployment."
        size="3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-400">
              {activeHtmlToDisplay.length.toLocaleString()} characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={copyHtmlSource}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Code
                  </>
                )}
              </button>
              <button
                onClick={downloadHtmlFile}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download index.html
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">index.html (HTML5 + Tailwind CSS)</span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                UTF-8
              </span>
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[50vh] leading-relaxed select-all">
              <code>{activeHtmlToDisplay}</code>
            </pre>
          </div>
        </div>
      </Modal>
    </div>
  );
}

