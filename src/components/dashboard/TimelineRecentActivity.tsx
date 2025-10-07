"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ExternalLink, Eye } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface TimelineRecentActivityProps {
  bills: any[];
  maxItems?: number;
}

export function TimelineRecentActivity({ bills, maxItems = 3 }: TimelineRecentActivityProps) {
  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const calculateBillTotal = (bill: any) => {
    let billTotal = 0;
    try {
      if (bill.description && bill.description.startsWith('{')) {
        const savedData = JSON.parse(bill.description);
        if (savedData.items) {
          billTotal = savedData.items
            .filter((item: any) => item.type === 'NORMAL')
            .reduce((sum: number, item: any) => sum + (item.fee || 0), 0);
        }
      }
      
      if (billTotal === 0 && bill.items) {
        billTotal = bill.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      }
    } catch (error) {
      console.error('Error calculating bill total:', error);
    }
    return billTotal;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: { variant: "secondary" as const, color: "bg-yellow-100 text-yellow-700 border-yellow-200", emoji: "✏️" },
      ACTIVE: { variant: "default" as const, color: "bg-blue-100 text-blue-700 border-blue-200", emoji: "🔄" },
      COMPLETED: { variant: "outline" as const, color: "bg-orange-100 text-orange-700 border-orange-200", emoji: "✅" },
      SETTLED: { variant: "outline" as const, color: "bg-green-100 text-green-700 border-green-200", emoji: "💰" },
    };
    const config = variants[status as keyof typeof variants] || variants.DRAFT;
    return (
      <Badge className={`${config.color} text-xs`}>
        {config.emoji} {status}
      </Badge>
    );
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const billDate = new Date(date);
    const diffHours = Math.floor((now.getTime() - billDate.getTime()) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays === 0) {
      if (diffHours === 0) return "Just now";
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(billDate, "MMM d");
    }
  };

  const recentBills = bills
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  if (recentBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🕒 Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No recent activity</p>
            <Button
              variant="outline"
              onClick={() => router.push('/bills?action=add')}
            >
              Create First Bill
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
          🕒 Recent Activity
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/bills')}
          className="text-xs"
        >
          View All
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBills.map((bill, index) => (
            <div key={bill.id} className="relative">
              {/* Timeline Line */}
              {index < recentBills.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
              )}
              
              {/* Timeline Content */}
              <div className="flex items-start gap-4 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                {/* Timeline Dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-2 ${
                  bill.status === 'SETTLED' ? 'bg-green-500' :
                  bill.status === 'COMPLETED' ? 'bg-orange-500' :
                  bill.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-400'
                }`} />
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">🧾 {bill.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        👥 {bill.group?.name || "No Group"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm">
                        {formatCurrency(calculateBillTotal(bill))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getTimeAgo(bill.updatedAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(bill.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/bills/${bill.id}`)}
                      className="h-7 px-2 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {bills.length > maxItems && (
          <div className="mt-4 pt-4 border-t text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/bills')}
              className="w-full"
            >
              View {bills.length - maxItems} more activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
