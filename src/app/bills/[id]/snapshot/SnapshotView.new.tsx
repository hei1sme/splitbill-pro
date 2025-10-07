"use client";

import * as React from "react";
import { QrCode, Download, Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillWithItems } from "@/types";
import Link from "next/link";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./snapshot.css";

interface SnapshotViewProps {
  bill: BillWithItems;
}

export default function SnapshotView({ bill }: SnapshotViewProps) {
  // Process bill data
  const participants = bill.participants || [];
  const payer = participants.find(p => p.isPayer);
  const nonPayers = participants.filter(p => !p.isPayer);
  
  // Sort participants: non-payers first, then payer last
  const sortedParticipants = [...nonPayers, ...(payer ? [payer] : [])];
  
  // Separate items by type
  const normalItems = bill.items?.filter(item => item.type === 'NORMAL') || [];
  const adjustmentItems = bill.items?.filter(item => item.type !== 'NORMAL') || [];
  
  // Calculate totals
  const totalFee = normalItems.reduce((sum, item) => sum + (item.fee || 0), 0);
  
  // Calculate per-person totals (including adjustments)
  const participantTotals = new Map<string, number>();
  bill.items?.forEach(item => {
    item.shares?.forEach(share => {
      const current = participantTotals.get(share.participantId) || 0;
      participantTotals.set(share.participantId, current + share.amount);
    });
  });

  const handleCopyAsImage = async () => {
    try {
      const element = document.getElementById('snapshot-table');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Image copied to clipboard');
        }
      });
    } catch (error) {
      toast.error('Failed to copy image');
    }
  };

  const handlePrintPDF = async () => {
    try {
      const element = document.getElementById('snapshot-table');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`bill-${bill.id.slice(-6)}.pdf`);
      toast.success('PDF generated successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  // Helper function to get participant share for an item
  const getParticipantShare = (item: any, participantId: string): number => {
    const share = item.shares?.find((s: any) => s.participantId === participantId);
    return share?.amount || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Clean layout matching PROMPT.md specification */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/bills/${bill.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bill
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bill.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600">
                  {new Date(bill.date).toLocaleDateString('vi-VN')}
                </span>
                <span className="text-gray-400">•</span>
                <Badge variant="outline">{bill.status}</Badge>
                <span className="text-gray-400">•</span>
                <span className="text-2xl font-bold text-primary">
                  Total: {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalFee)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content - Distribution Table (Left Side, 3/4 width) */}
          <div className="lg:col-span-3">
            
            {/* Export Actions */}
            <div className="flex gap-2 mb-4 no-print">
              <Button onClick={handleCopyAsImage} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Copy as Image
              </Button>
              <Button onClick={handlePrintPDF} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print PDF
              </Button>
            </div>

            {/* Items Distribution Table */}
            <div id="snapshot-table" className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-100">
                    <th className="text-left py-4 px-6 font-semibold border-b border-gray-200 min-w-[200px]">
                      Item Name
                    </th>
                    <th className="text-right py-4 px-4 font-semibold border-b border-gray-200 min-w-[120px]">
                      Fee
                    </th>
                    {nonPayers.map((participant) => (
                      <th 
                        key={participant.id}
                        className="text-center py-4 px-3 font-semibold text-sm border-b border-gray-200 bg-blue-50/50 min-w-[100px]"
                      >
                        {participant.person.displayName}
                      </th>
                    ))}
                    {payer && (
                      <th className="text-center py-4 px-3 font-semibold text-sm border-b border-gray-200 bg-primary/20 text-primary-800 min-w-[100px]">
                        {payer.person.displayName}
                        <div className="text-xs font-normal opacity-75">PAYER</div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {/* Normal Items */}
                  {normalItems.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                      <td className="py-3 px-6 font-medium">{item.name}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.fee || 0)}
                      </td>
                      {nonPayers.map((participant) => {
                        const amount = getParticipantShare(item, participant.id);
                        return (
                          <td key={participant.id} className="py-3 px-3 text-center font-mono text-sm">
                            {amount > 0 
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(amount)
                              : "–"
                            }
                          </td>
                        );
                      })}
                      {payer && (
                        <td className="py-3 px-3 text-center font-mono text-sm bg-primary/10">
                          {(() => {
                            const amount = getParticipantShare(item, payer.id);
                            return amount > 0 
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(amount)
                              : "–";
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Separator Row */}
                  {adjustmentItems.length > 0 && (
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan={2 + participants.length} className="py-2 text-center text-gray-500 text-sm">
                        {'– '.repeat(20)}
                      </td>
                    </tr>
                  )}

                  {/* Adjustment Items */}
                  {adjustmentItems.map((item, index) => (
                    <tr key={item.id} className="bg-orange-50/50">
                      <td className="py-3 px-6 font-medium text-orange-800">{item.name}</td>
                      <td className="py-3 px-4 text-right font-mono text-orange-700">
                        {item.fee ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(item.fee) : "–"}
                      </td>
                      {nonPayers.map((participant) => {
                        const amount = getParticipantShare(item, participant.id);
                        return (
                          <td key={participant.id} className="py-3 px-3 text-center font-mono text-sm text-orange-700">
                            {amount !== 0 
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(amount)
                              : "–"
                            }
                          </td>
                        );
                      })}
                      {payer && (
                        <td className="py-3 px-3 text-center font-mono text-sm bg-orange-100 text-orange-700">
                          {(() => {
                            const amount = getParticipantShare(item, payer.id);
                            return amount !== 0 
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(amount)
                              : "–";
                          })()}
                        </td>
                      )}
                    </tr>
                  ))}

                  {/* Total Row */}
                  <tr className="border-t-4 border-gray-400 bg-gray-100 font-bold">
                    <td className="py-4 px-6 font-bold text-lg">TOTAL</td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-lg">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalFee)}
                    </td>
                    {nonPayers.map((participant) => {
                      const total = participantTotals.get(participant.id) || 0;
                      return (
                        <td key={participant.id} className="py-4 px-3 text-center font-mono font-bold text-sm">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(total)}
                        </td>
                      );
                    })}
                    {payer && (
                      <td className="py-4 px-3 text-center font-mono font-bold text-sm bg-primary/20">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(participantTotals.get(payer.id) || 0)}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payer Sidebar (Right Side, 1/4 width) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Payer Card */}
            {payer && (
              <Card className="glass-card sticky top-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-center text-primary">Payer Details</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">
                      {payer.person.displayName.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Name and PAYER badge */}
                  <div>
                    <h3 className="font-bold text-lg">{payer.person.displayName}</h3>
                    <Badge className="bg-primary text-primary-foreground">PAYER</Badge>
                  </div>
                  
                  {/* Bank Info */}
                  {payer.person.bankCode && (
                    <div className="text-sm text-muted-foreground">
                      <p>{payer.person.bank?.name || payer.person.bankCode}</p>
                      {payer.person.accountNumber && (
                        <p className="font-mono">{payer.person.accountNumber}</p>
                      )}
                    </div>
                  )}
                  
                  {/* QR Code */}
                  <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {payer.person.qrUrl ? (
                      <img 
                        src={payer.person.qrUrl} 
                        alt="Payment QR Code"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">QR Code</p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Scan to pay your share
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Outstanding Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Outstanding Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nonPayers.map((participant) => {
                  const owes = participantTotals.get(participant.id) || 0;
                  return (
                    <div key={participant.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium">{participant.person.displayName} owes:</span>
                      <span className="font-mono font-semibold text-orange-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(owes)}
                      </span>
                    </div>
                  );
                })}
                {payer && (
                  <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 px-3 rounded">
                    <span className="font-bold">{payer.person.displayName} paid total:</span>
                    <span className="font-mono font-bold text-primary">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(totalFee)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
