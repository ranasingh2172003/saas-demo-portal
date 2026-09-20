"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Globe, Mic, MessageSquare, QrCode, UserPlus, 
  Settings, PlaySquare, Link2, Sparkles 
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Website Builder", href: "/website", icon: Globe, highlight: true },
    { name: "Voice Agent", href: "/voice", icon: Mic },
    { name: "LinkedIn AI", href: "/linkedin", icon: Link2 },
    { name: "WhatsApp AI", href: "/whatsapp", icon: MessageSquare },
    { name: "QR Generator", href: "/qr", icon: QrCode },
    { name: "Recruitment", href: "/recruitment", icon: UserPlus },
    { name: "YouTube Scripts", href: "/youtube", icon: PlaySquare },
  ];

  return (
    <div className="flex h-screen bg-[#07070A] text-white overflow-hidden font-sans">
      <div className="w-[260px] flex flex-col border-r border-white/5 bg-[#0C0C12] shadow-2xl relative z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-teal-400 shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Sparkles className="w-4 h-4 text-white absolute" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white/95">Sano AI</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? (item.highlight ? "text-teal-400" : "text-violet-400") : "text-white/40"}`} />
                {item.name}
                {item.highlight && !isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-white/40 mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Systems Online
            </div>
          </div>
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-white/60 hover:text-white hover:bg-white/5">
            <Settings className="w-4 h-4 text-white/40" />
            Settings
          </button>
        </div>
      </div>
      <main className="flex-1 relative overflow-hidden bg-[#07070A]">
        {/* Subtle radial gradient background effect in the main content area */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/10 via-[#07070A] to-[#07070A] pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}
