"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillFormSchema } from "@/lib/validations";
import { Group, Person } from "@prisma/client/dev";
import * as React from "react";

export type BillFormValues = z.infer<typeof BillFormSchema>;

interface BillFormProps {
  onSubmit: (values: BillFormValues) => void;
  isPending: boolean;
  groups: (Group & { people: Person[] })[];
  defaultValues?: Partial<BillFormValues>;
}

export function BillForm({ onSubmit, isPending, groups, defaultValues }: BillFormProps) {
  const form = useForm<BillFormValues>({
    resolver: zodResolver(BillFormSchema) as any, // Next.js 15 type compatibility
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      groupId: defaultValues?.groupId || "",
      payerId: defaultValues?.payerId || "",
      status: defaultValues?.status || "DRAFT",
    },
  });

  const selectedGroupId = form.watch("groupId");
  
  const membersOfSelectedGroup = React.useMemo(() => {
    if (!selectedGroupId) return [];
    const group = groups.find(g => g.id === selectedGroupId);
    return group?.people || [];
  }, [selectedGroupId, groups]);

  // Effect to reset payerId if the selected group changes and the current payer is not in the new group
  React.useEffect(() => {
    const currentPayerId = form.getValues("payerId");
    if (currentPayerId) {
        const isPayerInNewGroup = membersOfSelectedGroup.some(p => p.id === currentPayerId);
        if (!isPayerInNewGroup) {
            form.setValue("payerId", "");
        }
    }
  }, [selectedGroupId, membersOfSelectedGroup, form]);

  const handleSubmit = (values: BillFormValues) => {
    console.log("[BILL_FORM] Submitting values:", values);
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Dinner at a fancy restaurant" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A short description of the bill"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="payerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payer</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select who paid" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {membersOfSelectedGroup.map((person) => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
                <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                    <FormControl>
                        <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                        >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date: Date) =>
                        date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <FormMessage />
                </FormItem>
            )}
            />
        <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="SETTLED">Settled</SelectItem>
                </SelectContent>
            </Select>
            <FormMessage />
            </FormItem>
        )}
        />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Bill"}
        </Button>
      </form>
    </Form>
  );
}