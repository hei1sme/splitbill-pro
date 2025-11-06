"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopActionBarProps {
  totalBills: number;
  activeBills: number;
  activeGroups: number;
}

export function TopActionBar({ totalBills, activeBills, activeGroups }: TopActionBarProps) {
  const router = useRouter();

  const quickShortcuts = [
    {
      label: "View Groups",
      icon: <Users className="h-4 w-4" />,
      href: "/groups",
      count: activeGroups,
      variant: "outline" as const
    },
    {
      label: "Pending Bills",
      icon: <Clock className="h-4 w-4" />,
      href: "/bills?status=ACTIVE,COMPLETED",
      count: activeBills,
      variant: "outline" as const
    },
    {
      label: "Recent Activity",
      icon: <Activity className="h-4 w-4" />,
      href: "/bills",
      variant: "ghost" as const
    }
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_25px_70px_-50px_rgba(79,70,229,0.9)] backdrop-blur-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => router.push("/bills?action=add")}
            className="group w-fit rounded-full border border-white/20 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_50px_-30px_rgba(79,70,229,0.9)] transition hover:shadow-[0_30px_60px_-35px_rgba(79,70,229,0.95)]"
          >
            <Plus className="mr-2 h-4 w-4 transition group-hover:rotate-12" />
            Add new bill
          </Button>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Quick shortcuts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {quickShortcuts.map((shortcut) => (
            <Button
              key={shortcut.label}
              variant={shortcut.variant}
              size="sm"
              onClick={() => router.push(shortcut.href)}
              className="flex items-center gap-2 rounded-full border-white/20 bg-white/10 text-xs text-white hover:border-white/30 hover:bg-white/15"
            >
              {shortcut.icon}
              <span>{shortcut.label}</span>
              {shortcut.count !== undefined && (
                <Badge className="rounded-full border border-white/20 bg-white/10 text-[10px] uppercase tracking-[0.28em] text-slate-200">
                  {shortcut.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
