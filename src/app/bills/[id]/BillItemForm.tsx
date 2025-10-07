"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BillItem } from "@prisma/client/dev";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { BillItemCreateSchema } from "@/lib/validations";

const formSchema = BillItemCreateSchema;

interface BillItemFormProps {
  billId: string;
  onSave: () => void;
  billItem?: BillItem;
}

export function BillItemForm({
  billId,
  onSave,
  billItem,
}: BillItemFormProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any, // Next.js 15 type compatibility
    defaultValues: {
      description: billItem?.description || "",
      amount: billItem?.amount || 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const url = billItem
      ? `/api/bills/${billId}/items/${billItem.id}`
      : `/api/bills/${billId}/items`;
    const method = billItem ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    onSave();
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Item description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="Amount" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{billItem ? "Save changes" : "Add item"}</Button>
      </form>
    </Form>
  );
}
