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
  // Parse saved data from description field (like BillDetailsEnhanced does)
  let savedData: any = null;
  try {
    if (bill?.description && bill.description.startsWith('{')) {
      savedData = JSON.parse(bill.description);
    }
  } catch (error) {
    console.log('No saved data found in description');
  }

  // Get participants and items from saved data or fallback to database
  const participants = savedData?.participants || bill.group?.members?.map((member: any) => member.person) || [];
  const payer = bill.payer;
  
  // Get items from saved data (primary source) or fallback to bill.items
  const rawItems = savedData?.items || bill.items || [];
  
  // Helper function to determine item type
  const getItemType = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('previous') || desc.includes('debt') || desc.includes('carry')) {
      return 'PREVIOUS';
    }
    if (desc.includes('discount') || desc.includes('giảm') || desc.includes('giá')) {
      return 'DISCOUNT';
    }
    if (desc.includes('adjustment') || desc.includes('điều chỉnh')) {
      return 'ADJUSTMENT';
    }
    return 'NORMAL';
  };
  
  // Transform items to match the modal format
  const items = rawItems.map((item: any) => ({
    id: item.id,
    name: item.name || item.description,
    fee: item.fee || item.amount,
    type: item.type || getItemType(item.name || item.description || ''),
    shares: item.shares || participants.map((p: any) => ({
      participantId: p.id,
      include: true,
      amount: 0,
      paid: false
    }))
  }));

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
      return sum + (share?.include && share?.amount > 0 ? share.amount : 0);
    }, 0);
    return { participant, total };
  });

  // Calculate grand total from participant totals (this accounts for actual splits and adjustments)
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
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // Add export-safe styles for better rendering
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Fix gradient text title - convert to solid color for reliable rendering */
            h1.text-purple-600 {
              background: none !important;
              color: #7c3aed !important;
              -webkit-text-fill-color: #7c3aed !important;
              background-clip: unset !important;
              -webkit-background-clip: unset !important;
              font-weight: 700 !important;
              text-align: center !important;
            }
            
            /* Fix gradient backgrounds - use solid colors for better capture */
            .bg-gradient-to-r.from-purple-600.to-indigo-600 {
              background: #7c3aed !important;
              background-image: none !important;
            }
            
            .bg-gradient-to-r.from-yellow-500.to-orange-500 {
              background: #f59e0b !important;
              background-image: none !important;
            }
            
            .bg-gradient-to-r.from-purple-100.to-indigo-100 {
              background: #e9d5ff !important;
              background-image: none !important;
            }
            
            .bg-gradient-to-r.from-purple-500.to-indigo-500 {
              background: #8b5cf6 !important;
              background-image: none !important;
            }
            
            .bg-gradient-to-br.from-yellow-50.to-orange-50 {
              background: #fefce8 !important;
              background-image: none !important;
            }
            
            .bg-gradient-to-br.from-slate-50.to-purple-50 {
              background: #f8fafc !important;
              background-image: none !important;
            }
            
            /* Fix backdrop blur - convert to solid backgrounds */
            .backdrop-blur-sm {
              backdrop-filter: none !important;
              background-color: rgba(255, 255, 255, 0.95) !important;
            }
            
            /* Fix card headers - ensure visibility */
            h2.text-white, h3.text-yellow-700, h3.text-purple-600 {
              font-weight: 700 !important;
              opacity: 1 !important;
            }
            
            /* Fix badge positioning and text alignment */
            .fixed {
              position: absolute !important;
            }
            
            /* Fix vertical text alignment for badges */
            .bg-blue-500, .bg-orange-500 {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 1 !important;
            }
            
            /* Fix avatar text centering */
            .w-8.h-8, .w-10.h-10 {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 1 !important;
            }
            
            /* Fix participant total button text alignment */
            .bg-purple-500, .bg-blue-500, .bg-pink-500, .bg-green-500 {
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              line-height: 1 !important;
            }
            
            /* Ensure all flex containers maintain centering */
            .flex {
              display: flex !important;
            }
            
            .items-center {
              align-items: center !important;
            }
            
            .justify-center {
              justify-content: center !important;
            }
            
            /* Fix text baseline alignment */
            .text-xs, .text-sm, .text-base, .text-lg, .text-xl {
              line-height: 1.2 !important;
              vertical-align: middle !important;
            }
            
            /* Ensure icons are visible */
            svg {
              opacity: 1 !important;
              fill: currentColor !important;
            }
            
            /* Fix text rendering */
            * {
              -webkit-font-smoothing: antialiased !important;
              -moz-osx-font-smoothing: grayscale !important;
              text-rendering: optimizeLegibility !important;
            }
            
            /* Fix specific text colors for better contrast */
            .text-white {
              color: #ffffff !important;
            }
            
            .text-yellow-700 {
              color: #a16207 !important;
            }
            
            .text-purple-600 {
              color: #7c3aed !important;
            }
            
            /* Ensure proper spacing and layout */
            .space-y-6 > * + * {
              margin-top: 1.5rem !important;
            }
            
            .space-y-4 > * + * {
              margin-top: 1rem !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8">
      {/* Fixed Camera Button and Back Button */}
      <div className="fixed top-6 left-6 right-6 z-10 flex justify-between">
        <Link href={`/bills/${bill.id}`}>
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-full border-white/20 bg-white/10 text-white backdrop-blur-xl hover:border-white/30 hover:bg-white/15 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bill
          </Button>
        </Link>
        <Button 
          onClick={handleCameraCapture}
          className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-xl hover:from-purple-600 hover:to-indigo-600"
          size="lg"
        >
          <Camera className="h-5 w-5 mr-2" />
          Capture Snapshot
        </Button>
      </div>

      {/* Portrait Bill Frame - Updated Modern Design */}
      <div className="w-full mx-auto">
        <div id="snapshot-content" className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200/50 overflow-hidden">
          <div className="p-6 space-y-6">
            
            {/* Hero Header Card */}
            <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50 rounded-3xl shadow-lg border-2 border-purple-200/50 p-8">
              <div className="text-center">
                <div className="export-safe-title">
                  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{bill?.title || 'EXPENSE REPORT'}</h1>
                </div>
                <div className="flex items-center justify-center gap-6 text-gray-600 mt-4">
                  <span className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium shadow-sm">
                    📅 {new Date(bill?.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                  </span>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 text-sm font-semibold shadow-md">
                    {bill?.status || 'OPEN'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Main Content Grid: Expense Table (Left) + Payment Info (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Expense Breakdown - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 p-5">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">📊</span>
                      Expense Breakdown
                    </h2>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-indigo-50">
                    <tr>
                      <th className="p-4 text-left font-bold text-gray-800 border-b-2 border-purple-200">Item</th>
                      <th className="p-4 text-right font-bold text-gray-800 border-b-2 border-purple-200">Price</th>
                      {participants.map((p: any, index: number) => {
                        const strongChipColors = [
                          'bg-purple-600', 'bg-indigo-600', 'bg-pink-600', 'bg-blue-600', 
                          'bg-violet-600', 'bg-fuchsia-600', 'bg-cyan-600', 'bg-teal-600',
                          'bg-emerald-600', 'bg-green-600', 'bg-amber-600', 'bg-orange-600'
                        ];
                        const chipClass = strongChipColors[index % strongChipColors.length];
                        return (
                          <th key={p.id} className="p-3 text-center border-b-2 border-purple-200">
                            <div className={`${chipClass} rounded-xl px-3 py-2 mx-1 shadow-sm`}>
                              <span className="font-bold text-white text-sm">
                                {p.displayName}
                              </span>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {items.filter((i: any) => i.type === "NORMAL").map((item: any, itemIndex: number) => (
                      <tr key={item.id} className={`border-b border-purple-100/50 transition-colors hover:bg-purple-50/30 ${itemIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                        <td className="p-4 font-semibold text-gray-800">{item.name}</td>
                        <td className="p-4 text-right font-bold text-gray-900">{formatCurrency(item.fee || 0)}</td>
                        {participants.map((p: any, pIndex: number) => {
                          const share = item.shares.find((s: any) => s.participantId === p.id);
                          const lightBackgroundColors = [
                            'bg-purple-50', 'bg-indigo-50', 'bg-pink-50', 'bg-blue-50', 
                            'bg-violet-50', 'bg-fuchsia-50', 'bg-cyan-50', 'bg-teal-50',
                            'bg-emerald-50', 'bg-green-50', 'bg-amber-50', 'bg-orange-50'
                          ];
                          const lightBgClass = lightBackgroundColors[pIndex % lightBackgroundColors.length];
                          return (
                            <td key={p.id} className={`p-3 text-center border-l border-purple-100/30 ${lightBgClass}`}>
                              {!share?.include ? (
                                <span className="text-gray-300 text-2xl">–</span>
                              ) : (
                                <div className="flex flex-col items-center gap-1.5">
                                  <span className="font-bold text-gray-900">
                                    {formatCurrency(share.amount)}
                                  </span>
                                  {share.paid && (
                                    <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                                      <Check className="h-3 w-3 text-emerald-600" />
                                      <span className="text-xs text-emerald-700 font-bold">PAID</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Adjustments Section */}
                    {items.filter((i: any) => i.type !== "NORMAL").length > 0 && (
                      <>
                        <tr className="bg-gradient-to-r from-amber-50 to-yellow-50 border-t-2 border-amber-300">
                          <td colSpan={participants.length + 2} className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20">
                                <span className="text-lg">⚡</span>
                              </div>
                              <span className="text-amber-800 font-bold text-base uppercase tracking-wider">Adjustments</span>
                            </div>
                          </td>
                        </tr>
                        {items.filter((i: any) => i.type !== "NORMAL").map((item: any) => (
                          <tr key={item.id} className="bg-amber-50/40 border-l-4 border-amber-400 hover:bg-amber-50/60 transition-colors">
                            <td colSpan={2} className="p-4 font-semibold text-gray-800">
                              <div className="flex items-center gap-3">
                                <span className="text-xl">
                                  {item.name.includes('Previous') ? '🔄' : item.name.includes('Discount') ? '💸' : '⚡'}
                                </span>
                                <span>{item.name}</span>
                              </div>
                            </td>
                            {participants.map((p: any, pIndex: number) => {
                              const share = item.shares.find((s: any) => s.participantId === p.id);
                              const lightBackgroundColors = [
                                'bg-purple-50', 'bg-indigo-50', 'bg-pink-50', 'bg-blue-50', 
                                'bg-violet-50', 'bg-fuchsia-50', 'bg-cyan-50', 'bg-teal-50',
                                'bg-emerald-50', 'bg-green-50', 'bg-amber-50', 'bg-orange-50'
                              ];
                              const lightBgClass = lightBackgroundColors[pIndex % lightBackgroundColors.length];
                              return (
                                <td key={p.id} className={`p-3 text-center border-l border-purple-100/30 ${lightBgClass}`}>
                                  {!share?.include || (share.amount === 0 && (item.type !== "NORMAL")) ? (
                                    <span className="text-gray-300 text-2xl">–</span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1.5">
                                      <span className={`font-bold ${share.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {formatCurrency(share.amount)}
                                      </span>
                                      {share.paid && (
                                        <div className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5">
                                          <Check className="h-3 w-3 text-emerald-600" />
                                          <span className="text-xs text-emerald-700 font-bold">PAID</span>
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
                    
                    <tr className="bg-gradient-to-r from-purple-100 via-indigo-100 to-purple-100 border-t-4 border-purple-300">
                      <td className="p-4 font-black text-purple-900 uppercase tracking-wider text-base">Total</td>
                      <td className="p-4 text-right font-black text-purple-900 text-lg">
                        {formatCurrency(grandTotal)}
                      </td>
                      {participants.map((p: any, pIndex: number) => {
                        const total = participantTotals.find((t: any) => t.participant.id === p.id)?.total || 0;
                        return (
                          <td key={p.id} className="p-3 text-center border-l border-purple-200">
                            <div className={`rounded-xl p-2.5 text-white font-bold text-base shadow-md ${getParticipantColor(pIndex)}`}>
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
          </div>

          {/* Payment Information Card - Takes 1 column on desktop (right side) */}
          <div className="lg:col-span-1">
            {payer && (
              <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-3xl shadow-xl border-2 border-amber-300 p-8 relative overflow-hidden h-full">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"></div>
                
                {/* Header Row: Payment Information (Left) + PAYER Badge (Right) */}
                <div className="relative flex items-center justify-between mb-8">
                  <div className="export-safe-title">
                    <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/30">
                        <span className="text-xl">💳</span>
                      </div>
                      <span>Payment Info</span>
                    </h3>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg flex items-center gap-2">
                    <span>👑</span>
                    <span>PAYER</span>
                  </div>
                </div>
                
                {/* 1-Column Content Layout */}
                <div className="relative space-y-5">
                  {/* 1. Bank Name and Logo */}
                  {payer.bank?.name && (
                    <div className="text-center bg-white/60 rounded-2xl p-4 shadow-sm border border-amber-200/50">
                      <div className="flex items-center justify-center gap-3 text-gray-800 font-semibold">
                        {payer.bank?.logoUrl && (
                          <Image 
                            src={payer.bank.logoUrl} 
                            alt={`${payer.bank.name} logo`}
                            width={36} 
                            height={36} 
                            className="rounded-lg shadow-sm"
                          />
                        )}
                        <span className="font-black text-xl text-gray-900">{payer.bank.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* 2. QR Code */}
                  {payer.qrUrl && (
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-amber-300">
                        <Image 
                          src={payer.qrUrl} 
                          alt="Payment QR Code" 
                          width={140} 
                          height={140} 
                          className="rounded-xl"
                        />
                        <p className="text-xs text-gray-700 mt-3 text-center font-bold bg-amber-100 rounded-full px-3 py-1">Scan to Pay</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 3. Account Holder */}
                  <div className="text-center">
                    <div className="font-black text-gray-900 text-xl bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3 rounded-2xl inline-block shadow-sm border border-amber-200">
                      {payer.accountHolder || payer.displayName}
                    </div>
                  </div>
                  
                  {/* 4. Account Number */}
                  {payer.accountNumber && (
                    <div className="text-center">
                      <div className="text-gray-800 font-bold text-xl font-mono bg-white/60 rounded-2xl px-4 py-3 shadow-sm border border-amber-200/50">
                        {payer.accountNumber}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

            {/* Summary Statistics Card - Full Width Below */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-100/50 p-8">
              <div className="export-safe-title mb-6">
                <h3 className="text-2xl font-bold text-left flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                    <span className="text-xl">📈</span>
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Summary</span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 shadow-sm">
                  <div className="text-3xl font-black text-purple-700">{items.filter((i: any) => i.type === "NORMAL").length}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Items</div>
                  {items.filter((i: any) => i.type !== "NORMAL").length > 0 && (
                    <div className="text-xs text-amber-700 font-medium mt-2 bg-amber-100 rounded-full px-2 py-1 inline-block">
                      +{items.filter((i: any) => i.type !== "NORMAL").length} adjustments
                    </div>
                  )}
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-200/50 shadow-sm">
                  <div className="text-3xl font-black text-indigo-700">{participants.length}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Participants</div>
                </div>
                <div className="text-center p-5 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200/50 shadow-sm">
                  <div className="text-3xl font-black text-pink-700">{formatCurrency(grandTotal)}</div>
                  <div className="text-sm font-semibold text-gray-700 mt-1">Total Amount</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-gray-500 text-sm pt-4 border-t-2 border-purple-100">
              <p className="font-medium">Generated by <span className="font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">SplitBill Pro</span></p>
              <p className="text-xs mt-1">{new Date().toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
