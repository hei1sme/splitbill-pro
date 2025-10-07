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

// Mock data for demonstration - in real app would come from API
const getMockParticipants = () => [
  {
    id: "gia-hung",
    displayName: "Gia Hưng",
    isPayer: false,
    owes: 45449,
  },
  {
    id: "huynh-giao", 
    displayName: "Huynh Giao",
    isPayer: false,
    owes: 51940,
  },
  {
    id: "cong-phuc",
    displayName: "Công Phúc", 
    isPayer: false,
    owes: 99274,
  },
  {
    id: "quoc-khai",
    displayName: "Quốc Khải",
    isPayer: true,
    owes: 0,
    paid: 346024,
  },
];

const getMockItemDistribution = () => [
  {
    id: "udon",
    name: "Udon Thịt Heo",
    fee: 39200,
    type: "NORMAL" as const,
    shares: {
      "gia-hung": 0,
      "huynh-giao": 0,
      "cong-phuc": 0,
      "quoc-khai": 39200,
    } as Record<string, number>
  },
  {
    id: "ga-rut-xuong",
    name: "Gà Rút Xương",
    fee: 49000,
    type: "NORMAL" as const,
    shares: {
      "gia-hung": 12250,
      "huynh-giao": 12250,
      "cong-phuc": 0,
      "quoc-khai": 12250,
    } as Record<string, number>
  },
  {
    id: "bun-cha-gio",
    name: "Bún Chả Giò",
    fee: 27000,
    type: "NORMAL" as const,
    shares: {
      "gia-hung": 0,
      "huynh-giao": 0,
      "cong-phuc": 0,
      "quoc-khai": 27000,
    } as Record<string, number>
  },
  {
    id: "rau-xao",
    name: "Rau Xào",
    fee: 17640,
    type: "NORMAL" as const,
    shares: {
      "gia-hung": 5880,
      "huynh-giao": 5880,
      "cong-phuc": 0,
      "quoc-khai": 5880,
    } as Record<string, number>
  },
  {
    id: "mi-xao-chay",
    name: "Mì Xào Chay",
    fee: 12480,
    type: "NORMAL" as const,
    shares: {
      "gia-hung": 0,
      "huynh-giao": 0,
      "cong-phuc": 12480,
      "quoc-khai": 0,
    } as Record<string, number>
  },
  {
    id: "special-adj",
    name: "Special Adj",
    fee: -6500,
    type: "SPECIAL" as const,
    shares: {
      "gia-hung": 0,
      "huynh-giao": 0,
      "cong-phuc": 0,
      "quoc-khai": -6500,
    } as Record<string, number>
  },
];

