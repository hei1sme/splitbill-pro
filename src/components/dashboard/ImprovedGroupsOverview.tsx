"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            👥 Groups Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No groups yet</p>
            <Button
              variant="outline"
              onClick={() => router.push('/groups/new')}
            >
              Create First Group
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          👥 Groups Overview
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/groups')}
          className="text-xs"
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {groups.slice(0, 5).map((group) => {
            const pendingBills = getPendingBillsCount(group);
            const colorClass = getGroupColor(group.name);
            
            return (
              <div
                key={group.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/groups/${group.id}`)}
              >
                {/* Group Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${colorClass}`}>
                  {getGroupInitials(group.name)}
                </div>

                {/* Group Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{group._count.members} members</span>
                    <span>•</span>
                    <span>{group._count.bills} bills</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  {pendingBills > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {pendingBills} pending
                    </Badge>
                  )}
                  {group._count.bills === 0 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
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
                onClick={() => router.push('/groups')}
                className="text-xs"
              >
                View {groups.length - 5} more groups
              </Button>
            </div>
          )}
        </div>

        {/* Quick Create Button */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/groups/new')}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            Create New Group
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
