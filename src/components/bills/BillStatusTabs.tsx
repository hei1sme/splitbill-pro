"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BillsDataTable } from "./BillsDataTable";
import { StatusQuickActions } from "./StatusQuickActions";
import { FileText, Clock, CheckCircle, Archive } from "lucide-react";
import { Group, Person } from "@prisma/client/dev";
import { toast } from "sonner";

type BillForTable = {
  id: string;
  title: string;
  date: string;
  group: Group;
  payer: Person;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
  items: any[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
};

interface BillStatusTabsProps {
  bills: BillForTable[];
  groups: (Group & { people: Person[] })[];
  people: Person[];
}

export function BillStatusTabs({ bills, groups, people }: BillStatusTabsProps) {
  const [selectedBills, setSelectedBills] = React.useState<string[]>([]);
  const [activeTab, setActiveTab] = React.useState("active");

  // Filter bills by status
  const draftBills = bills.filter(bill => bill.status === 'DRAFT');
  const activeBills = bills.filter(bill => bill.status === 'ACTIVE');
  const completedBills = bills.filter(bill => bill.status === 'COMPLETED');
  const settledBills = bills.filter(bill => bill.status === 'SETTLED');

  // Handle bulk status changes
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedBills.length === 0) return;
    
    try {
      const promises = selectedBills.map(billId =>
        fetch(`/api/bills/${billId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      );
      
      await Promise.all(promises);
      toast.success(`${selectedBills.length} bills updated to ${newStatus}`);
      setSelectedBills([]);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to update bills");
      console.error(error);
    }
  };

  const handleBulkExport = () => {
    toast.info("Export functionality coming soon!");
  };

  const statusTabs = [
    {
      value: "draft",
      label: "Draft",
      icon: FileText,
      count: draftBills.length,
      bills: draftBills,
      description: "Bills being created or edited",
      color: "text-gray-600",
      badgeVariant: "secondary" as const
    },
    {
      value: "active", 
      label: "Active",
      icon: Clock,
      count: activeBills.length,
      bills: activeBills,
      description: "Bills ready for payment tracking",
      color: "text-orange-600",
      badgeVariant: "default" as const
    },
    {
      value: "completed",
      label: "Completed", 
      icon: CheckCircle,
      count: completedBills.length,
      bills: completedBills,
      description: "Bills ready for settlement",
      color: "text-blue-600",
      badgeVariant: "default" as const
    },
    {
      value: "settled",
      label: "Settled",
      icon: Archive,
      count: settledBills.length, 
      bills: settledBills,
      description: "Completed and archived bills",
      color: "text-green-600",
      badgeVariant: "default" as const
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        {statusTabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="flex items-center gap-2"
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <Badge variant={tab.badgeVariant} className="ml-1">
                {tab.count}
              </Badge>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {statusTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="space-y-4">
          {/* Status Description */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <tab.icon className={`h-4 w-4 ${tab.color}`} />
            <span>{tab.description}</span>
            <Badge variant="outline" className="ml-auto">
              {tab.count} {tab.count === 1 ? 'bill' : 'bills'}
            </Badge>
          </div>

          {/* Status-specific Quick Actions */}
          <StatusQuickActions
            status={tab.value.toUpperCase() as "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED"}
            selectedBills={selectedBills}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkExport={handleBulkExport}
            onClearSelection={() => setSelectedBills([])}
          />

          {/* Status-specific Bills Table */}
          <BillsDataTable 
            initialBills={tab.bills}
            groups={groups}
            people={people}
            statusFilter={tab.value.toUpperCase()}
            showDashboard={false}
            showAdvancedSearch={false}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
