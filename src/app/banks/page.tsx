"use client";

import { BanksDataTable } from "@/components/banks/BanksDataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Bank } from "../../../node_modules/.prisma/client-dev";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

type BankWithCount = Bank & {
  _count: {
    people: number;
  };
};

export default function BanksPage() {
  const [banks, setBanks] = useState<BankWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banks");
      const result = await res.json();
      if (result.success) {
        setBanks(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch banks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  return (
    <div className="space-y-8" suppressHydrationWarning>
      <PageHero
        eyebrow="Payments directory"
        title="Banks & QR enabled payment rails"
        description="Keep your preferred issuing banks and settlement partners a tap away. Update logos, QR references, or provisioning data without leaving the flow."
        accent="emerald"
        stats={[
          {
            label: "Active banks",
            value: `${banks.length}`,
            helper: "Available for payer onboarding",
          },
          {
            label: "Linked contacts",
            value: `${banks.reduce((sum, bank) => sum + bank._count.people, 0)}`,
            helper: "People mapped to banks",
          },
        ]}
        actions={
          <Button
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
            onClick={fetchBanks}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Sync directory
          </Button>
        }
      />

      <div className="frosted-card p-6">
        {loading ? (
          <div className="space-y-4" suppressHydrationWarning>
            <Skeleton className="h-12 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-12 w-full rounded-2xl bg-white/10" />
            <Skeleton className="h-96 w-full rounded-3xl bg-white/10" />
          </div>
        ) : (
          <BanksDataTable data={banks} refreshData={fetchBanks} />
        )}
      </div>
      <Toaster />
    </div>
  );
}
