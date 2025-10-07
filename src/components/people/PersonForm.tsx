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
import { Switch } from "@/components/ui/switch";
import { PersonCreateSchema } from "@/lib/validations";
import { Bank } from "../../../node_modules/.prisma/client-dev";
import { useState } from "react";
import { toast } from "sonner";

interface PersonFormProps {
  onSubmit: (values: z.infer<typeof PersonCreateSchema>) => void;
  isPending: boolean;
  banks: Bank[];
  defaultValues?: Partial<z.infer<typeof PersonCreateSchema>>;
}

export function PersonForm({ onSubmit, isPending, banks, defaultValues }: PersonFormProps) {
  type FormValues = z.infer<typeof PersonCreateSchema>;
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(PersonCreateSchema) as any, // Next.js 15 type compatibility
    defaultValues: {
      displayName: defaultValues?.displayName || "",
      bankCode: defaultValues?.bankCode || undefined,
      accountNumber: defaultValues?.accountNumber || undefined,
      accountHolder: defaultValues?.accountHolder || undefined,
      qrUrl: defaultValues?.qrUrl || undefined,
      active: defaultValues?.active ?? true,
    },
  });

  const handleQrUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'qr');

      console.log('Uploading file to /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload result:', result);
      
      // Update form with the permanent URL - API returns { success: true, data: { url: ... } }
      const uploadedUrl = result.data?.url;
      console.log('Setting qrUrl to:', uploadedUrl);
      
      if (uploadedUrl) {
        form.setValue('qrUrl', uploadedUrl, { shouldValidate: true, shouldDirty: true });
        
        // Get the current form values to verify the update
        console.log('Current form values after setValue:', form.getValues());
      } else {
        throw new Error('No URL returned from upload');
      }
      
      toast.success("QR code uploaded successfully!");
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload QR code");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a bank (for QR payments)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
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
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="1234567890" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountHolder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="NGUYEN VAN A" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qrUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>QR Code Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex items-center justify-center w-full">
                    <label 
                      htmlFor="qr-upload" 
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/10 hover:bg-muted/20 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                          <>
                            <div className="w-8 h-8 mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                          </>
                        ) : (
                          <>
                            <svg className="w-8 h-8 mb-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> QR code image
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, JPEG (MAX 5MB)</p>
                          </>
                        )}
                      </div>
                      <input 
                        id="qr-upload"
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleQrUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {field.value && (
                    <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-lg">
                      <img 
                        src={field.value} 
                        alt="QR Code Preview" 
                        className="w-16 h-16 object-cover rounded border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">QR Code Uploaded</p>
                        <p className="text-xs text-muted-foreground">Ready for payment sharing</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => field.onChange('')}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
