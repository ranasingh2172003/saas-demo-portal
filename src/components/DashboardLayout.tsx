"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Globe,
  Mic,
  MessageSquare,
  Users,
  MonitorPlay,
  Briefcase,
  QrCode,
  Menu,
  X,
  Building2,
  Sun,
  Moon,
  Search,
  ChevronRight,
  Settings
} from "lucide-react";
import { ToastProvider } from "./Toast";
import NotificationsDropdown from "./NotificationsDropdown";
import CommandPalette from "./CommandPalette";
import SettingsModal from "./SettingsModal";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    color: string;
  };
}

const navigation: NavItem[] = [
  {
    name: "Master Dashboard",
    href: "/sbo/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Instant Website",
    href: "/website",
    icon: Globe,
    badge: { text: "AI Ready", color: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  },
  {
    name: "Voice Receptionist",
    href: "/voice",
    icon: Mic,
    badge: { text: "Active", color: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  },
  {
    name: "WhatsApp Agents",
    href: "/chat",
    icon: MessageSquare,
    badge: { text: "● Live", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  },
  {
    name: "Recruitment Engine",
    href: "/recruitment",
    icon: Users,
    badge: { text: "3 Active", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  },
  {
    name: "YouTube Influencer",
    href: "/youtube",
    icon: MonitorPlay,
    badge: { text: "New", color: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  },
  {
    name: "LinkedIn Automation",
    href: "/linkedin",
    icon: Briefcase,
    badge: { text: "Running", color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800" },
  },
  {
    name: "Smart QR Banners",
    href: "/qr",
    icon: QrCode,
    badge: { text: "v2", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
  },
];

const emptySubscribe = () => () => {};

export function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Global keyboard shortcut for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Find active view name for breadcrumb
  const currentView = navigation.find((item) => item.href === pathname)?.name || "Dashboard";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Mobile Animated Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
            >
              <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span>Apex Cooling</span>
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badge.color}`}
                        >
                          {item.badge.text}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Profile Trigger */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div
                  onClick={() => {
                    setSidebarOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      JD
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        John Doe
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Business Owner
                      </p>
                    </div>
                  </div>
                  <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 lg:bg-white dark:lg:bg-slate-900 lg:pt-4 lg:pb-3 transition-colors duration-300 z-20">
        {/* Brand header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white leading-none block">
                Apex Cooling
              </span>
              <span className="text-[11px] text-slate-400 font-medium leading-none block mt-1">
                Autonomous SaaS Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="mt-4 flex-1 h-0 overflow-y-auto px-3 space-y-1">
          <div className="px-3 pb-2 pt-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Operational Modules
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badge.color}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom User Card */}
        <div className="px-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => setSettingsOpen(true)}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
            title="Open Business Settings"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                JD
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  John Doe
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  Business Owner
                </p>
              </div>
            </div>
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:rotate-45 transition-all" />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 transition-colors duration-300">
          {/* Left: Mobile Toggle & Dynamic Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="flex items-center text-sm font-medium" aria-label="Breadcrumb">
              <Link
                href="/"
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <span className="hidden sm:inline font-semibold">Apex Cooling</span>
              </Link>
              <ChevronRight className="hidden sm:block w-4 h-4 mx-1.5 text-slate-400" />
              <span className="text-slate-900 dark:text-white font-bold truncate max-w-[100px] sm:max-w-none">
                {currentView}
              </span>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200/70 dark:border-slate-700/60"
              aria-label="Open command palette"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline font-medium">Search services or actions...</span>
               
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Notification Bell Dropdown */}
            <NotificationsDropdown />

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {mounted ? (
                isDark ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )
              ) : (
                <div className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Main Viewport Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* User Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutInner>{children}</DashboardLayoutInner>
  );
}
