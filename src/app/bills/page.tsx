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
import { Search, X, Calendar, Users, Eye, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { PageHero } from "@/components/layout/PageHero";
import Link from "next/link";

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

      const peopleData = peopleResponse.success
        ? peopleResponse.data
        : peopleResponse;

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

  React.useEffect(() => {
    if (!globalSearch.trim()) {
      setFilteredBills(bills);
      return;
    }

    const searchTerm = globalSearch.toLowerCase();

    const filtered = bills.filter((bill) => {
      const titleMatch = bill.title?.toLowerCase().includes(searchTerm);
      const groupMatch = bill.group?.name?.toLowerCase().includes(searchTerm);
      const payerMatch = bill.payer?.displayName
        ?.toLowerCase()
        .includes(searchTerm);
      const descriptionMatch = bill.description
        ?.toLowerCase()
        .includes(searchTerm);

      return titleMatch || groupMatch || payerMatch || descriptionMatch;
    });

    setFilteredBills(filtered);
  }, [bills, globalSearch]);

  const heroStats = React.useMemo(() => {
    const totalVolume = bills.reduce((sum, bill) => {
      const base = bill.items?.reduce(
        (itemSum: number, item: any) => itemSum + (item.amount || 0),
        0
      );
      return sum + base;
    }, 0);

    const activeCount = bills.filter(
      (bill) => bill.status === "ACTIVE" || bill.status === "COMPLETED"
    ).length;
    const settledCount = bills.filter(
      (bill) => bill.status === "SETTLED"
    ).length;

    return [
      {
        label: "Total bills",
        value: `${bills.length}`,
        helper: `${activeCount} currently in motion`,
      },
      {
        label: "Settled",
        value: `${settledCount}`,
        helper: `${Math.round(
          bills.length ? (settledCount / bills.length) * 100 : 0
        )}% completion`,
      },
      {
        label: "Network volume",
        value: new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(totalVolume),
        helper: "Across all tracked bills",
      },
    ];
  }, [bills]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 rounded-3xl border border-white/10 bg-white/10 shadow-inner shadow-slate-950/50" />
        <div className="h-24 rounded-3xl border border-white/10 bg-white/10 shadow-inner shadow-slate-950/50" />
        <div className="h-80 rounded-3xl border border-white/10 bg-white/10 shadow-inner shadow-slate-950/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Settlement pipeline"
        title="Command center for every shared bill"
        description="Track statuses, surface blockers, and launch new splits in record time. This is your single hub for the entire payment lifecycle."
        accent="indigo"
        stats={heroStats}
        actions={
          <Link href="/bills?action=add">
            <Button className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15">
              <Plus className="mr-2 h-4 w-4" />
              New bill
            </Button>
          </Link>
        }
      />

      <ClientOnly
        fallback={
          <div className="space-y-4">
            <div className="h-32 rounded-3xl border border-white/10 bg-white/10" />
          </div>
        }
      >
        <div className="space-y-8">
          <div className="frosted-card p-6">
            <BillsDashboard bills={bills} />
          </div>

          <div className="frosted-card space-y-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300/80">
                Global search
              </h3>
              {globalSearch && (
                <div className="text-xs text-slate-300/70">
                  {filteredBills.length} of {bills.length} bills found
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by title, group, payer, or description..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 pl-11 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus-visible:ring-0"
              />
              {globalSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setGlobalSearch("")}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-slate-300 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {globalSearch && (
              <div className="space-y-3">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <Card
                      key={bill.id}
                      className="cursor-pointer overflow-hidden border border-white/10 bg-white/5 transition hover:border-white/20 hover:bg-white/10"
                      onClick={() => (window.location.href = `/bills/${bill.id}`)}
                    >
                      <CardContent className="flex items-center justify-between gap-4 p-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="text-base font-semibold text-white">
                              {bill.title}
                            </h4>
                            <StatusBadge status={bill.status} />
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300/80">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {bill.group?.name || "No Group"}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(bill.createdAt), "MMM dd, yyyy")}
                            </span>
                            <span>
                              Payer: {bill.payer?.displayName || "Unknown"}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/bills/${bill.id}`, "_blank");
                          }}
                          className="inline-flex items-center gap-1 rounded-full border-white/20 bg-white/10 text-xs text-slate-100 transition hover:border-white/35 hover:bg-white/15"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-8 text-sm text-slate-300/80">
                    <Search className="h-6 w-6 opacity-60" />
                    <p>No bills found matching “{globalSearch}”.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {!globalSearch && (
            <div className="space-y-6">
              <StatusWorkflowIndicator />
              <BillStatusTabs bills={bills} groups={groups} people={people} />
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
