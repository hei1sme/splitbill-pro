"use client";

import * as React from "react";
import { Camera, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import Image from "next/image";

interface SnapshotViewProps {
  bill: any;
}

export default function SnapshotView({ bill }: SnapshotViewProps) {
  // Transform the bill data to match the format expected by the modal layout
  const participants = bill.group?.members?.map((member: any) => member.person) || [];
  const payer = bill.payer;
  
  // Transform items to match the modal format
  const items = bill.items?.map((item: any) => ({
    id: item.id,
    name: item.description,
    fee: item.amount,
    type: "NORMAL", // Determine type based on description
    shares: item.splits?.map((split: any) => ({
      participantId: split.personId,
      include: true,
      amount: split.amount,
      paid: false // TODO: Add paid status
    })) || []
  })) || [];

  // Helper functions from the modal
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getParticipantColor = (index: number) => {
    const colors = [
      'bg-purple-500',
      'bg-blue-500', 
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-orange-500'
    ];
    return colors[index % colors.length];
  };

  // Calculate totals like in the modal
  const participantTotals = participants.map((participant: any) => {
    const total = items.reduce((sum: number, item: any) => {
      const share = item.shares.find((s: any) => s.participantId === participant.id);
      return sum + (share?.include ? share.amount : 0);
    }, 0);
    return { participant, total };
  });

  const grandTotal = participantTotals.reduce((sum: any, pt: any) => sum + pt.total, 0);

  // Camera capture function
  const handleCameraCapture = async () => {
    try {
      const element = document.getElementById('snapshot-content');
      if (!element) {
        toast.error("Snapshot content not found");
        return;
      }

      toast.loading("📷 Taking snapshot...");

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });

      canvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            toast.success("📋 Perfect snapshot copied to clipboard!");
          } catch (err) {
            // Fallback: create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${bill.title || 'bill'}-snapshot.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("📋 Snapshot downloaded!");
          }
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast.error("Failed to capture snapshot");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4">
      {/* Fixed Camera Button and Back Button */}
      <div className="fixed top-4 left-4 right-4 z-10 flex justify-between">
        <Link href={`/bills/${bill.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bill
          </Button>
        </Link>
        <Button 
          onClick={handleCameraCapture}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg"
          size="lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          📷 Capture Snapshot
        </Button>
      </div>

      {/* Portrait Bill Frame - EXACT COPY from snapshot preview modal */}
      <div className="max-w-4xl mx-auto pt-16">
        <div id="snapshot-content" className="bg-gradient-to-br from-slate-50 to-purple-50 p-8 min-h-full">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Hero Header Card - EXACT COPY */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
              <div className="text-center">
                <div className="export-safe-title">
                  <h1 className="text-3xl font-bold mb-2 text-purple-600">{bill?.title || 'EXPENSE REPORT'}</h1>
                </div>
                <div className="flex items-center justify-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    📅 {new Date(bill?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    {bill?.status || 'ACTIVE'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Items Overview Card - EXACT COPY */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  📊 Expense Breakdown
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-800">Item</th>
                      <th className="p-4 text-right font-semibold text-gray-800">Price</th>
                      {participants.map((p: any, index: number) => (
                        <th key={p.id} className="p-4 text-center font-semibold">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getParticipantColor(index)}`}>
                              {p.displayName[0]}
                            </div>
                            <span className="text-xs text-gray-600">{p.displayName}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((i: any) => i.type === "NORMAL").map((item: any, itemIndex: number) => (
                      <tr key={item.id} className={itemIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-4 font-medium text-gray-800">{item.name}</td>
                        <td className="p-4 text-right font-semibold text-gray-800">{formatCurrency(item.fee || 0)}</td>
                        {participants.map((p: any, pIndex: number) => {
                          const share = item.shares.find((s: any) => s.participantId === p.id);
                          return (
                            <td key={p.id} className="p-4 text-center">
                              {!share?.include ? (
                                <span className="text-gray-400 text-2xl">–</span>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="font-semibold text-gray-800">
                                    {formatCurrency(share.amount)}
                                  </span>
                                  {share.paid && (
                                    <div className="flex items-center gap-1">
                                      <Check className="h-4 w-4 text-green-600" />
                                      <span className="text-xs text-green-600 font-medium">PAID</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Adjustments Section - EXACT COPY */}
                    {items.filter((i: any) => i.type !== "NORMAL").length > 0 && (
                      <>
                        <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                          <td colSpan={participants.length + 2} className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2 text-yellow-700 font-semibold">
                              <span>⚡</span>
                              <span>ADJUSTMENTS</span>
                            </div>
                          </td>
                        </tr>
                        {items.filter((i: any) => i.type !== "NORMAL").map((item: any) => (
                          <tr key={item.id} className="bg-yellow-25 border-l-4 border-yellow-300">
                            <td colSpan={2} className="p-4 font-medium text-gray-800">
                              <div className="flex items-center gap-2">
                                <span className="text-orange-500">
                                  {item.name.includes('Previous') ? '🔄' : item.name.includes('Discount') ? '💸' : '⚡'}
                                </span>
                                <span>{item.name}</span>
                              </div>
                            </td>
                            {participants.map((p: any) => {
                              const share = item.shares.find((s: any) => s.participantId === p.id);
                              return (
                                <td key={p.id} className="p-4 text-center">
                                  {!share?.include ? (
                                    <span className="text-gray-400 text-2xl">–</span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <span className={`font-semibold ${share.amount < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                        {formatCurrency(share.amount)}
                                      </span>
                                      {share.paid && (
                                        <div className="flex items-center gap-1">
                                          <Check className="h-4 w-4 text-green-600" />
                                          <span className="text-xs text-green-600 font-medium">PAID</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </>
                    )}
                    
                    {/* Total Row - EXACT COPY */}
                    <tr className="bg-gradient-to-r from-purple-100 to-indigo-100 border-t-2 border-purple-200">
                      <td className="p-4 font-bold text-purple-800">TOTAL</td>
                      <td className="p-4 text-right font-bold text-purple-800 text-lg">
                        {formatCurrency(grandTotal)}
                      </td>
                      {participants.map((p: any, pIndex: number) => {
                        const total = participantTotals.find((t: any) => t.participant.id === p.id)?.total || 0;
                        return (
                          <td key={p.id} className="p-4 text-center">
                            <div className={`rounded-lg p-2 text-white font-bold ${getParticipantColor(pIndex)}`}>
                              {formatCurrency(total)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section: Summary (Left) + Payment Information (Right) - EXACT COPY */}
            <div className="grid grid-cols-2 gap-6">
              {/* Summary Statistics Card - LEFT SIDE */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-6">
                <div className="export-safe-title">
                  <h3 className="text-xl font-bold mb-4 text-left text-purple-600">
                    <span className="inline-flex items-center gap-2">
                      <span>📈</span>
                      <span>Summary</span>
                    </span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{items.filter((i: any) => i.type === "NORMAL").length}</div>
                    <div className="text-sm text-gray-600">Items</div>
                    {items.filter((i: any) => i.type !== "NORMAL").length > 0 && (
                      <div className="text-xs text-yellow-600 mt-1">
                        +{items.filter((i: any) => i.type !== "NORMAL").length} adjustments
                      </div>
                    )}
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600">{participants.length}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <div className="text-2xl font-bold text-pink-600">{formatCurrency(grandTotal)}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                </div>
              </div>

              {/* Payer Information Card - RIGHT SIDE */}
              {payer && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-yellow-300 p-6 relative overflow-hidden">
                  {/* Header Row: Payment Information (Left) + PAYER Badge (Right) */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="export-safe-title">
                      <h3 className="text-xl font-bold text-yellow-700">
                        <span className="inline-flex items-center gap-2">
                          <span>💳</span>
                          <span>Payment Information</span>
                        </span>
                      </h3>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      👑 PAYER
                    </div>
                  </div>
                  
                  {/* 1-Column Content Layout */}
                  <div className="space-y-4">
                    {/* 1. Bank Name and Logo */}
                    {payer.bank?.name && (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 text-gray-700 font-medium">
                          {payer.bank?.logoUrl && (
                            <Image 
                              src={payer.bank.logoUrl} 
                              alt={`${payer.bank.name} logo`}
                              width={32} 
                              height={32} 
                              className="rounded"
                            />
                          )}
                          <span className="font-bold text-lg text-gray-800">{payer.bank.name}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 2. QR Code */}
                    {payer.qrUrl && (
                      <div className="text-center">
                        <Image 
                          src={payer.qrUrl} 
                          alt="Payment QR Code" 
                          width={120} 
                          height={120} 
                          className="rounded-lg mx-auto"
                        />
                        <p className="text-xs text-gray-600 mt-2 text-center font-medium">Scan to Pay</p>
                      </div>
                    )}
                    
                    {/* 3. Account Holder */}
                    <div className="text-center">
                      <div className="font-bold text-gray-900 text-lg bg-yellow-100 px-3 py-2 rounded-lg inline-block">
                        {payer.accountHolder || payer.displayName}
                      </div>
                    </div>
                    
                    {/* 4. Account Number */}
                    {payer.accountNumber && (
                      <div className="text-center">
                        <div className="text-gray-700 font-medium text-lg">
                          {payer.accountNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm">
              Generated by SplitBill Pro • {new Date().toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
