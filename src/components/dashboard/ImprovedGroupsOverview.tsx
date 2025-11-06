"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImprovedGroupsOverviewProps {
  groups: any[];
}

export function ImprovedGroupsOverview({ groups }: ImprovedGroupsOverviewProps) {
  const router = useRouter();

  // Generate group avatar colors
  const getGroupColor = (groupName: string) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600", 
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-pink-100 text-pink-600",
      "bg-indigo-100 text-indigo-600"
    ];
    const index = groupName.length % colors.length;
    return colors[index];
  };

  const getGroupInitials = (groupName: string) => {
    return groupName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPendingBillsCount = (group: any) => {
    // This would need to be calculated based on bills data
    // For now, we'll use a simple estimate
    return Math.max(0, group._count.bills - Math.floor(group._count.bills * 0.7));
  };

  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
            <Users className="h-4 w-4" />
            Groups overview
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/groups")}
            className="rounded-full border-white/20 bg-white/10 text-xs text-white hover:border-white/35 hover:bg-white/15"
          >
            Browse
          </Button>
        </div>
        <div className="py-10 text-center text-sm text-slate-300/80">
          <Users className="mx-auto mb-4 h-10 w-10 opacity-50" />
          <p>No groups yet. Create your first cohort to fast-track new bills.</p>
          <Button
            variant="outline"
            onClick={() => router.push("/groups")}
            className="mt-4 rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
          >
            Create first group
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
      <div className="flex items-center justify-between pb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
          <Users className="h-4 w-4" />
          Groups overview
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/groups")}
          className="rounded-full text-xs text-slate-300 hover:text-white"
        >
          View all
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-3">
        {groups.slice(0, 5).map((group) => {
          const pendingBills = getPendingBillsCount(group);
          const colorClass = getGroupColor(group.name);

          return (
            <div
              key={group.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/20 hover:bg-white/10"
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${colorClass}`}
              >
                {getGroupInitials(group.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                  {group.name}
                </div>
                <div className="text-xs text-slate-300/80">
                  {group._count.members} members • {group._count.bills} bills
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pendingBills > 0 && (
                  <Badge className="rounded-full bg-white/10 text-[10px] uppercase tracking-[0.28em] text-amber-300">
                    {pendingBills} pending
                  </Badge>
                )}
                {group._count.bills === 0 && (
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-[0.28em] text-slate-400">
                    No bills
                  </Badge>
                )}
              </div>
            </div>
          );
        })}

        {groups.length > 5 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/groups")}
              className="rounded-full text-xs text-slate-300 hover:text-white"
            >
              View {groups.length - 5} more groups
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300/80">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/groups")}
          className="w-full rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
        >
          <Users className="mr-2 h-4 w-4" />
          Create new group
        </Button>
      </div>
    </div>
  );
}
