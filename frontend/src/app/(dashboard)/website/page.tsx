"use client";
import { useState, useRef } from "react";
import { Send, Monitor, Smartphone, RefreshCw, Zap, Code2, Sparkles, LayoutTemplate } from "lucide-react";

export default function WebsiteBuilder() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch("/api/state?section=website")
      .then(res => res.json())
      .then(data => {
        if (data && data.data && data.data.prompt) {
          setPrompt(data.data.prompt);
        }
      })
      .catch(console.error);
  }, []);

  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [hasGenerated, setHasGenerated] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setHasGenerated(true);
    if (iframeRef.current) {
      iframeRef.current.style.display = 'block';
      iframeRef.current.srcdoc = `<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#0A0A0F;color:#8B8BA3;font-family:sans-serif;">Initialize build engine...</div><div style="font-size:12px;color:#6C3EFF;margin-top:12px;">Warming up Local CPU Models. Please wait 20-60 seconds for generation. Do not refresh.</div>`;
    }

    try {
      const res = await fetch("/api/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.body) throw new Error("No body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      if (iframeRef.current) iframeRef.current.srcdoc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (iframeRef.current) iframeRef.current.srcdoc += chunk;
      }
    } catch (e) {
      console.error(e);
      if (iframeRef.current) iframeRef.current.srcdoc = "Error generating website.";
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      generate();
    }
  };

  const templates = [
    { name: "SaaS Landing", icon: LayoutTemplate },
    { name: "Auth Portal", icon: Zap },
    { name: "Data Dashboard", icon: Monitor },
  ];

  return (
    <div className="flex h-full w-full relative z-10 text-white animate-in">
      {/* Left Sidebar - Prompt Interface */}
      <div className="w-[340px] flex flex-col border-r border-white/5 bg-[#0C0C12]/80 backdrop-blur-xl z-20 shadow-xl">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              AI Builder
            </h2>
            <p className="text-xs text-white/40 mt-1">Generate raw HTML & Tailwind</p>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1 gap-6 overflow-y-auto">
          {/* Quick Start Templates */}
          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">Templates</label>
            <div className="flex flex-col gap-2">
              {templates.map(t => (
                <button 
                  key={t.name} 
                  onClick={() => setPrompt(`A modern ${t.name} using Tailwind CSS with dark mode.`)} 
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/10 transition-all"
                >
                  <t.icon className="w-4 h-4 text-white/30 group-hover:text-violet-400 transition-colors" />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="mt-auto pt-6 border-t border-white/5">
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 block">Instructions</label>
            <div className="relative rounded-xl border border-white/10 bg-[#07070A] shadow-inner prompt-glow transition-all">
              <textarea
                className="w-full h-40 bg-transparent p-4 text-sm text-white/90 focus:outline-none resize-none placeholder:text-white/20"
                placeholder="Describe the website you want to build... (Cmd+Enter)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-white/30 font-medium bg-white/5 px-2 py-1 rounded">⌘ ↵</span>
                <button
                  className="h-8 w-8 rounded-lg flex items-center justify-center ai-button disabled:opacity-50 disabled:grayscale"
                  onClick={generate}
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin text-white" /> : <Send className="h-4 w-4 text-white ml-0.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Canvas Area */}
      <div className="flex-1 flex flex-col relative bg-[#07070A]">
        {/* Top Navbar */}
        <div className="h-14 px-6 flex items-center justify-between border-b border-white/5 bg-[#0C0C12]/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setDevice("desktop")} 
              className={`p-1.5 rounded-md transition-all ${device === "desktop" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDevice("mobile")} 
              className={`p-1.5 rounded-md transition-all ${device === "mobile" ? "bg-white/10 text-white shadow-sm" : "text-white/40 hover:text-white/80"}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          
          {loading && (
            <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300">
              <Zap className="h-3 w-3 fill-current animate-pulse" />
              Generating code...
            </div>
          )}
        </div>

        {/* Canvas Workspace */}
        <div className="flex-1 p-6 flex items-center justify-center overflow-auto relative">
          {/* Subtle Grid Pattern Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {!hasGenerated && (
            <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                <Code2 className="w-8 h-8 text-white/20" />
              </div>
              <h3 className="text-xl font-medium text-white/90 mb-2">Zero to Code</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Describe your interface on the left and the AI will stream a fully functional Tailwind template in real-time.
              </p>
            </div>
          )}

          <div
            className={`bg-white rounded-xl overflow-hidden shadow-2xl transition-all duration-500 ease-out relative z-10 ${hasGenerated ? "opacity-100 ring-1 ring-white/10" : "opacity-0 scale-95 hidden"}`}
            style={{ 
              width: device === "desktop" ? "100%" : "375px", 
              height: "100%",
              maxWidth: device === "desktop" ? "1200px" : "375px"
            }}
          >
            <iframe ref={iframeRef} className="w-full h-full border-0 bg-white" sandbox="allow-scripts" />
          </div>
        </div>
      </div>
    </div>
  );
}