export default function SnapshotView({ bill }: SnapshotViewProps) {
  const participants = getMockParticipants();
  const itemDistribution = getMockItemDistribution();
  
  const normalItems = itemDistribution.filter(item => item.type === "NORMAL");
  const adjustmentItems = itemDistribution.filter(item => item.type !== "NORMAL");
  
  const totalFee = normalItems.reduce((sum, item) => sum + item.fee, 0);
  const payer = participants.find(p => p.isPayer);
  const nonPayers = participants.filter(p => !p.isPayer);

  const handleCopyAsImage = async () => {
    try {
      const element = document.getElementById('snapshot-table');
      if (!element) return;

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        width: 800,
        useCORS: true,
        allowTaint: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Bill snapshot copied to clipboard');
        }
      });
    } catch (error) {
      toast.error('Failed to copy snapshot');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/bills/${bill.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bill
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{bill.title}</h1>
              <p className="text-muted-foreground">
                {new Date(bill.date).toLocaleDateString('vi-VN')} • 
                <Badge variant="outline" className="ml-2">{bill.status}</Badge>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-primary">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(totalFee)}
            </p>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2 no-print">
          <Button onClick={handleCopyAsImage} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Copy as Image
          </Button>
          <Button onClick={handlePrintPDF} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
        </div>

        {/* Snapshot Table */}
        <div id="snapshot-table" className="bg-white rounded-lg shadow-lg overflow-hidden snapshot-table">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-primary/20 to-accent/20">
                <th className="text-left py-4 px-6 font-semibold border-b border-gray-200">
                  Item Name
                </th>
                <th className="text-right py-4 px-4 font-semibold border-b border-gray-200">
                  Fee
                </th>
                {nonPayers.map((participant) => (
                  <th 
                    key={participant.id}
                    className="text-center py-4 px-3 font-semibold text-sm border-b border-gray-200 bg-blue-50/50 participant-column"
                  >
                    {participant.displayName}
                  </th>
                ))}
                {payer && (
                  <th className="text-center py-4 px-3 font-semibold text-sm border-b border-gray-200 bg-primary/30 text-primary-foreground payer-column">
                    {payer.displayName}
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
                  <td className="py-3 px-4 text-right font-mono currency-amount">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(item.fee)}
                  </td>
                  {nonPayers.map((participant) => (
                    <td key={participant.id} className="py-3 px-3 text-center font-mono text-sm currency-amount participant-column">
                      {item.shares[participant.id] > 0 
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.shares[participant.id])
                        : "–"
                      }
                    </td>
                  ))}
                  {payer && (
                    <td className="py-3 px-3 text-center font-mono text-sm bg-primary/10 currency-amount payer-column">
                      {item.shares[payer.id] > 0 
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.shares[payer.id])
                        : "–"
                      }
                    </td>
                  )}
                </tr>
              ))}

              {/* Separator Row */}
              {adjustmentItems.length > 0 && (
                <tr className="border-t-2 border-dashed border-gray-300">
                  <td colSpan={2 + participants.length} className="py-2 text-center text-gray-400 text-sm">
                    ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙
                  </td>
                </tr>
              )}

              {/* Adjustment Items */}
              {adjustmentItems.map((item, index) => (
                <tr key={item.id} className="bg-amber-50/50 adjustment-row">
                  <td className="py-3 px-6 font-medium text-amber-800">{item.name}</td>
                  <td className="py-3 px-4 text-right font-mono text-amber-800 currency-amount">
                    {item.fee < 0 ? '–' : ''}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(Math.abs(item.fee))}
                  </td>
                  {nonPayers.map((participant) => (
                    <td key={participant.id} className="py-3 px-3 text-center font-mono text-sm text-amber-800 currency-amount participant-column">
                      {item.shares[participant.id] !== 0 
                        ? (item.shares[participant.id] < 0 ? '–' : '') +
                          new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Math.abs(item.shares[participant.id]))
                        : "–"
                      }
                    </td>
                  ))}
                  {payer && (
                    <td className="py-3 px-3 text-center font-mono text-sm bg-primary/10 text-amber-800 currency-amount payer-column">
                      {item.shares[payer.id] !== 0 
                        ? (item.shares[payer.id] < 0 ? '–' : '') +
                          new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(Math.abs(item.shares[payer.id]))
                        : "–"
                      }
                    </td>
                  )}
                </tr>
              ))}

              {/* Total Row */}
              <tr className="border-t-4 border-gray-800 bg-gray-100 font-bold total-row">
                <td className="py-4 px-6 text-lg">TOTAL</td>
                <td className="py-4 px-4 text-right text-lg font-mono currency-amount">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(totalFee)}
                </td>
                {nonPayers.map((participant) => (
                  <td key={participant.id} className="py-4 px-3 text-center text-lg font-mono bg-blue-100 currency-amount participant-column">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(participant.owes)}
                  </td>
                ))}
                {payer && (
                  <td className="py-4 px-3 text-center text-lg font-mono bg-primary/20 currency-amount payer-column">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(payer.paid || 0)}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards - Hidden on Desktop, Shown on Mobile */}
        <div className="md:hidden snapshot-mobile-card space-y-4">
          {participants.map((participant) => (
            <div key={participant.id} className="mobile-person-card">
              <div className="mobile-person-header">
                {participant.displayName}
                {participant.isPayer && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                    PAYER
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {[...normalItems, ...adjustmentItems].map((item) => {
                  const amount = item.shares[participant.id];
                  if (amount === 0) return null;
                  
                  return (
                    <div key={item.id} className="mobile-item-row">
                      <span className="text-sm">{item.name}</span>
                      <span className="font-mono text-sm font-medium">
                        {amount < 0 && '–'}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(Math.abs(amount))}
                      </span>
                    </div>
                  );
                })}
                
                <div className="mobile-total-row">
                  <div className="flex justify-between">
                    <span>Total {participant.isPayer ? 'Paid' : 'Owes'}:</span>
                    <span className="font-mono font-bold">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(participant.isPayer ? (participant.paid || 0) : participant.owes)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Information */}
        <div className="grid md:grid-cols-2 gap-6 qr-payment-section">
          {/* Payer Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-center">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {/* Mock QR Code */}
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{bill.payer.displayName}</h3>
                <p className="text-muted-foreground">
                  {bill.payer.bankCode || "MoMo"}: {bill.payer.accountNumber || "909123"}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan to pay your share
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Outstanding Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Outstanding Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {nonPayers.map((participant) => (
                <div key={participant.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium">{participant.displayName} owes:</span>
                  <span className="font-mono font-semibold text-primary currency-amount">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(participant.owes)}
                  </span>
                </div>
              ))}
              {payer && (
                <div className="flex justify-between items-center py-2 border-t-2 border-primary/20 bg-primary/5 px-3 rounded">
                  <span className="font-bold">{payer.displayName} paid total:</span>
                  <span className="font-mono font-bold text-primary currency-amount">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(payer.paid || 0)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
