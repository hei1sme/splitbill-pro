"use client";

import { BanksDataTable } from "@/components/banks/BanksDataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Bank } from "../../../node_modules/.prisma/client-dev";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

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
    <div className="container mx-auto py-10" suppressHydrationWarning>
      <h1 className="text-3xl font-bold mb-6">Banks Management</h1>
      {loading ? (
        <div className="space-y-4" suppressHydrationWarning>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <BanksDataTable data={banks} refreshData={fetchBanks} />
      )}
      <Toaster />
    </div>
  );
}
