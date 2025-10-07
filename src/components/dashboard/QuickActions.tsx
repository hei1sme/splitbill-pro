"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2, ArrowRight, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface QuickActionsProps {
  bills: any[];
}

export function QuickActions({ bills }: QuickActionsProps) {
  const router = useRouter();

  // Categorize bills that need attention
  const getBillsNeedingAttention = () => {
    const draftBills = bills.filter(bill => bill.status === 'DRAFT');
    const activeBills = bills.filter(bill => bill.status === 'ACTIVE');
    const completedBills = bills.filter(bill => bill.status === 'COMPLETED');
    
    // Find overdue bills (older than 30 days and not settled)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const overdueBills = bills.filter(bill => 
      bill.status !== 'SETTLED' && 
      new Date(bill.createdAt) < thirtyDaysAgo
    );

    return {
      draft: draftBills.slice(0, 3),
      active: activeBills.slice(0, 3),
      completed: completedBills.slice(0, 3),
      overdue: overdueBills.slice(0, 3)
    };
  };

  const actionableItems = getBillsNeedingAttention();

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

  const ActionItem = ({ 
    bill, 
    actionType, 
    icon, 
    actionLabel, 
    variant = "default" 
  }: {
    bill: any;
    actionType: string;
    icon: React.ReactNode;
    actionLabel: string;
    variant?: "default" | "outline" | "destructive" | "secondary";
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{bill.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {bill.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatCurrency(calculateBillTotal(bill))}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/bills/${bill.id}`)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant={variant}
          size="sm"
          onClick={() => router.push(`/bills/${bill.id}`)}
          className="h-8"
        >
          {actionLabel}
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );

  const hasActionableItems = 
    actionableItems.draft.length > 0 ||
    actionableItems.active.length > 0 ||
    actionableItems.completed.length > 0 ||
    actionableItems.overdue.length > 0;

  if (!hasActionableItems) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <p className="text-lg font-medium text-green-600">All caught up!</p>
            <p className="text-sm text-muted-foreground">
              No bills need immediate attention right now.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Bills Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Bills - Highest Priority */}
        {actionableItems.overdue.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Overdue Bills</span>
              <Badge variant="destructive" className="text-xs">
                {actionableItems.overdue.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {actionableItems.overdue.map(bill => (
                <ActionItem
                  key={bill.id}
                  bill={bill}
                  actionType="overdue"
                  icon={<AlertCircle className="h-4 w-4 text-red-600" />}
                  actionLabel="Settle"
                  variant="destructive"
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Bills - Ready to Settle */}
        {actionableItems.completed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Ready to Settle</span>
              <Badge variant="secondary" className="text-xs">
                {actionableItems.completed.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {actionableItems.completed.map(bill => (
                <ActionItem
                  key={bill.id}
                  bill={bill}
                  actionType="completed"
                  icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
                  actionLabel="Settle"
                  variant="default"
                />
              ))}
            </div>
          </div>
        )}

        {/* Active Bills - In Progress */}
        {actionableItems.active.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Active Bills</span>
              <Badge variant="outline" className="text-xs">
                {actionableItems.active.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {actionableItems.active.map(bill => (
                <ActionItem
                  key={bill.id}
                  bill={bill}
                  actionType="active"
                  icon={<Clock className="h-4 w-4 text-blue-600" />}
                  actionLabel="Update"
                  variant="outline"
                />
              ))}
            </div>
          </div>
        )}

        {/* Draft Bills - Need to Activate */}
        {actionableItems.draft.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Draft Bills</span>
              <Badge variant="secondary" className="text-xs">
                {actionableItems.draft.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {actionableItems.draft.map(bill => (
                <ActionItem
                  key={bill.id}
                  bill={bill}
                  actionType="draft"
                  icon={<AlertCircle className="h-4 w-4 text-yellow-600" />}
                  actionLabel="Activate"
                  variant="secondary"
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/bills?status=ACTIVE')}
              className="text-xs"
            >
              View All Active
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/bills?status=COMPLETED')}
              className="text-xs"
            >
              View Completed
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
