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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BankCreateSchema } from "@/lib/validations";
import { Bank } from "../../../node_modules/.prisma/client-dev";
import Image from "next/image";
import { useState } from "react";

interface BankFormProps {
  onSubmit: (values: z.infer<typeof BankCreateSchema>) => void;
  isPending: boolean;
  defaultValues?: Bank;
}

export function BankForm({ onSubmit, isPending, defaultValues }: BankFormProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  const form = useForm<z.infer<typeof BankCreateSchema>>({
    resolver: zodResolver(BankCreateSchema) as any, // Next.js 15 type compatibility
    defaultValues: {
      code: defaultValues?.code || "",
      name: defaultValues?.name || "",
      type: defaultValues?.type || "BANK",
      logoUrl: defaultValues?.logoUrl || "",
    },
  });

  const logoUrl = form.watch("logoUrl");
  
  // Helper function to validate URL
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  // Reset image state when URL changes
  const handleLogoUrlChange = (url: string) => {
    setImageError(false);
    setImageLoading(false);
    return url;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <FormControl>
                <Input placeholder="VCB" {...field} disabled={!!defaultValues} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Vietcombank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BANK">Bank</SelectItem>
                  <SelectItem value="EWALLET">E-Wallet</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/logo.svg" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(handleLogoUrlChange(e.target.value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {logoUrl && logoUrl.trim() !== "" && (
          <div className="flex flex-col items-center space-y-2" suppressHydrationWarning>
            <div className="text-sm text-muted-foreground">Logo Preview:</div>
            {isValidUrl(logoUrl) && !imageError ? (
              <div className="relative">
                {imageLoading && (
                  <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                )}
                <Image
                  src={logoUrl}
                  alt="Logo Preview"
                  width={64}
                  height={64}
                  className={`rounded-md object-contain border ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                  onLoad={() => {
                    setImageLoading(false);
                  }}
                  onLoadStart={() => {
                    setImageLoading(true);
                  }}
                  suppressHydrationWarning
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-md bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                <div className="text-yellow-600 text-xs text-center px-2">
                  {!isValidUrl(logoUrl) ? "⌨️ Type URL..." : "⚠️ Can't load image"}
                </div>
              </div>
            )}
          </div>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
