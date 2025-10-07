"use client";

import * as React from "react";
import { BillsDashboard } from "@/components/bills/BillsDashboard";
import { BillStatusTabs } from "@/components/bills/BillStatusTabs";
import { StatusWorkflowIndicator } from "@/components/bills/StatusWorkflowIndicator";
import { StatusBadge } from "@/components/bills/StatusBadge";
import ClientOnly from "@/components/ClientOnly";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, X, Calendar, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type BillForTable = {
  id: string;
  title: string;
  date: string;
  group: any;
  payer: any;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
  items: any[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
};

export default function BillsPage() {
  const [bills, setBills] = React.useState<BillForTable[]>([]);
  const [filteredBills, setFilteredBills] = React.useState<BillForTable[]>([]);
  const [groups, setGroups] = React.useState<any[]>([]);
  const [people, setPeople] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [globalSearch, setGlobalSearch] = React.useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [billsRes, groupsRes, peopleRes] = await Promise.all([
        fetch("/api/bills"),
        fetch("/api/groups"),
        fetch("/api/people"),
      ]);
      
      const [billsData, groupsData, peopleResponse] = await Promise.all([
        billsRes.json(),
        groupsRes.json(),
        peopleRes.json(),
      ]);
      
      // Handle people API response structure
      const peopleData = peopleResponse.success ? peopleResponse.data : peopleResponse;
      
      setBills(billsData);
      setFilteredBills(billsData);
      setGroups(groupsData);
      setPeople(peopleData);
    } catch (error) {
      toast.error("Failed to fetch data.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Global search filter
  React.useEffect(() => {
    if (!globalSearch.trim()) {
      setFilteredBills(bills);
      return;
    }

    const searchTerm = globalSearch.toLowerCase();
    
    const filtered = bills.filter(bill => {
      // Check title
      const titleMatch = bill.title?.toLowerCase().includes(searchTerm);
      
      // Check group name
      const groupMatch = bill.group?.name?.toLowerCase().includes(searchTerm);
      
      // Check payer name
      const payerMatch = bill.payer?.displayName?.toLowerCase().includes(searchTerm);
      
      // Check description for additional context
      const descriptionMatch = bill.description?.toLowerCase().includes(searchTerm);
      
      return titleMatch || groupMatch || payerMatch || descriptionMatch;
    });
    
    setFilteredBills(filtered);
  }, [bills, globalSearch]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Bills Management</h1>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Bills Management</h1>
      
      <ClientOnly fallback={<div className="space-y-4"><div className="h-32 bg-gray-200 rounded animate-pulse"></div></div>}>
        <div className="space-y-6">
          {/* Overall Dashboard */}
          <BillsDashboard bills={bills} />
          
          {/* Global Search */}
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Search Bills</h3>
              {globalSearch && (
                <div className="text-sm text-muted-foreground">
                  {filteredBills.length} of {bills.length} bills found
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, group, payer, or description..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="pl-10 pr-10"
              />
              {globalSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Search Results */}
            {globalSearch && (
              <div className="mt-4 space-y-2">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <Card 
                      key={bill.id} 
                      className="hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => window.location.href = `/bills/${bill.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium hover:text-primary">{bill.title}</h4>
                              <StatusBadge status={bill.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{bill.group?.name || 'No Group'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{format(new Date(bill.createdAt), "MMM dd, yyyy")}</span>
                              </div>
                              <div>
                                Payer: {bill.payer?.displayName || 'Unknown'}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`/bills/${bill.id}`, '_blank');
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No bills found matching "{globalSearch}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Show tabs only when not searching */}
          {!globalSearch && (
            <>
              {/* Workflow Guide */}
              <StatusWorkflowIndicator />
              
              {/* Status-based Tabs */}
              <BillStatusTabs bills={bills} groups={groups} people={people} />
            </>
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
