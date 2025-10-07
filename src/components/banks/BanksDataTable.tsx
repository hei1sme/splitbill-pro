"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BankForm } from "./BankForm";
import { Bank } from "../../../node_modules/.prisma/client-dev";
import { BankCreateSchema } from "@/lib/validations";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Banknote, Building, Pencil, Trash2 } from "lucide-react";
import { HydrationSafe, SearchContainer } from "@/components/ui/hydration-safe";
import { ClientOnly } from "@/components/ui/client-only";

type BankWithCount = Bank & {
  _count: {
    people: number;
  };
};

// Component for bank logo with error handling
function BankLogo({ logoUrl, bankName }: { logoUrl: string; bankName: string }) {
  const [imageError, setImageError] = useState(false);

  if (!logoUrl || imageError) {
    return (
      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
        <Banknote className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image 
      src={logoUrl} 
      alt={bankName} 
      width={40} 
      height={40} 
      className="rounded-md object-contain" 
      onError={() => setImageError(true)}
      suppressHydrationWarning
    />
  );
}

async function createBank(values: z.infer<typeof BankCreateSchema>) {
  const res = await fetch("/api/banks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

async function updateBank(code: string, values: Partial<z.infer<typeof BankCreateSchema>>) {
  const res = await fetch(`/api/banks/${code}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

async function deleteBank(code: string) {
  const res = await fetch(`/api/banks/${code}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error.message);
  }
  return res.json();
}

export function BanksDataTable({ data, refreshData }: { data: BankWithCount[], refreshData: () => void }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<BankWithCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (values: z.infer<typeof BankCreateSchema>) => {
    setIsSubmitting(true);
    try {
      if (selectedBank) {
        await updateBank(selectedBank.code, values);
        toast.success("Bank updated successfully!");
      } else {
        await createBank(values);
        toast.success("Bank created successfully!");
      }
      refreshData();
      setIsFormOpen(false);
      setSelectedBank(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBank) return;
    setIsSubmitting(true);
    try {
      await deleteBank(selectedBank.code);
      toast.success("Bank deleted successfully!");
      refreshData();
      setIsDeleteConfirmOpen(false);
      setSelectedBank(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<BankWithCount>[] = [
    {
      accessorKey: "logoUrl",
      header: "Logo",
      enableSorting: false,
      cell: ({ row }) => {
        const logoUrl = row.getValue("logoUrl") as string;
        const bankName = row.original.name;
        return <BankLogo logoUrl={logoUrl} bankName={bankName} />;
      },
    },
    {
      accessorKey: "code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Code
          </Button>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
          </Button>
        )
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Type
          </Button>
        )
      },
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <div className="flex items-center">
            {type === 'BANK' ? <Building className="w-4 h-4 mr-2" /> : <Banknote className="w-4 h-4 mr-2" />}
            {type}
          </div>
        )
      }
    },
    {
      accessorKey: "_count.people",
      header: "Usage",
      cell: ({ row }) => row.original._count.people,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const bank = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedBank(bank);
                setIsFormOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => {
                setSelectedBank(bank);
                setIsDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) => {
      // Search across name and code columns
      const name = row.getValue("name") as string;
      const code = row.getValue("code") as string;
      const searchValue = value.toLowerCase();
      
      return (
        name.toLowerCase().includes(searchValue) ||
        code.toLowerCase().includes(searchValue)
      );
    },
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <HydrationSafe className="w-full">
      <SearchContainer className="flex items-center justify-between py-4">
        <ClientOnly fallback={<div className="h-10 w-64 bg-muted animate-pulse rounded-md"></div>}>
          <Input
            placeholder="🔍 Search banks by name or code..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        </ClientOnly>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedBank(null);
        }}>
          <DialogTrigger asChild>
            <Button>Add Bank</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedBank ? "Edit Bank" : "Add New Bank"}</DialogTitle>
            </DialogHeader>
            <BankForm onSubmit={handleFormSubmit} isPending={isSubmitting} defaultValues={selectedBank || undefined} />
          </DialogContent>
        </Dialog>
      </SearchContainer>
      <ClientOnly fallback={<div className="h-64 bg-muted animate-pulse rounded-md"></div>}>
        <HydrationSafe className="rounded-md border glass-card">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} suppressHydrationWarning>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} suppressHydrationWarning>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody suppressHydrationWarning>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  suppressHydrationWarning
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} suppressHydrationWarning>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow suppressHydrationWarning>
                <TableCell colSpan={columns.length} className="h-24 text-center" suppressHydrationWarning>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </HydrationSafe>
      </ClientOnly>
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p>
            This action cannot be undone. This will permanently delete the bank
            "{selectedBank?.name}".
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </HydrationSafe>
  );
}
