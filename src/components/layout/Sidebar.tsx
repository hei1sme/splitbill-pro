"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import {
  Home,
  Banknote,
  Users,
  User as UserIcon,
  FileText,
  Plus,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/banks", label: "Banks", icon: Banknote },
  { href: "/people", label: "People", icon: UserIcon },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/bills", label: "Bills", icon: FileText },
];

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const userInitial = user.email?.[0]?.toUpperCase() ?? "U";
  const userEmail = user.email ?? "Unknown";

  return (
    <aside className="hidden lg:flex flex-col min-h-screen w-64 border-r border-border bg-card px-4 py-6 flex-shrink-0">
      {/* Brand */}
      <Link href="/dashboard" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground text-xs font-black tracking-tight transition-all group-hover:scale-110">
          SB
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            SplitBill
          </p>
          <p className="text-sm font-semibold text-foreground leading-tight">
            Pro
          </p>
        </div>
      </Link>

      {/* New Bill CTA */}
      <Link
        href="/bills?action=add"
        className="flex items-center justify-center gap-2 mb-6 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
      >
        <Plus className="w-4 h-4" />
        New Bill
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Sign out */}
      <div className="border-t border-border pt-4 mt-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
            {userInitial}
          </div>
          <p className="text-xs text-muted-foreground truncate flex-1">
            {userEmail}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
