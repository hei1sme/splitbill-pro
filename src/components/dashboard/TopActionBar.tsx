"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, Activity, Eye } from "lucide-react";
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
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Primary Action */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/bills?action=add')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Bill
            </Button>
            
            <div className="hidden sm:block text-sm text-muted-foreground">
              Quick access to create and manage your bills
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2">
            {quickShortcuts.map((shortcut) => (
              <Button
                key={shortcut.label}
                variant={shortcut.variant}
                size="sm"
                onClick={() => router.push(shortcut.href)}
                className="flex items-center gap-2"
              >
                {shortcut.icon}
                <span className="hidden sm:inline">{shortcut.label}</span>
                {shortcut.count !== undefined && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {shortcut.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
