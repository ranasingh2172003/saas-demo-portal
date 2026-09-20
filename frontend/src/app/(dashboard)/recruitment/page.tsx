"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Copy, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";

export default function RecruitmentPage() {
  const [tab, setTab] = useState<"jd" | "screen">("jd");
  const [role, setRole] = useState(""); const [skills, setSkills] = useState(""); const [exp, setExp] = useState("2-4 years");
  const [resume, setResume] = useState(""); const [jdContext, setJdContext] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJD = async () => {
    setLoading(true); setResult("");
    try {
      const res = await fetch("/api/recruitment/jd", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skills, experience: exp }),
      });
      const data = await res.json();
      setResult(data.jd);
    } catch { setResult("Error generating JD."); }
    setLoading(false);
  };

  const handleScreen = async () => {
    setLoading(true); setResult("");
    try {
      const res = await fetch("/api/recruitment/screen", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd: jdContext }),
      });
      const data = await res.json();
      setResult(data.analysis);
    } catch { setResult("Error screening resume."); }
    setLoading(false);
  };

  const copy = async () => { await navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="flex h-full" style={{ background: "var(--background)" }}>
      <div className="w-80 flex flex-col border-r" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h1 className="font-semibold text-sm">Recruitment AI</h1>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Write JDs & screen resumes with AI</p>
        </div>
        <div className="flex px-5 pt-4 gap-2">
          {(["jd", "screen"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setResult(""); }}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: tab === t ? "rgba(108,62,255,0.15)" : "var(--surface-2)", color: tab === t ? "#a78bfa" : "var(--text-muted)", border: `1px solid ${tab === t ? "#6C3EFF" : "var(--border)"}` }}>
              {t === "jd" ? "Write JD" : "Screen Resume"}
            </button>
          ))}
        </div>
        <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
          {tab === "jd" ? (
            <>
              <div><label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Job Title / Role</label>
                <input className="w-full text-sm px-3 py-2 rounded-lg border" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Senior React Developer"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Key Skills</label>
                <textarea className="w-full text-sm px-3 py-2 rounded-lg border resize-none min-h-[80px]" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js, REST APIs"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></div>
              <div><label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>Experience Required</label>
                <div className="flex gap-2 flex-wrap">
                  {["0-1 years", "1-2 years", "2-4 years", "4-7 years", "7+ years"].map(e => (
                    <button key={e} onClick={() => setExp(e)} className="text-xs px-2.5 py-1 rounded-full border"
                      style={{ background: exp === e ? "rgba(108,62,255,0.15)" : "var(--surface-2)", borderColor: exp === e ? "#6C3EFF" : "var(--border)", color: exp === e ? "#a78bfa" : "var(--text-muted)" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div><label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Paste Resume Text</label>
                <textarea className="w-full text-sm px-3 py-2 rounded-lg border resize-none min-h-[100px]" value={resume} onChange={e => setResume(e.target.value)} placeholder="Paste the candidate's resume here..."
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></div>
              <div><label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-muted)" }}>Job Description (optional)</label>
                <textarea className="w-full text-sm px-3 py-2 rounded-lg border resize-none min-h-[80px]" value={jdContext} onChange={e => setJdContext(e.target.value)} placeholder="Paste job description to compare against..."
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }} /></div>
            </>
          )}
        </div>
        <div className="px-5 pb-5">
          <Button onClick={tab === "jd" ? handleJD : handleScreen} disabled={loading || (tab === "jd" ? !role : !resume)} className="w-full" style={{ background: "var(--accent-gradient)" }}>
            {loading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin mr-2" /> Processing...</> : <><Sparkles className="h-3.5 w-3.5 mr-2" />{tab === "jd" ? "Generate JD" : "Screen Resume"}</>}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? <Skeleton className="h-64 w-full max-w-2xl rounded-xl" style={{ background: "var(--border)" }} />
          : result ? (
            <div className="max-w-2xl">
              <div className="flex justify-end mb-3">
                <Button variant="ghost" size="sm" onClick={copy} className="text-xs gap-1.5 h-7" style={{ color: "var(--text-muted)" }}>
                  {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </Button>
              </div>
              <div className="rounded-xl p-5 text-sm leading-relaxed whitespace-pre-wrap" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                {result}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-3"><Users className="h-16 w-16 mx-auto opacity-10" />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{tab === "jd" ? "Fill in the role details to generate a JD" : "Paste a resume and click Screen"}</p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
