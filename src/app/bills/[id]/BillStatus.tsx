"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface BillStatusProps {
  billId: string;
  currentStatus: "DRAFT" | "OPEN" | "SETTLED";
}

export function BillStatus({ billId, currentStatus }: BillStatusProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus as any);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "secondary";
      case "OPEN":
        return "default";
      case "SETTLED":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Status:</span>
      <Badge variant={getStatusVariant(status)}>{status}</Badge>
      <Select value={status} onValueChange={updateStatus} disabled={isLoading}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="OPEN">Open</SelectItem>
          <SelectItem value="SETTLED">Settled</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
