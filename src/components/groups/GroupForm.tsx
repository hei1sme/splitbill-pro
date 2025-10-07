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
import { GroupCreateSchema } from "@/lib/validations";
import { Group, Person } from "../../../node_modules/.prisma/client-dev";
import { MultiSelect } from "./MultiSelect";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type GroupFormValues = z.infer<typeof GroupCreateSchema>;

type GroupWithMembers = Group & { members: { person: Person }[] };

interface GroupFormProps {
  onSubmit: (values: GroupFormValues) => void;
  isPending: boolean;
  people: Person[];
  defaultValues?: GroupWithMembers;
}

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

export function GroupForm({ onSubmit, isPending, people, defaultValues }: GroupFormProps) {
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(GroupCreateSchema) as any, // Next.js 15 type compatibility
    defaultValues: {
      name: defaultValues?.name || "",
      personIds: defaultValues?.members.map((m: { person: Person }) => m.person.id) || [],
    },
  });

  const selectedPersonIds = form.watch("personIds") || [];
  const selectedPeople = Array.isArray(people) ? people.filter(p => selectedPersonIds.includes(p.id)) : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Regular Dinner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Members</FormLabel>
              <MultiSelect
                options={Array.isArray(people) ? people : []}
                selected={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
            <FormLabel>Selected Members</FormLabel>
            <div className="flex flex-wrap gap-2">
                {selectedPeople.map(person => (
                    <Badge key={person.id} variant="secondary" className="p-2">
                        <Avatar className="h-5 w-5 mr-2">
                            <AvatarImage src={`https://avatar.vercel.sh/${person.displayName}.png`} alt={person.displayName} />
                            <AvatarFallback>{getInitials(person.displayName)}</AvatarFallback>
                        </Avatar>
                        {person.displayName}
                    </Badge>
                ))}
            </div>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
