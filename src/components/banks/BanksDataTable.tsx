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
import { HydrationSafe } from "@/components/ui/hydration-safe";
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
    <HydrationSafe className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ClientOnly fallback={<div className="h-11 w-64 rounded-2xl border border-white/10 bg-white/10" />}>
          <Input
            placeholder="Search banks by name or code..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus-visible:ring-0"
          />
        </ClientOnly>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedBank(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
              data-bank-action="open"
            >
              Add bank
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedBank ? "Edit Bank" : "Add New Bank"}
              </DialogTitle>
            </DialogHeader>
            <BankForm
              onSubmit={handleFormSubmit}
              isPending={isSubmitting}
              defaultValues={selectedBank || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <ClientOnly fallback={<div className="h-64 rounded-3xl border border-white/10 bg-white/10" />}>
        <HydrationSafe className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Table>
            <TableHeader className="bg-white/5 text-xs uppercase tracking-[0.35em] text-slate-300/80">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} suppressHydrationWarning>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="py-4" suppressHydrationWarning>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody suppressHydrationWarning>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="transition hover:bg-white/10"
                    suppressHydrationWarning
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-5 text-sm text-slate-200"
                        suppressHydrationWarning
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow suppressHydrationWarning>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-slate-300/70"
                    suppressHydrationWarning
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </HydrationSafe>
      </ClientOnly>

      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-sm border-white/10 bg-slate-950/90 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Remove bank</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-300/80">
            This action cannot be undone. Bank "{selectedBank?.name}" and its
            mapped profiles will lose quick access to QR data.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-full border border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white hover:brightness-110"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </HydrationSafe>
  );
}
