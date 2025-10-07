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
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                  This action cannot be undone. This will permanently delete the group.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(group.id)} className="bg-red-500 hover:bg-red-600">
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
    <div className="w-full" suppressHydrationWarning>
      <div className="flex items-center justify-between py-4" suppressHydrationWarning>
        <Input
          placeholder="Filter by group name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedGroup(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedGroup ? "Edit Group" : "Add New Group"}</DialogTitle>
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
      <div className="rounded-md border" suppressHydrationWarning>
        <Table suppressHydrationWarning>
          <TableHeader suppressHydrationWarning>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
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
  );
}
