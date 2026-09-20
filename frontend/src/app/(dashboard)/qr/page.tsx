"use client";
import { useState, useEffect } from "react";
import { QrCode, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QRPage() {
  const [form, setForm] = useState({ name: "Sano Cafe", phone: "+91 98765 43210", tagline: "Quality you can taste", color: "#6C3EFF" });
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState("");

  const generate = async () => {
    if (!form.name) return;
    setLoading(true);
    try {
      const res = await fetch("/api/qr", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form)
      });
      const data = await res.json();
      setHtml(data.html);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generate();
  }, []);

  return (
    <div className="flex h-full" style={{ background: "#0A0A0F", color: "white" }}>
      <div className="w-80 border-r flex flex-col p-6 space-y-6 overflow-auto" style={{ borderColor: "#242438", background: "#13131F" }}>
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2"><QrCode className="h-4 w-4" style={{ color: "#0FCCCE" }}/> QR Banner</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Business Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-black/20 border-[#242438]" /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="bg-black/20 border-[#242438]" /></div>
          <div className="space-y-2"><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})} className="bg-black/20 border-[#242438]" /></div>
          <div className="space-y-2"><Label>Color</Label><Input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} className="bg-black/20 border-[#242438] h-10 w-full" /></div>
        </div>
        <Button onClick={generate} disabled={loading || !form.name} className="w-full mt-4" style={{ background: "linear-gradient(135deg, #6C3EFF, #0FCCCE)" }}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
          Generate Banner
        </Button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 relative">
        {loading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10"><RefreshCw className="h-8 w-8 animate-spin text-purple-400" /></div>}
        {html ? (
          <div className="w-full max-w-lg aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border" style={{ borderColor: "#242438" }}>
            <iframe srcDoc={html} className="w-full h-full border-0 bg-white" />
          </div>
        ) : (
          <div className="text-gray-500 flex flex-col items-center gap-4"><QrCode className="h-12 w-12 opacity-20" /><p>Fill details to generate</p></div>
        )}
      </div>
    </div>
  );
}
