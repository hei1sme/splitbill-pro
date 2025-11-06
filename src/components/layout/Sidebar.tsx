"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Home,
  Banknote,
  Users,
  User,
  FileText,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  NotificationCenter,
  useSmartNotifications,
} from "@/components/notifications/NotificationCenter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home, hint: "Pulse" },
  { href: "/banks", label: "Banks", icon: Banknote, hint: "Directory" },
  { href: "/people", label: "People", icon: User, hint: "Contacts" },
  { href: "/groups", label: "Groups", icon: Users, hint: "Teams" },
  { href: "/bills", label: "Bills Archive", icon: FileText, hint: "History" },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSmartNotifications();

  const handleNotificationClick = (notification: any) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <aside
      className="relative hidden min-h-screen w-[18rem] flex-col border-r border-white/10 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/60 px-6 py-8 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.65)] backdrop-blur-3xl lg:flex"
      suppressHydrationWarning
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-20 h-48 w-48 rounded-full bg-indigo-500/30 blur-[80px]" />
        <div className="absolute bottom-12 left-1/3 h-40 w-40 rounded-full bg-purple-500/25 blur-[80px]" />
      </div>

      <div className="relative flex h-full flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-sm font-semibold text-white shadow-lg transition group-hover:scale-[1.03]">
              SB
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                SplitBill
              </p>
              <p className="text-base font-semibold text-slate-100">
                Pro Control
              </p>
            </div>
          </Link>
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onNotificationClick={handleNotificationClick}
          />
        </header>

        <section className="space-y-5">
          <Link href="/bills?action=add">
            <Button className="group flex w-full items-center justify-between rounded-2xl border border-white/15 bg-gradient-to-r from-indigo-500/80 via-purple-500/80 to-blue-500/80 px-5 py-4 text-sm font-semibold text-white shadow-[0_25px_60px_-30px_rgba(79,70,229,0.9)] transition hover:shadow-[0_35px_80px_-40px_rgba(79,70,229,0.95)]">
              <span className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Bill
              </span>
              <Sparkles className="h-4 w-4 opacity-80 transition group-hover:rotate-[18deg]" />
            </Button>
          </Link>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 shadow-inner shadow-slate-950/60">
            <p className="font-medium text-slate-100">
              Live portfolio snapshot
            </p>
            <div className="mt-2 flex flex-col gap-2 text-[0.72rem] text-slate-300/80">
              <p>
                • Monitor settlement pipelines and upcoming payment reminders
              </p>
              <p>• Personalize alerts to keep every split on pace</p>
            </div>
          </div>
        </section>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-white/15 bg-white/10 text-white shadow-[0_20px_60px_-35px_rgba(99,102,241,0.9)]"
                      : "text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 transition group-hover:bg-white/10",
                        isActive && "bg-white/15 text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.45em] text-slate-500">
                    {item.hint}
                  </span>
                </Link>
              </Fragment>
            );
          })}
        </nav>

        <footer className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300/80">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-slate-400">
            Premium mode
          </p>
          <p className="mt-2 text-sm text-slate-200">
            All analytics, settlement automation, and QR payment rails are
            active.
          </p>
        </footer>
      </div>
    </aside>
  );
}
