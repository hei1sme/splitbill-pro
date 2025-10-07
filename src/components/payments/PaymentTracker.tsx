"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  User,
  DollarSign,
  Camera,
  MessageSquare,
  Calendar,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface PaymentConfirmation {
  id: string;
  splitId: string;
  paidBy: string;
  amount: number;
  paidAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
  notes?: string;
  receiptUrl?: string;
  status: "pending" | "confirmed" | "disputed";
}

interface PaymentSplit {
  id: string;
  personId: string;
  personName: string;
  amount: number;
  paid: boolean;
  paidAt?: Date;
  confirmation?: PaymentConfirmation;
}

interface PaymentTrackerProps {
  billId: string;
  splits: PaymentSplit[];
  onPaymentUpdate: (splitId: string, status: "paid" | "unpaid", notes?: string, receiptFile?: File) => void;
  onConfirmPayment: (splitId: string, confirmed: boolean, notes?: string) => void;
  currentUserId?: string;
}

export function PaymentTracker({
  billId,
  splits,
  onPaymentUpdate,
  onConfirmPayment,
  currentUserId = "current-user",
}: PaymentTrackerProps) {
  const [selectedSplit, setSelectedSplit] = useState<PaymentSplit | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const totalAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const paidAmount = splits.reduce((sum, split) => sum + (split.paid ? split.amount : 0), 0);
  const paidCount = splits.filter(split => split.paid).length;

  const handleMarkAsPaid = () => {
    if (!selectedSplit) return;
    
    onPaymentUpdate(selectedSplit.id, "paid", notes, receiptFile || undefined);
    setPaymentDialog(false);
    setNotes("");
    setReceiptFile(null);
    toast.success(`Payment marked for ${selectedSplit.personName}`);
  };

  const handleConfirmPayment = (confirmed: boolean) => {
    if (!selectedSplit) return;
    
    onConfirmPayment(selectedSplit.id, confirmed, notes);
    setConfirmationDialog(false);
    setNotes("");
    toast.success(confirmed ? "Payment confirmed" : "Payment disputed");
  };

  const getStatusBadge = (split: PaymentSplit) => {
    if (!split.paid) {
      return <Badge variant="destructive">Unpaid</Badge>;
    }
    
    if (split.confirmation) {
      switch (split.confirmation.status) {
        case "confirmed":
          return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
        case "disputed":
          return <Badge variant="destructive">Disputed</Badge>;
        default:
          return <Badge variant="secondary">Pending Confirmation</Badge>;
      }
    }
    
    return <Badge variant="secondary">Paid - Pending Confirmation</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Paid</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalAmount - paidAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {paidCount}/{splits.length}
              </div>
              <div className="text-sm text-muted-foreground">People Paid</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Payment Progress</span>
              <span>{Math.round((paidAmount / totalAmount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Individual Payment Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {splits.map((split) => (
              <div
                key={split.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{split.personName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(split.amount)}
                    </div>
                    {split.paidAt && (
                      <div className="text-xs text-muted-foreground">
                        Paid {format(split.paidAt, "MMM d, h:mm a")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getStatusBadge(split)}
                  
                  {!split.paid ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSplit(split);
                        setPaymentDialog(true);
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Paid
                    </Button>
                  ) : split.confirmation?.status === "pending" ? (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSplit(split);
                          setConfirmationDialog(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    </div>
                  ) : null}
                  
                  {split.confirmation?.receiptUrl && (
                    <Button variant="ghost" size="sm">
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mark as Paid Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Payment as Paid</DialogTitle>
            <DialogDescription>
              Confirm that {selectedSplit?.personName} has paid {formatCurrency(selectedSplit?.amount || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Upload Receipt (optional)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>
              <Check className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={confirmationDialog} onOpenChange={setConfirmationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Did {selectedSplit?.personName} actually pay {formatCurrency(selectedSplit?.amount || 0)}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="Add any notes about this confirmation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => handleConfirmPayment(false)}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Dispute
            </Button>
            <Button onClick={() => handleConfirmPayment(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
