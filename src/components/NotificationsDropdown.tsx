"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Users,
  Globe,
  QrCode,
  Check,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useToast } from "./Toast";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: "emergency" | "recruitment" | "website" | "qr" | "info";
  href?: string;
}

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-1",
    title: "Emergency AC inquiry received",
    message: "Customer in Dallas requested urgent rooftop compressor diagnosis.",
    timestamp: "2m ago",
    unread: true,
    type: "emergency",
    href: "/chat",
  },
  {
    id: "notif-2",
    title: "New candidate applied",
    message: "Michael Torres applied for Senior HVAC Technician position.",
    timestamp: "14m ago",
    unread: true,
    type: "recruitment",
    href: "/recruitment",
  },
  {
    id: "notif-3",
    title: "Website published",
    message: "Apex Cooling Summer Campaign 2026 landing page is live.",
    timestamp: "1h ago",
    unread: true,
    type: "website",
    href: "/website",
  },
  {
    id: "notif-4",
    title: "Smart QR Collateral Scanned",
    message: "Fleet Van #4 sticker was scanned 14 times today.",
    timestamp: "3h ago",
    unread: false,
    type: "qr",
    href: "/qr",
  },
];

export default function NotificationsDropdown() {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.info("Notification feed cleared");
  };

  const markAsRead = (id: string, href?: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    if (href) {
      router.push(href);
      setIsOpen(false);
    }
  };

  const getIcon = (type: SystemNotification["type"]) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "recruitment":
        return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "website":
        return <Globe className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "qr":
        return <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (type: SystemNotification["type"]) => {
    switch (type) {
      case "emergency":
        return "bg-rose-100 dark:bg-rose-950/60";
      case "recruitment":
        return "bg-blue-100 dark:bg-blue-950/60";
      case "website":
        return "bg-purple-100 dark:bg-purple-950/60";
      case "qr":
        return "bg-emerald-100 dark:bg-emerald-950/60";
      default:
        return "bg-slate-100 dark:bg-slate-800";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        aria-label="View system notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg flex items-center gap-1 transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium hidden sm:inline">Mark all</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="py-10 text-center px-4">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    All caught up!
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    No new system alerts or operational notifications.
                  </p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id, item.href)}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                      item.unread
                        ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${getIconBg(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {item.unread && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 self-center" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-center">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                Apex Telemetry System <ExternalLink className="w-3 h-3 text-slate-400" />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
