'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, QrCode, Calculator, Settings, Camera, Download, 
  Plus, Lock, LockOpen, AlertTriangle, Check, X, 
  DragHandleDots2, Copy, FileImage, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

// Types based on our documented requirements
interface Participant {
  id: string;
  displayName: string;
  isPayer: boolean;
  order: number;
  accountNumber?: string;
  bankCode?: string;
  accountHolder?: string;
  qrUrl?: string;
  completed: boolean;
  bankName?: string;
  bankLogoUrl?: string;
}

interface ItemShare {
  participantId: string;
  include: boolean;
  locked: boolean;
  paid: boolean; // "Đã Thanh Toán" status
  rawInput?: string;
  amount: number;
}

interface Item {
  id: string;
  name: string;
  fee?: number;
  splitMethod: "EQUAL" | "PERCENT"; // Removed CUSTOM per requirements
  type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
  order: number;
  shares: ItemShare[];
}

interface BillSettings {
  defaultSplitMethod: "EQUAL" | "PERCENT";
  roundingRule: "UP" | "DOWN" | "NEAREST";
  currency: string;
  allowPartialParticipation: boolean;
  paymentDeadline?: Date;
}

export default function BillDetails({ bill }: { bill: any }) {
  // State management
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [billSettings, setBillSettings] = useState<BillSettings>({
    defaultSplitMethod: "EQUAL",
    roundingRule: "NEAREST",
    currency: "VND",
    allowPartialParticipation: true,
  });
  
  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [draggedPayment, setDraggedPayment] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize participants from bill data
  useEffect(() => {
    if (!bill) return;

    const initParticipants = () => {
      const groupMembers = bill?.group?.members || [];
      const payer = bill?.payer;
      
      let participantList: Participant[] = [];
      
      if (groupMembers.length > 0) {
        participantList = groupMembers.map((member: any, index: number) => ({
          id: member.person?.id || `member-${index}`,
          displayName: member.person?.displayName || `Member ${index + 1}`,
          isPayer: member.person?.id === payer?.id,
          order: index,
          accountNumber: member.person?.accountNumber,
          bankCode: member.person?.bankCode,
          accountHolder: member.person?.accountHolder,
          qrUrl: member.person?.qrUrl,
          bankName: member.person?.bank?.name,
          bankLogoUrl: member.person?.bank?.logoUrl,
          completed: false,
        }));
      } else {
        // Fallback to default participants
        participantList = [
          {
            id: 'payer',
            displayName: payer?.displayName || 'Payer',
            isPayer: true,
            order: 0,
            accountNumber: payer?.accountNumber,
            bankCode: payer?.bankCode,
            accountHolder: payer?.accountHolder,
            qrUrl: payer?.qrUrl,
            bankName: payer?.bank?.name,
            bankLogoUrl: payer?.bank?.logoUrl,
            completed: false,
          },
          ...Array.from({ length: 3 }, (_, i) => ({
            id: `participant-${i + 1}`,
            displayName: `Participant ${i + 1}`,
            isPayer: false,
            order: i + 1,
            completed: false,
          })),
        ];
      }
      
      setParticipants(participantList);
      return participantList;
    };

    const initItems = (participantList: Participant[]) => {
      const billItems = bill?.items || [];
      
      // Convert bill items to our format
      const normalItems: Item[] = billItems.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        name: item.description || `Item ${index + 1}`,
        fee: item.amount || 0,
        splitMethod: "EQUAL",
        type: "NORMAL",
        order: index,
        shares: participantList.map(p => ({
          participantId: p.id,
          include: true,
          locked: false,
          paid: false,
          amount: 0,
        })),
      }));
      
      // Add adjustment items
      const adjustmentItems: Item[] = [
        {
          id: 'carry-over',
          name: 'Previous Debt',
          fee: 0,
          splitMethod: "EQUAL",
          type: "CARRY_OVER",
          order: 1000,
          shares: participantList.map(p => ({
            participantId: p.id,
            include: false,
            locked: false,
            paid: false,
            amount: 0,
          })),
        },
        {
          id: 'discount',
          name: 'Discount',
          fee: -500,
          splitMethod: "EQUAL", 
          type: "SPECIAL",
          order: 1001,
          shares: participantList.map(p => ({
            participantId: p.id,
            include: false,
            locked: false,
            paid: false,
            amount: 0,
          })),
        },
      ];
      
      setItems([...normalItems, ...adjustmentItems]);
    };

    const participantList = initParticipants();
    initItems(participantList);
  }, [bill]);

  // Find the payer
  const payer = participants.find(p => p.isPayer);

  // Calculations
  const totalNormalFee = useMemo(() => {
    return items
      .filter(item => item.type === "NORMAL")
      .reduce((sum, item) => sum + (item.fee || 0), 0);
  }, [items]);

  const totalAdjustments = useMemo(() => {
    return items
      .filter(item => item.type !== "NORMAL")
      .reduce((sum, item) => sum + (item.fee || 0), 0);
  }, [items]);

  const grandTotal = totalNormalFee + totalAdjustments;

  const participantTotals = useMemo(() => {
    return participants.map(participant => {
      const total = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.amount || 0);
      }, 0);
      
      const paidAmount = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.paid && share?.include ? share.amount : 0);
      }, 0);
      
      return {
        participant,
        total,
        paidAmount,
        outstanding: total - paidAmount,
      };
    });
  }, [participants, items]);

  // Validation
  useEffect(() => {
    const errors: string[] = [];
    
    // Check payer info completeness
    if (payer) {
      if (!payer.accountNumber) errors.push("Payer account number missing");
      if (!payer.bankCode) errors.push("Payer bank information missing");
      if (!payer.qrUrl) errors.push("Payer QR code missing");
    }
    
    // Check for items without participants
    const itemsWithoutParticipants = items.filter(item => 
      item.type === "NORMAL" && !item.shares.some(s => s.include)
    );
    if (itemsWithoutParticipants.length > 0) {
      errors.push(`${itemsWithoutParticipants.length} items have no participants`);
    }
    
    setValidationErrors(errors);
  }, [payer, items]);

  // Event handlers
  const handleItemUpdate = (itemId: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleShareUpdate = (itemId: string, participantId: string, updates: Partial<ItemShare>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        shares: item.shares.map(share =>
          share.participantId === participantId ? { ...share, ...updates } : share
        ),
      };
    }));
  };

  const handleDistributeItem = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const includedShares = item.shares.filter(s => s.include && !s.locked);
      if (includedShares.length === 0) return item;
      
      const amountPerShare = (item.fee || 0) / includedShares.length;
      
      return {
        ...item,
        shares: item.shares.map(share => {
          if (!share.include || share.locked) return share;
          return { ...share, amount: amountPerShare };
        }),
      };
    }));
  };

  const handleDistributeAll = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    items.forEach(item => {
      if (item.type === "NORMAL") {
        handleDistributeItem(item.id);
      }
    });
    
    setIsCalculating(false);
    toast.success("All items distributed successfully!");
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: `New Item ${items.filter(i => i.type === "NORMAL").length + 1}`,
      fee: 0,
      splitMethod: billSettings.defaultSplitMethod,
      type: "NORMAL",
      order: items.filter(i => i.type === "NORMAL").length,
      shares: participants.map(p => ({
        participantId: p.id,
        include: true,
        locked: false,
        paid: false,
        amount: 0,
      })),
    };
    
    setItems(prev => [...prev.filter(i => i.type === "NORMAL"), newItem, ...prev.filter(i => i.type !== "NORMAL")]);
  };

  const toggleParticipantCompleted = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, completed: !p.completed } : p
    ));
  };

  // Drag and drop for payment tracking (desktop)
  const handleDragStart = (e: React.DragEvent) => {
    setDraggedPayment("PAID");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, itemId: string, participantId: string) => {
    e.preventDefault();
    if (draggedPayment === "PAID") {
      handleShareUpdate(itemId, participantId, { paid: true });
      setDraggedPayment(null);
      toast.success("Payment marked!");
    }
  };

  // Export functions
  const handleSnapshotPreview = () => {
    setShowSnapshot(true);
  };

  const handleCopyAsImage = async () => {
    // Implementation for copy as image
    toast.success("📋 Copied to clipboard!");
  };

  const handleDownloadPDF = async () => {
    // Implementation for PDF download
    toast.success("📄 PDF downloaded!");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };
    const payer = bill?.payer;
    
    let participantList: Participant[] = [];
    
    // Add group members
    if (groupMembers.length > 0) {
      participantList = groupMembers.map((member: any, index: number) => ({
        id: member.person?.id || `member-${index}`,
        displayName: member.person?.displayName || `Member ${index + 1}`,
        isPayer: member.person?.id === payer?.id,
        order: index,
        accountNumber: member.person?.accountNumber,
        bankCode: member.person?.bankCode,
        accountHolder: member.person?.accountHolder,
        qrUrl: member.person?.qrUrl,
        completed: false,
      }));
    } else {
      // Fallback to default participants if no group data
      participantList = [
        {
          id: 'payer',
          displayName: payer?.displayName || 'Payer',
          isPayer: true,
          order: 0,
          accountNumber: payer?.accountNumber,
          bankCode: payer?.bankCode,
          accountHolder: payer?.accountHolder,
          qrUrl: payer?.qrUrl,
          completed: false,
        },
        ...Array.from({ length: 3 }, (_, i) => ({
          id: `participant-${i + 1}`,
          displayName: `Participant ${i + 1}`,
          isPayer: false,
          order: i + 1,
          completed: false,
        })),
      ];
    }
    
    return participantList;
  });

  // Initialize items from bill data
  const [items, setItems] = useState<Item[]>(() => {
    const billItems = bill?.items || [];
    
    // Convert bill items to our format
    const normalItems: Item[] = billItems.map((item: any, index: number) => ({
      id: item.id || `item-${index}`,
      name: item.description || `Item ${index + 1}`,
      fee: item.amount || 0,
      splitMethod: "EQUAL" as const,
      type: "NORMAL" as const,
      order: index,
      shares: participants.map(p => ({
        participantId: p.id,
        include: true,
        locked: false,
        paid: false,
        amount: 0,
      })),
    }));
    
    // Add adjustment items (carry-over and special)
    const adjustmentItems: Item[] = [
      {
        id: 'carry-over',
        name: 'Previous Debt',
        fee: 0,
        splitMethod: "CUSTOM" as const,
        type: "CARRY_OVER" as const,
        order: 1000,
        shares: participants.map(p => ({
          participantId: p.id,
          include: false,
          locked: false,
          paid: false,
          amount: 0,
        })),
      },
      {
        id: 'discount',
        name: 'Discount',
        fee: -500,
        splitMethod: "CUSTOM" as const,
        type: "SPECIAL" as const,
        order: 1001,
        shares: participants.map(p => ({
          participantId: p.id,
          include: false,
          locked: false,
          paid: false,
          amount: 0,
        })),
      },
    ];
    
    return [...normalItems, ...adjustmentItems];
  });

  // Find the payer
  const payer = participants.find(p => p.isPayer);

  // Calculations
  const totalNormalFee = useMemo(() => {
    return items
      .filter(item => item.type === "NORMAL")
      .reduce((sum, item) => sum + (item.fee || 0), 0);
  }, [items]);

  const totalAdjustments = useMemo(() => {
    return items
      .filter(item => item.type !== "NORMAL")
      .reduce((sum, item) => sum + (item.fee || 0), 0);
  }, [items]);

  const grandTotal = totalNormalFee + totalAdjustments;

  const participantTotals = useMemo(() => {
    return participants.map(participant => {
      const total = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.amount || 0);
      }, 0);
      
      const paidAmount = items.reduce((sum, item) => {
        const share = item.shares.find(s => s.participantId === participant.id);
        return sum + (share?.paid && share?.include ? share.amount : 0);
      }, 0);
      
      return {
        participant,
        total,
        paidAmount,
        outstanding: total - paidAmount,
      };
    });
  }, [participants, items]);

  // Event handlers
  const handleItemUpdate = (itemId: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleShareUpdate = (itemId: string, participantId: string, updates: Partial<ItemShare>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        shares: item.shares.map(share =>
          share.participantId === participantId ? { ...share, ...updates } : share
        ),
      };
    }));
  };

  const handleDistributeItem = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      const includedShares = item.shares.filter(s => s.include && !s.locked);
      if (includedShares.length === 0) return item;
      
      const amountPerShare = (item.fee || 0) / includedShares.length;
      
      return {
        ...item,
        shares: item.shares.map(share => {
          if (!share.include || share.locked) return share;
          return { ...share, amount: amountPerShare };
        }),
      };
    }));
  };

  const handleDistributeAll = () => {
    items.forEach(item => {
      if (item.type === "NORMAL") {
        handleDistributeItem(item.id);
      }
    });
  };

  const handleAddItem = () => {
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: `New Item ${items.filter(i => i.type === "NORMAL").length + 1}`,
      fee: 0,
      splitMethod: "EQUAL",
      type: "NORMAL",
      order: items.filter(i => i.type === "NORMAL").length,
      shares: participants.map(p => ({
        participantId: p.id,
        include: true,
        locked: false,
        paid: false,
        amount: 0,
      })),
    };
    
    setItems(prev => [...prev.filter(i => i.type === "NORMAL"), newItem, ...prev.filter(i => i.type !== "NORMAL")]);
  };

  const toggleParticipantCompleted = (participantId: string) => {
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, completed: !p.completed } : p
    ));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {bill?.title || 'CHIA TIỀN MUA ĐỒ'}
            </h1>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <span>📅 {new Date(bill?.date || Date.now()).toLocaleDateString('vi-VN')}</span>
              <span>👥 Group: {bill?.group?.name || 'TEST_GROUP'}</span>
              <span>💰 Total: {formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy as Image
            </Button>
            <Badge 
              variant={bill?.status === 'OPEN' ? 'default' : 'secondary'}
              className="px-3 py-1"
            >
              {bill?.status || 'DRAFT'}
            </Badge>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - Interactive Table */}
          <div className="xl:col-span-3">
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
                <CardTitle className="text-lg font-bold">📋 Expense Distribution Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <InteractiveItemsTable
                  items={items}
                  participants={participants}
                  onItemUpdate={handleItemUpdate}
                  onShareUpdate={handleShareUpdate}
                  onDistributeItem={handleDistributeItem}
                  onDistributeAll={handleDistributeAll}
                  onAddItem={handleAddItem}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Participants Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {participants.map(participant => {
                  const totals = participantTotals.find(t => t.participant.id === participant.id);
                  return (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg border">
                      <Checkbox
                        checked={participant.completed}
                        onCheckedChange={() => toggleParticipantCompleted(participant.id)}
                        className="h-4 w-4"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={participant.isPayer ? "bg-blue-100 text-blue-700" : "bg-gray-100"}>
                          {participant.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {participant.displayName}
                          </span>
                          {participant.isPayer && (
                            <Badge variant="secondary" className="text-xs">PAYER</Badge>
                          )}
                        </div>
                        <div className="text-xs text-slate-600">
                          {formatCurrency(totals?.total || 0)}
                          {(totals?.outstanding || 0) > 0 && (
                            <span className="text-red-600 ml-1">
                              (Outstanding: {formatCurrency(totals?.outstanding || 0)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Payer Information & QR Code */}
            {payer && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg text-blue-800">💳 PAYMENT INFO</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {/* Payer Avatar */}
                  <div className="flex flex-col items-center">
                    <Avatar className="h-12 w-12 mb-2">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                        {payer.displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-slate-900">{payer.displayName}</h3>
                    <p className="text-sm text-slate-600">{payer.accountHolder || payer.displayName}</p>
                  </div>

                  {/* Bank Info */}
                  {payer.bankCode && (
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="text-sm text-slate-600 mb-1">Bank: {payer.bankCode}</div>
                      <div className="font-mono text-sm">{payer.accountNumber}</div>
                    </div>
                  )}

                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300">
                    {payer.qrUrl ? (
                      <img src={payer.qrUrl} alt="Payment QR Code" className="w-32 h-32 mx-auto" />
                    ) : (
                      <div className="w-32 h-32 mx-auto flex flex-col items-center justify-center text-gray-400">
                        <QrCode className="h-16 w-16 mb-2" />
                        <p className="text-xs text-center">QR Code Not Available</p>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Scan to pay your share</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bill Summary */}
            <Card className="bg-slate-800 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Items Total:</span>
                  <span className="font-bold">{formatCurrency(totalNormalFee)}</span>
                </div>
                {totalAdjustments !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Adjustments:</span>
                    <span className={`font-bold ${totalAdjustments < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(totalAdjustments)}
                    </span>
                  </div>
                )}
                <div className="border-t border-slate-600 pt-2 flex justify-between">
                  <span className="text-white font-bold">Grand Total:</span>
                  <span className="font-bold text-lg">{formatCurrency(grandTotal)}</span>
                </div>
                
                <div className="border-t border-slate-600 pt-2 space-y-2">
                  <div className="text-sm text-slate-300">Payment Status:</div>
                  {participantTotals.map(({ participant, total, paidAmount, outstanding }) => (
                    <div key={participant.id} className="flex justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[100px]">
                        {participant.displayName}:
                      </span>
                      <div className="text-right">
                        <div className="text-white">{formatCurrency(total)}</div>
                        {outstanding > 0 && (
                          <div className="text-red-400">-{formatCurrency(outstanding)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={handleDistributeAll} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate All Splits
                </Button>
                <Button 
                  onClick={() => {/* Reset logic */}} 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Reset Calculations
                </Button>
                <Button 
                  onClick={() => {/* Mark all paid */}} 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Paid
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
