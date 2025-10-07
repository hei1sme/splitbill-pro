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
import { CalendarIcon, Users, AlertTriangle, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Person } from "@prisma/client/dev";
import * as React from "react";

// Schema for editing existing bills - more restrictive than creation
const BillEditSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().optional(),
  date: z.date(),
  payerId: z.string().min(1, "Payer is required"),
});

export type BillEditValues = z.infer<typeof BillEditSchema>;

interface BillEditFormProps {
  onSubmit: (values: BillEditValues) => void;
  isPending: boolean;
  currentBill: {
    id: string;
    title: string;
    description?: string;
    date: Date;
    payerId: string;
    status: string;
    participants: Array<{
      id: string;
      displayName: string;
      isPayer: boolean;
    }>;
    hasItems: boolean;
    totalAmount: number;
  };
  availablePayers: Array<{
    id: string;
    displayName: string;
  }>;
  onCancel: () => void;
}

export function BillEditForm({ 
  onSubmit, 
  isPending, 
  currentBill, 
  availablePayers,
  onCancel 
}: BillEditFormProps) {
  const [showPayerWarning, setShowPayerWarning] = React.useState(false);
  
  const form = useForm<BillEditValues>({
    resolver: zodResolver(BillEditSchema),
    defaultValues: {
      title: currentBill.title,
      description: currentBill.description || "",
      date: new Date(currentBill.date),
      payerId: currentBill.payerId,
    },
  });

  const selectedPayerId = form.watch("payerId");
  
  // Show warning when payer is changed and bill has items
  React.useEffect(() => {
    if (selectedPayerId !== currentBill.payerId && currentBill.hasItems) {
      setShowPayerWarning(true);
    } else {
      setShowPayerWarning(false);
    }
  }, [selectedPayerId, currentBill.payerId, currentBill.hasItems]);

  const currentPayer = availablePayers.find(p => p.id === currentBill.payerId);
  const newPayer = availablePayers.find(p => p.id === selectedPayerId);

  return (
    <div className="space-y-6">
      {/* Bill Status Info */}
      <Card className="bg-gray-750 border-gray-600">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Current Bill Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status:</span>
            <Badge variant="outline" className="text-white border-gray-500">
              {currentBill.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Participants:</span>
            <span className="text-white">{currentBill.participants.length} people</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Total Amount:</span>
            <span className="text-white font-semibold">
              {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND' 
              }).format(currentBill.totalAmount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Payer Change Warning */}
      {showPayerWarning && (
        <Card className="bg-amber-900/50 border-amber-600">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
              <div className="text-amber-200">
                <strong>Warning:</strong> Changing the payer will affect all payment tracking and QR codes in this bill. 
                <br />
                Current payer: <strong>{currentPayer?.displayName}</strong> → New payer: <strong>{newPayer?.displayName}</strong>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information Section */}
          <Card className="bg-gray-750 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Bill Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter bill title" 
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add bill description..."
                        {...field}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-gray-300">Bill Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal bg-gray-700 border-gray-600 text-white hover:bg-gray-600",
                              !field.value && "text-gray-400"
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
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="bg-gray-800 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Payer Selection Section */}
          <Card className="bg-gray-750 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Payer Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="payerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Who paid for this bill?
                      {currentBill.hasItems && (
                        <span className="text-amber-400 text-sm ml-2">
                          (Changing this will update all payment tracking)
                        </span>
                      )}
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select who paid" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {availablePayers.map((person) => (
                          <SelectItem 
                            key={person.id} 
                            value={person.id}
                            className="text-white hover:bg-gray-700"
                          >
                            <div className="flex items-center gap-2">
                              <span>{person.displayName}</span>
                              {person.id === currentBill.payerId && (
                                <Badge variant="secondary" className="text-xs">
                                  Current Payer
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Restrictions Notice */}
          <Card className="bg-blue-900/30 border-blue-600">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-300">Edit Restrictions</h4>
                  <ul className="text-sm text-blue-200 space-y-1">
                    <li>• Participants cannot be changed in existing bills</li>
                    <li>• Items and splits remain unchanged</li>
                    <li>• Only basic information and payer can be modified</li>
                    <li>• For major changes, consider creating a new bill</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
