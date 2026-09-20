"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, CheckCircle2, PlaySquare, Sparkles, RefreshCw } from "lucide-react";

type Script = { hook: string; intro: string; scenes: string[]; outro: string; cta: string };

export default function YoutubePage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("educational");
  const [duration, setDuration] = useState("5");
  const [result, setResult] = useState<Script | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, duration }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ hook: "Error generating script.", intro: "", scenes: [], outro: "", cta: "" });
    }
    setLoading(false);
  };

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyBtn = ({ text, k }: { text: string; k: string }) => (
    <Button variant="ghost" size="sm" onClick={() => copy(text, k)} className="h-7 text-xs gap-1.5 ml-auto" style={{ color: "var(--text-muted)" }}>
      {copied === k ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
    </Button>
  );

  const Section = ({ label, text, k }: { label: string; text: string; k: string }) => (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center px-4 py-2.5 border-b" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
        <Badge variant="secondary" className="text-xs">{label}</Badge>
        <CopyBtn text={text} k={k} />
      </div>
      <p className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>{text}</p>
    </div>
  );

  return (
    <div className="flex h-full" style={{ background: "var(--background)" }}>
      <div className="w-72 flex flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <PlaySquare className="h-4 w-4 text-red-400" />
            <h1 className="font-semibold text-sm">YouTube Script AI</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Generate engaging video scripts instantly</p>
        </div>
        <div className="flex-1 px-5 py-5 space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Video Topic</label>
            <textarea className="w-full text-sm px-3 py-2 rounded-lg border resize-none min-h-[80px]"
              value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. How to build a SaaS in 30 days"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} />
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>Tone</label>
            <div className="grid grid-cols-2 gap-2">
              {["educational", "entertaining", "motivational", "storytelling"].map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className="text-xs py-1.5 rounded-lg border capitalize"
                  style={{ background: tone === t ? "rgba(108,62,255,0.15)" : "var(--surface-2)", borderColor: tone === t ? "#6C3EFF" : "var(--border)", color: tone === t ? "#a78bfa" : "var(--text-muted)" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>Video Duration</label>
            <div className="flex gap-2">
              {["3", "5", "10", "15"].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className="flex-1 text-xs py-1.5 rounded-lg border"
                  style={{ background: duration === d ? "rgba(108,62,255,0.15)" : "var(--surface-2)", borderColor: duration === d ? "#6C3EFF" : "var(--border)", color: duration === d ? "#a78bfa" : "var(--text-muted)" }}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 pb-5">
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()} className="w-full" style={{ background: "var(--accent-gradient)" }}>
            {loading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> Writing...</> : <><Sparkles className="h-3.5 w-3.5 mr-2" /> Generate Script</>}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="space-y-4 max-w-2xl">
            {[1,2,3,4].map(i => <div key={i}><Skeleton className="h-5 w-32 mb-2" style={{ background: "var(--border)" }} /><Skeleton className="h-24 w-full" style={{ background: "var(--border)" }} /></div>)}
          </div>
        ) : result ? (
          <div className="space-y-4 max-w-2xl">
            <Section label="🎣 Hook (First 5 seconds)" text={result.hook} k="hook" />
            {result.intro && <Section label="📖 Intro" text={result.intro} k="intro" />}
            {result.scenes.map((scene, i) => <Section key={i} label={`🎬 Scene ${i + 1}`} text={scene} k={`scene-${i}`} />)}
            {result.outro && <Section label="🎤 Outro" text={result.outro} k="outro" />}
            {result.cta && <Section label="📣 Call to Action" text={result.cta} k="cta" />}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <PlaySquare className="h-16 w-16 mx-auto opacity-10" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Enter your video topic and click Generate Script</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
