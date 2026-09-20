"use client";
import { useState } from "react";
import { Link2, RefreshCw, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LinkedInPage() {
  const [form, setForm] = useState({ industry: "SaaS", title: "Founder", location: "Mumbai", tone: "professional" });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch("/api/state?section=linkedin")
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setConnectionReq(data.data.connection || "");
          setFollowUp(data.data.followup || "");
        }
      })
      .catch(console.error);
  }, []);

  const [result, setResult] = useState<{connection: string, followup: string} | null>(null);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/linkedin", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      setResult(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full" style={{ background: "#0A0A0F", color: "white" }}>
      <div className="w-80 border-r p-6 space-y-6 overflow-auto" style={{ borderColor: "#242438", background: "#13131F" }}>
        <h2 className="text-sm font-semibold flex items-center gap-2"><Link2 className="h-4 w-4 text-blue-400"/> LinkedIn AI</h2>
        <div className="space-y-4">
          <Input value={form.industry} onChange={e=>setForm({...form, industry: e.target.value})} placeholder="Industry" className="bg-black/20 border-[#242438]" />
          <Input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Job Title" className="bg-black/20 border-[#242438]" />
          <Input value={form.location} onChange={e=>setForm({...form, location: e.target.value})} placeholder="Location" className="bg-black/20 border-[#242438]" />
        </div>
        <Button onClick={generate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
          Generate Messages
        </Button>
      </div>
      <div className="flex-1 p-8 flex flex-col items-center justify-center relative">
        {loading && <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10 gap-4"><RefreshCw className="h-8 w-8 animate-spin text-blue-400" /><p className="text-blue-300 animate-pulse text-sm">AI is thinking... (~30-60s)</p></div>}
        {result ? (
          <div className="w-full max-w-2xl space-y-6">
            <div className="p-6 rounded-xl border bg-[#13131F] border-[#242438]">
              <h3 className="text-blue-400 font-medium text-sm mb-3">Connection Request (Max 300 chars)</h3>
              <p className="text-gray-300 text-sm mb-4">{result.connection}</p>
              <Button size="sm" variant="outline" className="border-[#242438] bg-black/50 text-xs" onClick={()=>navigator.clipboard.writeText(result.connection)}><Copy className="w-3 h-3 mr-2"/>Copy</Button>
            </div>
            <div className="p-6 rounded-xl border bg-[#13131F] border-[#242438]">
              <h3 className="text-blue-400 font-medium text-sm mb-3">Follow-up Message</h3>
              <p className="text-gray-300 text-sm mb-4">{result.followup}</p>
              <Button size="sm" variant="outline" className="border-[#242438] bg-black/50 text-xs" onClick={()=>navigator.clipboard.writeText(result.followup)}><Copy className="w-3 h-3 mr-2"/>Copy</Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 flex flex-col items-center gap-4"><Link2 className="h-12 w-12 opacity-20" /><p>Fill details to generate</p></div>
        )}
      </div>
    </div>
  );
}
