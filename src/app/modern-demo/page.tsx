"use client";

import * as React from "react";
import { Check, CheckCircle, Clock, Wallet, User, Receipt, Plus, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Enhanced types reflecting real-world usage
interface Participant {
  id: string;
  displayName: string;
  isPayer: boolean;
  isCompleted: boolean; // Overall completion status (checkbox next to name)
  avatar?: string;
  bankInfo?: {
    code: string;
    name: string;
    accountNumber: string;
    qrUrl?: string;
  };
}

interface ItemShare {
  participantId: string;
  wantsToBuy: boolean;      // Whether person wants this item
  hasPaid: boolean;         // "Đã Thanh Toán" status for this specific item
  amount: number;           // How much they owe/paid for this item
  paymentDate?: Date;       // When they paid (if paid)
}

interface BillItem {
  id: string;
  name: string;
  totalCost: number;
  category?: string;
  type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
  shares: ItemShare[];
}

// Modern Card-Based Layout inspired by your sheet but more intuitive
export default function ModernBillSplitting() {
  // Mock data based on your sheet
  const participants: Participant[] = [
    {
      id: "gia-hung",
      displayName: "Gia Hưng", 
      isPayer: false,
      isCompleted: false,
      bankInfo: { code: "VCB", name: "Vietcombank", accountNumber: "123456789" }
    },
    {
      id: "huynh-giao",
      displayName: "Huynh Giao",
      isPayer: false, 
      isCompleted: true, // ✅ Marked as done
      bankInfo: { code: "MOMO", name: "MoMo", accountNumber: "987654321" }
    },
    {
      id: "cong-phuc", 
      displayName: "Công Phúc",
      isPayer: false,
      isCompleted: false,
      bankInfo: { code: "TCB", name: "Techcombank", accountNumber: "456789123" }
    },
    {
      id: "quoc-khai",
      displayName: "Quốc Khải",
      isPayer: true,
      isCompleted: true,
      bankInfo: { 
        code: "MOMO", 
        name: "MoMo", 
        accountNumber: "909123",
        qrUrl: "/mock-qr.png"
      }
    }
  ];

  const items: BillItem[] = [
    {
      id: "udon",
      name: "Udon Thịt Heo",
      totalCost: 39200,
      type: "NORMAL",
      shares: [
        { participantId: "gia-hung", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "huynh-giao", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "cong-phuc", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "quoc-khai", wantsToBuy: true, hasPaid: true, amount: 39200 },
      ]
    },
    {
      id: "ga-rut-xuong",
      name: "Gà Rút Xương", 
      totalCost: 49000,
      type: "NORMAL",
      shares: [
        { participantId: "gia-hung", wantsToBuy: true, hasPaid: false, amount: 12250 },
        { participantId: "huynh-giao", wantsToBuy: true, hasPaid: true, amount: 12250 },
        { participantId: "cong-phuc", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "quoc-khai", wantsToBuy: true, hasPaid: true, amount: 12250 },
      ]
    },
    {
      id: "mi-xao-chay",
      name: "Mì Xào Chay",
      totalCost: 12480,
      type: "NORMAL", 
      shares: [
        { participantId: "gia-hung", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "huynh-giao", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "cong-phuc", wantsToBuy: true, hasPaid: false, amount: 12480 },
        { participantId: "quoc-khai", wantsToBuy: false, hasPaid: false, amount: 0 },
      ]
    },
    {
      id: "carry-over",
      name: "Nợ kỳ trước",
      totalCost: 0,
      type: "CARRY_OVER",
      shares: [
        { participantId: "gia-hung", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "huynh-giao", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "cong-phuc", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "quoc-khai", wantsToBuy: false, hasPaid: false, amount: 0 },
      ]
    },
    {
      id: "discount",
      name: "Discount",
      totalCost: -6500,
      type: "SPECIAL",
      shares: [
        { participantId: "gia-hung", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "huynh-giao", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "cong-phuc", wantsToBuy: false, hasPaid: false, amount: 0 },
        { participantId: "quoc-khai", wantsToBuy: true, hasPaid: true, amount: -6500 },
      ]
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getParticipantTotal = (participantId: string) => {
    return items.reduce((total, item) => {
      const share = item.shares.find(s => s.participantId === participantId);
      return total + (share?.amount || 0);
    }, 0);
  };

  const getPaymentStatus = (share: ItemShare) => {
    if (!share.wantsToBuy) return "not-wanted";
    if (share.hasPaid) return "paid";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-orange-500" />;
      default: return null;
    }
  };

  const payer = participants.find(p => p.isPayer)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Modern Bill Splitting Interface
          </h1>
          <p className="text-gray-600">
            Improved UX while maintaining your Google Sheet's flexibility
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Participants Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Participants ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {participants.map(participant => (
                    <div key={participant.id} className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border",
                      participant.isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200",
                      participant.isPayer && "ring-2 ring-blue-400"
                    )}>
                      <Checkbox 
                        checked={participant.isCompleted}
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">
                          {participant.displayName}
                        </div>
                        {participant.isPayer && (
                          <Badge variant="secondary" className="text-xs mt-1">PAYER</Badge>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatCurrency(getParticipantTotal(participant.id))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Items - Modern Card Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Items & Payments
                  </div>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Normal Items */}
                {items.filter(item => item.type === "NORMAL").map(item => (
                  <div key={item.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{formatCurrency(item.totalCost)}</p>
                      </div>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    
                    {/* Participant Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {participants.map(participant => {
                        const share = item.shares.find(s => s.participantId === participant.id)!;
                        const status = getPaymentStatus(share);
                        
                        return (
                          <div key={participant.id} className={cn(
                            "p-2 rounded border text-center text-sm",
                            status === "paid" && "bg-green-50 border-green-200",
                            status === "pending" && "bg-orange-50 border-orange-200", 
                            status === "not-wanted" && "bg-gray-50 border-gray-200"
                          )}>
                            <div className="font-medium text-xs mb-1">
                              {participant.displayName}
                            </div>
                            
                            {!share.wantsToBuy ? (
                              <span className="text-gray-400 text-lg">–</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center justify-center gap-1">
                                  {getStatusIcon(status)}
                                  <span className="text-xs">
                                    {formatCurrency(share.amount)}
                                  </span>
                                </div>
                                {share.hasPaid && (
                                  <Badge variant="secondary" className="text-xs">
                                    Đã Thanh Toán
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Adjustment Items */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Adjustments
                  </h5>
                  
                  {items.filter(item => item.type !== "NORMAL").map(item => (
                    <div key={item.id} className="border rounded-lg p-3 bg-yellow-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type === "CARRY_OVER" ? "Carry-over" : "Special"}
                          </Badge>
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          {formatCurrency(item.totalCost)}
                        </span>
                      </div>
                      
                      {/* Simple adjustment display */}
                      <div className="text-xs text-gray-600">
                        {item.shares.filter(s => s.amount !== 0).map(share => {
                          const participant = participants.find(p => p.id === share.participantId)!;
                          return (
                            <span key={share.participantId} className="mr-3">
                              {participant.displayName}: {formatCurrency(share.amount)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payer Sidebar - Enhanced */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              
              {/* Payer Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Wallet className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{payer.displayName}</CardTitle>
                  <Badge className="bg-blue-600 text-white w-fit mx-auto">PAYER</Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  
                  {/* Bank Info */}
                  {payer.bankInfo && (
                    <div className="p-3 bg-white rounded-lg border">
                      <div className="font-medium text-sm">{payer.bankInfo.name}</div>
                      <div className="text-gray-600 text-sm">{payer.bankInfo.accountNumber}</div>
                    </div>
                  )}
                  
                  {/* QR Code */}
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <div className="text-gray-400 text-xs text-center">
                        QR Code<br/>Placeholder
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Scan to pay your share</p>
                  </div>

                  {/* Payer Total */}
                  <div className="p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Payer Paid</div>
                    <div className="font-bold text-lg text-blue-600">
                      {formatCurrency(getParticipantTotal(payer.id))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Bill:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        items.filter(i => i.type === "NORMAL").reduce((sum, i) => sum + i.totalCost, 0)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adjustments:</span>
                    <span className="font-medium">
                      {formatCurrency(
                        items.filter(i => i.type !== "NORMAL").reduce((sum, i) => sum + i.totalCost, 0)
                      )}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Final Total:</span>
                    <span>
                      {formatCurrency(
                        items.reduce((sum, i) => sum + i.totalCost, 0)
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Improvements Note */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2">🚀 UX Improvements Over Traditional Spreadsheet:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Visual Status</strong>: Color-coded cards instead of cell formatting</li>
              <li>• <strong>Clear Payment States</strong>: Icons and badges for "Đã Thanh Toán"</li>
              <li>• <strong>Responsive Layout</strong>: Works on mobile unlike spreadsheets</li>
              <li>• <strong>Participant Overview</strong>: Quick completion status at a glance</li>
              <li>• <strong>Enhanced Payer Section</strong>: Dedicated sidebar with QR and totals</li>
              <li>• <strong>Real-time Calculations</strong>: Automatic updates without manual formulas</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
