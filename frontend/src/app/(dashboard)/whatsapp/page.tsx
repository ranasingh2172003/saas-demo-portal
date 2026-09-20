"use client";
import { useState } from "react";
import { MessageSquare, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const conversations = [
  { id: 1, from: "Rahul Sharma", role: "Customer", time: "10:24 AM", message: "Hi, I wanted to know about your pricing plans?" },
  { id: 2, from: "Priya Mehta", role: "Lead", time: "11:05 AM", message: "Can you send me the product brochure?" },
];

export default function WhatsAppPage() {
  const [selected, setSelected] = useState(conversations[0]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const generateReply = async () => {
    setLoading(true);
    setDraft("");
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: selected.message, from_: selected.from }),
      });
      const data = await res.json();
      setDraft(data.reply);
    } catch (e) {
      console.error(e);
      setDraft("Error generating reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full" style={{ background: "#0A0A0F", color: "white" }}>
      <div className="w-72 border-r flex flex-col" style={{ borderColor: "#242438", background: "#13131F" }}>
        <div className="p-4 border-b" style={{ borderColor: "#242438" }}>
          <h2 className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="h-4 w-4" style={{ color: "#0FCCCE" }}/> WhatsApp AI</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {conversations.map(c => (
            <div key={c.id} onClick={() => { setSelected(c); setDraft(""); }} className="p-4 border-b cursor-pointer transition-colors" style={selected.id === c.id ? { background: "rgba(108,62,255,0.1)", borderColor: "#242438" } : { borderColor: "#242438" }}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium" style={selected.id === c.id ? { color: "#C4B5FD" } : { color: "white" }}>{c.from}</span>
                <span className="text-[10px]" style={{ color: "#8B8BA3" }}>{c.time}</span>
              </div>
              <p className="text-xs truncate" style={{ color: "#8B8BA3" }}>{c.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b flex items-center gap-4" style={{ borderColor: "#242438" }}>
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-medium" style={{ background: "#242438" }}>{selected.from[0]}</div>
          <div>
            <h3 className="font-medium">{selected.from}</h3>
            <p className="text-xs" style={{ color: "#8B8BA3" }}>{selected.role}</p>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex mb-6">
            <div className="p-4 rounded-2xl max-w-md text-sm" style={{ background: "#1F2937", border: "1px solid #374151" }}>
              <p className="mb-2 text-xs font-medium" style={{ color: "#9CA3AF" }}>{selected.from}</p>
              {selected.message}
            </div>
          </div>
          {(loading || draft) && (
            <div className="flex justify-end mb-6">
              <div className="p-4 rounded-2xl max-w-md text-sm" style={{ background: "rgba(108,62,255,0.15)", border: "1px solid rgba(108,62,255,0.3)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium" style={{ color: "#C4B5FD" }}>Sano AI Draft</span>
                </div>
                {loading ? <div className="text-xs animate-pulse text-purple-300">Generating reply... (~30s)</div> : draft}
                {!loading && draft && (
                  <Button size="sm" variant="ghost" className="h-7 mt-3 gap-1.5 w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200" onClick={() => { navigator.clipboard.writeText(draft); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy to WhatsApp"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t" style={{ borderColor: "#242438", background: "#13131F" }}>
          <Button onClick={generateReply} disabled={loading} className="w-full gap-2" style={{ background: "linear-gradient(135deg, #6C3EFF, #0FCCCE)" }}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin text-white" /> : <MessageSquare className="h-4 w-4 text-white" />}
            Generate AI Reply
          </Button>
        </div>
      </div>
    </div>
  );
}
