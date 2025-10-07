"use client";

import * as React from "react";
import { Check, X, Lock, LockOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types matching your Google Sheet structure
interface Participant {
  id: string;
  displayName: string;
  isPayer: boolean;
  order: number;
}

interface ItemShare {
  participantId: string;
  include: boolean;    // Checkbox - whether person buys this item
  locked: boolean;     // Lock icon - prevents auto-calculation  
  paid: boolean;       // "Đã Thanh Toán" status
  rawInput?: string;   // User-entered amount or percentage
  amount: number;      // Calculated or entered amount
}

interface Item {
  id: string;
  name: string;
  fee?: number;        // Total item cost
  splitMethod: "EQUAL" | "PERCENT" | "CUSTOM";
  type: "NORMAL" | "CARRY_OVER" | "SPECIAL";
  order: number;
  shares: ItemShare[];
}

interface InteractiveItemsTableProps {
  items: Item[];
  participants: Participant[];
  onItemUpdate: (itemId: string, updates: Partial<Item>) => void;
  onShareUpdate: (itemId: string, participantId: string, updates: Partial<ItemShare>) => void;
  onDistributeItem: (itemId: string) => void;
  onDistributeAll: () => void;
  onAddItem: () => void;
}

export function InteractiveItemsTable({
  items,
  participants,
  onItemUpdate,
  onShareUpdate,
  onDistributeItem,
  onDistributeAll,
  onAddItem,
}: InteractiveItemsTableProps) {
  // Sort participants with payer last (matching your sheet)
  const sortedParticipants = React.useMemo(() => {
    return [...participants].sort((a, b) => {
      if (a.isPayer) return 1;  // Payer goes last
      if (b.isPayer) return -1;
      return a.order - b.order;
    });
  }, [participants]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderShareCell = (item: Item, participant: Participant) => {
    const share = item.shares.find(s => s.participantId === participant.id);
    if (!share) return null;

    const isEditing = false; // You can add editing state management
    
    return (
      <td 
        key={`${item.id}-${participant.id}`}
        className={cn(
          "relative p-1 text-center min-w-[100px] border-l border-gray-200",
          participant.isPayer && "bg-blue-50 border-blue-200",
          !share.include && "bg-gray-50",
          share.paid && "bg-green-50"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          {/* Include/Exclude Checkbox */}
          <div className="flex items-center gap-1">
            <Checkbox
              checked={share.include}
              onCheckedChange={(checked) =>
                onShareUpdate(item.id, participant.id, { include: !!checked })
              }
              className="h-3 w-3"
            />
            {/* Lock Button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() =>
                onShareUpdate(item.id, participant.id, { locked: !share.locked })
              }
            >
              {share.locked ? (
                <Lock className="h-3 w-3 text-orange-600" />
              ) : (
                <LockOpen className="h-3 w-3 text-gray-400" />
              )}
            </Button>
          </div>

          {/* Amount Display/Input */}
          {!share.include ? (
            <span className="text-gray-400 text-lg">–</span>
          ) : (
            <div className="w-full">
              {isEditing ? (
                <Input
                  value={share.rawInput || ""}
                  onChange={(e) =>
                    onShareUpdate(item.id, participant.id, { rawInput: e.target.value })
                  }
                  className="h-6 text-xs text-center"
                  placeholder={item.splitMethod === "PERCENT" ? "%" : "VND"}
                />
              ) : (
                <div className="text-xs">
                  {share.amount > 0 ? (
                    <span className={cn(
                      "font-medium",
                      share.paid && "text-green-700"
                    )}>
                      {item.splitMethod === "PERCENT" && share.rawInput 
                        ? `${share.rawInput}%`
                        : formatCurrency(share.amount)
                      }
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment Status */}
          {share.include && (
            <div className="flex items-center gap-1">
              <Checkbox
                checked={share.paid}
                onCheckedChange={(checked) =>
                  onShareUpdate(item.id, participant.id, { paid: !!checked })
                }
                className="h-3 w-3"
              />
              {share.paid && (
                <Badge variant="secondary" className="text-xs px-1">
                  Paid
                </Badge>
              )}
            </div>
          )}
        </div>
      </td>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={onDistributeAll} variant="outline" size="sm">
            Distribute All
          </Button>
          <Button onClick={() => {}} variant="outline" size="sm">
            Reset
          </Button>
        </div>
        <Button onClick={onAddItem} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Interactive Items Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white" suppressHydrationWarning>
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gradient-to-r from-purple-100 to-blue-100">
              <tr>
                <th className="text-left p-3 font-semibold min-w-[200px] border-r border-gray-200">
                  Item Name
                </th>
                <th className="text-right p-3 font-semibold min-w-[120px] border-r border-gray-200">
                  Fee (VND)
                </th>
                <th className="text-center p-3 font-semibold min-w-[100px] border-r border-gray-200">
                  Split Method
                </th>
                {sortedParticipants.map((participant) => (
                  <th
                    key={participant.id}
                    className={cn(
                      "text-center p-3 font-semibold min-w-[100px] border-r border-gray-200",
                      participant.isPayer && "bg-blue-200 text-blue-800"
                    )}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs">{participant.displayName}</span>
                      {participant.isPayer && (
                        <Badge variant="secondary" className="text-xs">PAYER</Badge>
                      )}
                    </div>
                  </th>
                ))}
                <th className="text-center p-3 font-semibold min-w-[80px]">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Normal Items */}
              {items.filter(item => item.type === "NORMAL").map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {/* Item Name */}
                  <td className="p-3 border-r border-gray-200">
                    <Input
                      value={item.name}
                      onChange={(e) => onItemUpdate(item.id, { name: e.target.value })}
                      className="border-none p-0 h-auto text-sm font-medium focus:ring-0"
                    />
                  </td>

                  {/* Fee */}
                  <td className="p-3 text-right border-r border-gray-200">
                    <Input
                      type="number"
                      value={item.fee || ""}
                      onChange={(e) => onItemUpdate(item.id, { fee: parseFloat(e.target.value) || 0 })}
                      className="text-right border-none p-0 h-auto text-sm focus:ring-0"
                      placeholder="0"
                    />
                  </td>

                  {/* Split Method */}
                  <td className="p-3 border-r border-gray-200">
                    <Select
                      value={item.splitMethod}
                      onValueChange={(value: "EQUAL" | "PERCENT" | "CUSTOM") =>
                        onItemUpdate(item.id, { splitMethod: value })
                      }
                    >
                      <SelectTrigger className="h-6 text-xs border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EQUAL">Equal</SelectItem>
                        <SelectItem value="PERCENT">Percent</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Participant Shares */}
                  {sortedParticipants.map((participant) => 
                    renderShareCell(item, participant)
                  )}

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <Button
                      onClick={() => onDistributeItem(item.id)}
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                    >
                      Calc
                    </Button>
                  </td>
                </tr>
              ))}

              {/* Separator Row */}
              <tr className="bg-gray-100">
                <td colSpan={3 + sortedParticipants.length + 1} className="p-2 text-center text-sm text-gray-600">
                  <div className="border-t border-dashed border-gray-400 w-full"></div>
                </td>
              </tr>

              {/* Adjustment Items (Carry-over, Special) */}
              {items.filter(item => item.type !== "NORMAL").map((item) => (
                <tr key={item.id} className="border-b border-gray-100 bg-yellow-50 hover:bg-yellow-100">
                  {/* Item Name */}
                  <td className="p-3 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {item.type === "CARRY_OVER" ? "Carry-over" : "Special"}
                      </Badge>
                      <Input
                        value={item.name}
                        onChange={(e) => onItemUpdate(item.id, { name: e.target.value })}
                        className="border-none p-0 h-auto text-sm font-medium focus:ring-0 bg-transparent"
                        placeholder={item.type === "CARRY_OVER" ? "Carry-over Adjustment" : "Special Adjustment"}
                      />
                    </div>
                  </td>

                  {/* Fee */}
                  <td className="p-3 text-right border-r border-gray-200">
                    <Input
                      type="number"
                      value={item.fee || ""}
                      onChange={(e) => onItemUpdate(item.id, { fee: parseFloat(e.target.value) || 0 })}
                      className="text-right border-none p-0 h-auto text-sm focus:ring-0 bg-transparent"
                      placeholder="0"
                    />
                  </td>

                  {/* Split Method */}
                  <td className="p-3 border-r border-gray-200">
                    <span className="text-xs text-gray-500">Custom</span>
                  </td>

                  {/* Participant Shares */}
                  {sortedParticipants.map((participant) => 
                    renderShareCell(item, participant)
                  )}

                  {/* Actions */}
                  <td className="p-3 text-center">
                    <Button
                      onClick={() => {}} // Delete item
                      size="sm"
                      variant="ghost"
                      className="h-6 text-xs text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-purple-100 font-semibold">
                <td className="p-3 border-r border-gray-200 font-bold">TOTAL</td>
                <td className="p-3 text-right border-r border-gray-200 font-bold">
                  {formatCurrency(
                    items.filter(i => i.type === "NORMAL").reduce((sum, i) => sum + (i.fee || 0), 0)
                  )}
                </td>
                <td className="p-3 border-r border-gray-200"></td>
                {sortedParticipants.map((participant) => {
                  const total = items.reduce((sum, item) => {
                    const share = item.shares.find(s => s.participantId === participant.id);
                    return sum + (share?.amount || 0);
                  }, 0);
                  
                  return (
                    <td
                      key={participant.id}
                      className={cn(
                        "p-3 text-center border-r border-gray-200 font-bold",
                        participant.isPayer && "bg-blue-200 text-blue-800"
                      )}
                    >
                      {formatCurrency(total)}
                    </td>
                  );
                })}
                <td className="p-3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Checkbox checked className="h-3 w-3" />
          <span>Include in item</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-3 w-3 text-orange-600" />
          <span>Locked amount</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs px-1">Paid</Badge>
          <span>"Đã Thanh Toán" - Payment received</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-lg">–</span>
          <span>Not participating</span>
        </div>
      </div>
    </div>
  );
}
