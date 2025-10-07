"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdvancedSearch } from "./AdvancedSearch";
import { QuickActions } from "./QuickActions";
import { BillsDashboard } from "./BillsDashboard";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
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
import { Group, Person } from "@prisma/client/dev";
import { BillFormEnhanced } from "./BillFormEnhanced";
import { z } from "zod";
import { BillFormSchema, BillFormEnhancedSchema } from "@/lib/validations";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { StatusBadge } from "./StatusBadge";
import ClientOnly from "@/components/ClientOnly";
import { format } from "date-fns";

type BillForTable = {
  id: string;
  title: string;
  date: string; // from JSON
  group: Group;
  payer: Person;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
  items: any[];
  description?: string; // For saved bill data
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
};

interface BillsDataTableProps {
  initialBills?: BillForTable[];
  groups?: (Group & { people: Person[] })[];
  people?: Person[];
  statusFilter?: string;
  showDashboard?: boolean;
  showAdvancedSearch?: boolean;
}

export function BillsDataTable({ 
  initialBills,
  groups: propGroups,
  people: propPeople,
  statusFilter,
  showDashboard = true,
  showAdvancedSearch = true
}: BillsDataTableProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<BillForTable[]>(initialBills || []);
  const [groups, setGroups] = React.useState<(Group & { people: Person[] })[]>(propGroups || []);
  const [people, setPeople] = React.useState<Person[]>(propPeople || []);
  const [isLoading, setIsLoading] = React.useState(!initialBills);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<BillForTable | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  // Phase 7: Enhanced UX state
  const [selectedBills, setSelectedBills] = React.useState<string[]>([]);
  const [advancedFilters, setAdvancedFilters] = React.useState({
    searchTerm: "",
    status: "",
    dateRange: { from: undefined as Date | undefined, to: undefined as Date | undefined },
    amountRange: { min: "", max: "" },
    category: "",
    groupId: "",
  });

  // Check for action=add parameter to open dialog automatically
  React.useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsFormOpen(true);
      // Clean up URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('action');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

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
      
      console.log("[BILLS_DATA_TABLE] People response:", peopleResponse);
      console.log("[BILLS_DATA_TABLE] Processed people data:", peopleData);
      console.log("[BILLS_DATA_TABLE] Is peopleData array?", Array.isArray(peopleData));
      
      setData(billsData);
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
    // Only fetch data if props are not provided
    if (!initialBills) {
      fetchData();
    }
  }, [initialBills]);

  const handleFormSubmit = async (values: z.infer<typeof BillFormEnhancedSchema>) => {
    if (isPending) return; // Prevent double submissions
    
    setIsPending(true);
    const method = selectedBill ? "PUT" : "POST";
    const url = selectedBill ? `/api/bills/${selectedBill.id}` : "/api/bills";

    try {
      console.log("[BILLS_DATA_TABLE] Enhanced form values:", values);
      
      // Send enhanced data directly to API
      const enhancedBillData = {
        title: values.title,
        description: values.description,
        date: values.date,
        groupId: values.groupId || (groups.length > 0 ? groups[0].id : ""), // Fallback for manual mode
        payerId: values.payerId,
        status: values.status,
        // Include enhanced participant data
        participantMode: values.participantMode,
        selectedPeople: values.selectedPeople,
        quickAddNames: values.quickAddNames,
      };
      
      console.log("[BILLS_DATA_TABLE] Sending enhanced data to API:", enhancedBillData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enhancedBillData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[BILLS_SUBMIT] Error response:", errorData);
        throw new Error(errorData.message || "Something went wrong");
      }

      const result = await response.json();
      console.log("[BILLS_SUBMIT] Success response:", result);

      if (selectedBill) {
        // Updating existing bill - just refresh and close
        toast.success("Bill updated successfully.");
        setIsFormOpen(false);
        setSelectedBill(null);
        fetchData();
      } else {
        // Creating new bill - navigate to bill detail page
        toast.success("Bill created successfully! Opening bill details...");
        setIsFormOpen(false);
        setSelectedBill(null);
        // Navigate to the bill detail page as per PROMPT.md workflow
        // API returns the bill object directly, not wrapped in { bill: ... }
        router.push(`/bills/${result.id}`);
      }
    } catch (error: any) {
      console.error("[BILLS_SUBMIT] Error:", error);
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/bills/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete bill.");
      toast.success("Bill deleted successfully.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Phase 7: Bulk action handlers
  const handleBulkAction = async (action: string, billIds: string[]) => {
    try {
      switch (action) {
        case "delete":
          await Promise.all(billIds.map(id => fetch(`/api/bills/${id}`, { method: "DELETE" })));
          break;
        case "settle":
          await Promise.all(billIds.map(id => 
            fetch(`/api/bills/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "SETTLED" }),
            })
          ));
          break;
        case "export":
          // Export logic would go here
          console.log("Exporting bills:", billIds);
          break;
        case "archive":
          // Archive logic would go here
          console.log("Archiving bills:", billIds);
          break;
        case "remind":
          // Send reminders logic would go here
          console.log("Sending reminders for bills:", billIds);
          break;
      }
      fetchData(); // Refresh data after bulk action
    } catch (error: any) {
      toast.error(`Failed to perform bulk action: ${error.message}`);
    }
  };

  // Phase 7: Apply advanced filters
  const filteredData = React.useMemo(() => {
    return data.filter((bill) => {
      // Status filter from props (for tabbed view)
      if (statusFilter && bill.status !== statusFilter) {
        return false;
      }

      // Search term filter
      if (advancedFilters.searchTerm) {
        const searchTerm = advancedFilters.searchTerm.toLowerCase();
        if (!bill.title.toLowerCase().includes(searchTerm) &&
            !bill.group.name.toLowerCase().includes(searchTerm) &&
            !bill.payer.displayName.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      // Status filter from advanced search (for non-tabbed view)
      if (!statusFilter && advancedFilters.status && bill.status !== advancedFilters.status) {
        return false;
      }

      // Group filter
      if (advancedFilters.groupId && bill.group.id !== advancedFilters.groupId) {
        return false;
      }

      // Amount range filter - calculate total from items (safely handle undefined items)
      const totalAmount = bill.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
      if (advancedFilters.amountRange.min && totalAmount < parseFloat(advancedFilters.amountRange.min)) {
        return false;
      }
      if (advancedFilters.amountRange.max && totalAmount > parseFloat(advancedFilters.amountRange.max)) {
        return false;
      }

      // Date range filter
      if (advancedFilters.dateRange.from) {
        const billDate = new Date(bill.createdAt);
        if (billDate < advancedFilters.dateRange.from) {
          return false;
        }
      }
      if (advancedFilters.dateRange.to) {
        const billDate = new Date(bill.createdAt);
        if (billDate > advancedFilters.dateRange.to) {
          return false;
        }
      }

      return true;
    });
  }, [data, advancedFilters, statusFilter]);

  const columns: ColumnDef<BillForTable>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <a
          href={`/bills/${row.original.id}`}
          className="font-medium text-primary underline-offset-4 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            router.push(`/bills/${row.original.id}`);
          }}
        >
          {row.getValue("title")}
        </a>
      ),
    },
    {
      accessorKey: "group.name",
      header: "Group",
    },
    {
      accessorKey: "payer.displayName",
      header: "Payer",
      cell: ({ row }) => {
        const payer = row.original.payer;
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {payer?.displayName?.charAt(0) || 'P'}
            </div>
            <span className="text-sm">{payer?.displayName || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => format(new Date(row.getValue("date")), "PPP"),
    },
    {
      accessorKey: "_count.items",
      header: "Items",
      cell: ({ row }) => {
        const count = row.original._count?.items || 0;
        return <div className="text-right font-medium">{count}</div>;
      },
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => {
        // Try to get total from saved bill data
        let total = 0;
        try {
          // Check if there's saved data in description
          const bill = row.original;
          if (bill.description && bill.description.startsWith('{')) {
            const savedData = JSON.parse(bill.description);
            if (savedData.items) {
              total = savedData.items
                .filter((item: any) => item.type === 'NORMAL')
                .reduce((sum: number, item: any) => sum + (item.fee || 0), 0);
            }
          }
          
          // Fallback to database items
          if (total === 0 && bill.items) {
            total = bill.items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
          }
        } catch (error) {
          console.error('Error calculating total:', error);
        }
        
        return (
          <div className="text-right font-medium">
            {new Intl.NumberFormat('vi-VN', { 
              style: 'currency', 
              currency: 'VND',
              minimumFractionDigits: 0
            }).format(total)}
          </div>
        );
      },
    },
    {
      id: "participants",
      header: "Participants",
      cell: ({ row }) => {
        let participantCount = 0;
        try {
          const bill = row.original;
          if (bill.description && bill.description.startsWith('{')) {
            const savedData = JSON.parse(bill.description);
            if (savedData.participants) {
              participantCount = savedData.participants.length;
            }
          }
          
          // Fallback to group member count
          if (participantCount === 0 && bill.group) {
            // Estimate based on group - this might not be accurate
            participantCount = 1; // At least the payer
          }
        } catch (error) {
          participantCount = 1;
        }
        
        return <div className="text-center text-sm">{participantCount}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <div className="text-xs text-gray-500">{format(date, "MMM dd, yyyy")}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/bills/${bill.id}`)}
                >
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBill(bill);
                    setIsFormOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-500">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the bill.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(bill.id)} className="bg-red-500 hover:bg-red-600">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <ClientOnly fallback={<div className="space-y-4"><div className="h-12 bg-gray-200 rounded animate-pulse"></div></div>}>
      <div className="w-full space-y-6" suppressHydrationWarning>
        {/* Dashboard Overview */}
        {showDashboard && <BillsDashboard bills={data} />}

        {/* Advanced Search & Filtering - Only show when not in tabbed view */}
        {showAdvancedSearch && (
          <AdvancedSearch
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            groups={groups.map(g => ({ id: g.id, name: g.name }))}
          />
        )}

        {/* Quick Actions & Bulk Operations */}
        {selectedBills.length > 0 && (
          <QuickActions
            selectedBills={selectedBills}
            onSelectionChange={setSelectedBills}
            bills={filteredData.map(bill => ({
              id: bill.id,
              name: bill.title,
              totalAmount: bill.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0,
              status: bill.status as "PENDING" | "PARTIAL" | "SETTLED",
              createdAt: bill.createdAt,
            }))}
            onBulkAction={handleBulkAction}
          />
        )}

        <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="🔍 Search bills..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <div className="text-sm text-gray-500">
            {table.getFilteredRowModel().rows.length} of {data.length} bills
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isFormOpen} onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) setSelectedBill(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBill ? "Edit Bill" : "Add New Bill"}</DialogTitle>
            </DialogHeader>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <BillFormEnhanced
                onSubmit={handleFormSubmit}
                isPending={isPending}
                groups={groups}
                people={people}
                defaultValues={selectedBill ? {
                  ...selectedBill,
                  date: new Date(selectedBill.date),
                } : undefined}
              />
            )}
          </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border" suppressHydrationWarning>
        <Table>
          <TableHeader suppressHydrationWarning>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} suppressHydrationWarning>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
    </ClientOnly>
  );
}
