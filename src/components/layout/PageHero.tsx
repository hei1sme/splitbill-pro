"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeroStat = {
  label: string;
  value: string;
  helper?: string;
};

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  accent?: "indigo" | "emerald" | "amber" | "rose";
  stats?: HeroStat[];
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

const accentMap: Record<NonNullable<PageHeroProps["accent"]>, string> = {
  indigo:
    "from-indigo-500/70 via-purple-500/60 to-blue-500/50 ring-indigo-500/40",
  emerald:
    "from-emerald-500/70 via-teal-500/60 to-cyan-500/50 ring-emerald-500/35",
  amber:
    "from-amber-400/70 via-orange-500/60 to-pink-500/50 ring-amber-400/35",
  rose: "from-rose-500/70 via-pink-500/60 to-purple-500/50 ring-rose-500/35",
};

export function PageHero({
  eyebrow,
  title,
  description,
  accent = "indigo",
  stats,
  actions,
  className,
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.05] p-8 md:p-10",
        "shadow-[0_45px_120px_-65px_rgba(79,70,229,0.95)] backdrop-blur-2xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute -top-24 left-16 h-64 w-64 rounded-full blur-[120px]",
            accentMap[accent]
          )}
        />
        <div className="absolute right-10 top-8 h-40 w-40 rounded-full bg-white/10 blur-[90px]" />
        <div className="absolute -bottom-28 right-28 h-72 w-72 rounded-full bg-white/5 blur-[140px]" />
      </div>

      <div className="relative flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            {eyebrow && (
              <p className="text-xs uppercase tracking-[0.45em] text-slate-300/70">
                {eyebrow}
              </p>
            )}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-sm text-slate-300/80 md:text-base">
                  {description}
                </p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>
          )}
        </div>

        {(stats?.length || 0) > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats!.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-200 shadow-inner shadow-slate-950/40",
                  "flex flex-col gap-2"
                )}
              >
                <span className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  {stat.label}
                </span>
                <span className="text-2xl font-semibold text-white">
                  {stat.value}
                </span>
                {stat.helper && (
                  <span className="text-xs text-slate-400/80">{stat.helper}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
