"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  Globe,
  Mic,
  MessageSquare,
  Users,
  MonitorPlay,
  Briefcase,
  QrCode,
  Settings,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Command,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "./Toast";

interface CommandItem {
  id: string;
  category: "Services" | "Actions";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  href?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenSettings,
}: CommandPaletteProps) {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme || theme) === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  const { success } = useToast();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  };

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: "nav-dashboard",
        category: "Services",
        title: "Master Dashboard",
        subtitle: "High-level operational overview & KPI telemetry",
        icon: LayoutDashboard,
        href: "/",
      },
      {
        id: "nav-website",
        category: "Services",
        title: "Instant Website Architect",
        subtitle: "Gemini-powered website generator & preview canvas",
        icon: Globe,
        badge: "AI Ready",
        href: "/website",
      },
      {
        id: "nav-voice",
        category: "Services",
        title: "Voice Receptionist",
        subtitle: "Simulated AI phone reception & speech synthesis",
        icon: Mic,
        badge: "Active",
        href: "/voice",
      },
      {
        id: "nav-chat",
        category: "Services",
        title: "WhatsApp Agents",
        subtitle: "WhatsApp messaging automation & lead classification",
        icon: MessageSquare,
        badge: "● Live",
        href: "/chat",
      },
      {
        id: "nav-recruitment",
        category: "Services",
        title: "Recruitment Engine",
        subtitle: "Candidate screening, scoring & transcripts",
        icon: Users,
        badge: "3 Active",
        href: "/recruitment",
      },
      {
        id: "nav-youtube",
        category: "Services",
        title: "YouTube Influencer",
        subtitle: "Video script generation & content pipeline",
        icon: MonitorPlay,
        badge: "New",
        href: "/youtube",
      },
      {
        id: "nav-linkedin",
        category: "Services",
        title: "LinkedIn Automation",
        subtitle: "B2B outreach campaign manager & smart inbox",
        icon: Briefcase,
        badge: "Running",
        href: "/linkedin",
      },
      {
        id: "nav-qr",
        category: "Services",
        title: "Smart QR Banners",
        subtitle: "Physical marketing collateral generator & analytics",
        icon: QrCode,
        href: "/qr",
      },
      {
        id: "action-settings",
        category: "Actions",
        title: "Business Profile & Settings",
        subtitle: "Configure business details, Gemini AI models, and subscription tier",
        icon: Settings,
        action: () => {
          handleClose();
          onOpenSettings?.();
        },
      },
      {
        id: "action-theme",
        category: "Actions",
        title: `Switch Theme to ${isDark ? "Light" : "Dark"} Mode`,
        subtitle: "Toggle dashboard appearance",
        icon: isDark ? Sun : Moon,
        action: () => {
          const next = isDark ? "light" : "dark";
          toggleTheme();
          success("Theme Updated", `Switched to ${next} mode`);
          handleClose();
        },
      },
    ];
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, resolvedTheme, isDark, toggleTheme, setTheme, success, onOpenSettings]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query, items]);

  const handleSelect = (item: CommandItem) => {
    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
      handleClose();
    }
  };

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search services..."
                className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedIndex(0);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">
                <span>ESC to close</span>
              </div>
            </div>

            {/* List Results */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for &ldquo;Dashboard&rdquo;, &ldquo;WhatsApp&rdquo;, &ldquo;Website&rdquo;, or &ldquo;Settings&rdquo;
                  </p>
                </div>
              ) : (
                filteredItems.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-100"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {item.title}
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? "translate-x-0.5 text-blue-600 dark:text-blue-400" : "opacity-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer helper */}
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">↑↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono shadow-xs">↵</kbd>
                  to select
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <Command className="w-3.5 h-3.5 text-blue-500" />
                <span>Apex Command</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
