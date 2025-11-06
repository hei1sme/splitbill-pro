"use client";

import * as React from "react";
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
import { Group, Person } from "../../../node_modules/.prisma/client-dev";
import { GroupForm } from "./GroupForm";
import { z } from "zod";
import { GroupCreateSchema } from "@/lib/validations";
import { toast } from "sonner";
import { HydrationSafe, SearchContainer } from "@/components/ui/hydration-safe";
import { ClientOnly } from "@/components/ui/client-only";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GroupWithMembers = Group & { members: { person: Person }[] };

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

export function GroupsDataTable() {
  const [data, setData] = React.useState<GroupWithMembers[]>([]);
  const [people, setPeople] = React.useState<Person[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<GroupWithMembers | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [groupsRes, peopleRes] = await Promise.all([
        fetch("/api/groups"),
        fetch("/api/people?active=true"),
      ]);
      const [groupsData, peopleData] = await Promise.all([
        groupsRes.json(),
        peopleRes.json(),
      ]);
      setData(groupsData);
      setPeople(peopleData.data || peopleData); // Handle both response formats
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

  const handleFormSubmit = async (values: z.infer<typeof GroupCreateSchema>) => {
    setIsPending(true);
    const method = selectedGroup ? "PUT" : "POST";
    const url = selectedGroup ? `/api/groups/${selectedGroup.id}` : "/api/groups";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }

      toast.success(`Group ${selectedGroup ? "updated" : "created"} successfully.`);
      setIsFormOpen(false);
      setSelectedGroup(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPending(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/groups/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete group.");
      toast.success("Group deleted successfully.");
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<GroupWithMembers>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Group Name
          </Button>
        )
      },
    },
    {
        accessorKey: "members",
        header: "Members",
        cell: ({ row }) => {
            const members = row.original.members;
            return (
                <div className="flex -space-x-2">
                    {members.slice(0, 5).map(({ person }) => (
                        <Avatar key={person.id} className="h-8 w-8 border-2 border-background">
                            <AvatarImage 
                                src={`https://avatar.vercel.sh/${person.displayName}.png`} 
                                alt={person.displayName}
                                suppressHydrationWarning 
                            />
                            <AvatarFallback>{getInitials(person.displayName)}</AvatarFallback>
                        </Avatar>
                    ))}
                    {members.length > 5 && (
                        <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback>+{members.length - 5}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
            )
        }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const group = row.original;
      return (
        <AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-slate-200 hover:text-white">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 border-white/10 bg-slate-950/95 backdrop-blur-xl">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedGroup(group);
                  setIsFormOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-rose-400 focus:text-rose-400">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialogContent className="max-w-sm border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove group</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300/80">
                This action cannot be undone. All participants will lose quick
                access to this roster.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full border border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(group.id)}
                className="rounded-full bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white hover:brightness-110"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
      },
    },
  ];

  const table = useReactTable({
    data,
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
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-wrap items-center justify-between gap-4" suppressHydrationWarning>
        <Input
          placeholder="Filter by group name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus-visible:ring-0"
        />
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedGroup(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/15"
              data-group-action="open"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>
                {selectedGroup ? "Edit Group" : "Add New Group"}
              </DialogTitle>
            </DialogHeader>
            <GroupForm
              onSubmit={handleFormSubmit}
              isPending={isPending}
              people={people}
              defaultValues={selectedGroup || undefined}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
        suppressHydrationWarning
      >
        <Table suppressHydrationWarning>
          <TableHeader className="bg-white/5 text-xs uppercase tracking-[0.35em] text-slate-300/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-4">
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
                  {isLoading ? "Loading..." : "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15 disabled:opacity-40"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="rounded-full border-white/20 bg-white/10 text-white hover:border-white/35 hover:bg-white/15 disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
