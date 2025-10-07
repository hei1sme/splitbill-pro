"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Eye, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface EnhancedRecentActivityProps {
  bills: any[];
  maxItems?: number;
}

export function EnhancedRecentActivity({ bills, maxItems = 8 }: EnhancedRecentActivityProps) {
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
      DRAFT: { variant: "secondary" as const, color: "text-yellow-600" },
      ACTIVE: { variant: "default" as const, color: "text-blue-600" },
      COMPLETED: { variant: "outline" as const, color: "text-green-600" },
      SETTLED: { variant: "outline" as const, color: "text-gray-600" },
    };
    const config = variants[status as keyof typeof variants] || variants.DRAFT;
    return (
      <Badge variant={config.variant} className={config.color}>
        {status}
      </Badge>
    );
  };

  const getStatusAction = (bill: any) => {
    switch (bill.status) {
      case 'DRAFT':
        return { label: 'Activate', variant: 'secondary' as const };
      case 'ACTIVE':
        return { label: 'Update', variant: 'outline' as const };
      case 'COMPLETED':
        return { label: 'Settle', variant: 'default' as const };
      case 'SETTLED':
        return { label: 'View', variant: 'ghost' as const };
      default:
        return { label: 'View', variant: 'ghost' as const };
    }
  };

  const getActivityDescription = (bill: any) => {
    const timeDiff = Date.now() - new Date(bill.updatedAt).getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    let timeAgo = '';
    if (days > 0) {
      timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      timeAgo = 'Just now';
    }

    return timeAgo;
  };

  const recentBills = bills
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, maxItems);

  if (recentBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
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
        <div className="space-y-3">
          {recentBills.map((bill, index) => {
            const action = getStatusAction(bill);
            return (
              <div
                key={bill.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent/50 ${
                  index === 0 ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{bill.title}</p>
                      {index === 0 && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          Latest
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{bill.group?.name || "No Group"}</span>
                      <span>•</span>
                      <span>{formatCurrency(calculateBillTotal(bill))}</span>
                      <span>•</span>
                      <span>{getActivityDescription(bill)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusBadge(bill.status)}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/bills/${bill.id}`)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant={action.variant}
                    size="sm"
                    onClick={() => router.push(`/bills/${bill.id}`)}
                    className="h-8 text-xs px-3"
                  >
                    {action.label}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Summary */}
        {recentBills.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm font-medium">
                  {recentBills.filter(b => b.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {recentBills.filter(b => b.status === 'COMPLETED').length}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-sm font-medium">
                  {recentBills.filter(b => b.status === 'SETTLED').length}
                </div>
                <div className="text-xs text-muted-foreground">Settled</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
