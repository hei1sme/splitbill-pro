"use client";

import * as React from "react";
import { InteractiveItemsTable } from "@/components/bills/InteractiveItemsTable";
import { Badge } from "@/components/ui/badge";

// Mock data matching your Google Sheet example
const mockParticipants = [
  { id: "gia-hung", displayName: "Gia Hưng", isPayer: false, order: 1 },
  { id: "huynh-giao", displayName: "Huynh Giao", isPayer: false, order: 2 },
  { id: "cong-phuc", displayName: "Công Phúc", isPayer: false, order: 3 },
  { id: "the-vinh", displayName: "Thế Vĩnh", isPayer: false, order: 4 },
  { id: "dinh-tri", displayName: "Đinh Trí", isPayer: false, order: 5 },
  { id: "quoc-khai", displayName: "Quốc Khải", isPayer: true, order: 6 }, // Payer last
];

const mockItems = [
  {
    id: "item-1",
    name: "Udon Thịt Heo",
    fee: 39200,
    splitMethod: "CUSTOM" as const,
    type: "NORMAL" as const,
    order: 1,
    shares: [
      { participantId: "gia-hung", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "huynh-giao", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "cong-phuc", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: true, locked: false, paid: true, amount: 39200 },
    ],
  },
  {
    id: "item-2", 
    name: "Gà Rút Xương",
    fee: 49000,
    splitMethod: "EQUAL" as const,
    type: "NORMAL" as const,
    order: 2,
    shares: [
      { participantId: "gia-hung", include: true, locked: false, paid: false, amount: 12250 },
      { participantId: "huynh-giao", include: true, locked: false, paid: true, amount: 12250 },
      { participantId: "cong-phuc", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: true, locked: false, paid: true, amount: 12250 },
    ],
  },
  {
    id: "item-3",
    name: "Bún Chả Giò", 
    fee: 27000,
    splitMethod: "CUSTOM" as const,
    type: "NORMAL" as const,
    order: 3,
    shares: [
      { participantId: "gia-hung", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "huynh-giao", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "cong-phuc", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: true, locked: false, paid: true, amount: 27000 },
    ],
  },
  {
    id: "item-4",
    name: "Rau Xào",
    fee: 17640,
    splitMethod: "EQUAL" as const,
    type: "NORMAL" as const,
    order: 4,
    shares: [
      { participantId: "gia-hung", include: true, locked: false, paid: false, amount: 5880 },
      { participantId: "huynh-giao", include: true, locked: false, paid: true, amount: 5880 },
      { participantId: "cong-phuc", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: true, locked: false, paid: true, amount: 5880 },
    ],
  },
  {
    id: "item-5",
    name: "Mì Xào Chay",
    fee: 12480,
    splitMethod: "CUSTOM" as const,
    type: "NORMAL" as const,
    order: 5,
    shares: [
      { participantId: "gia-hung", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "huynh-giao", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "cong-phuc", include: true, locked: false, paid: false, amount: 12480 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: false, locked: false, paid: false, amount: 0 },
    ],
  },
  {
    id: "adjustment-1",
    name: "Discount",
    fee: -6500,
    splitMethod: "CUSTOM" as const,
    type: "SPECIAL" as const,
    order: 6,
    shares: [
      { participantId: "gia-hung", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "huynh-giao", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "cong-phuc", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "the-vinh", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "dinh-tri", include: false, locked: false, paid: false, amount: 0 },
      { participantId: "quoc-khai", include: true, locked: false, paid: true, amount: -6500 },
    ],
  },
];

export default function InteractiveTableDemo() {
  const [items, setItems] = React.useState(mockItems);

  const handleItemUpdate = (itemId: string, updates: any) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const handleShareUpdate = (itemId: string, participantId: string, updates: any) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      
      return {
        ...item,
        shares: item.shares.map(share =>
          share.participantId === participantId 
            ? { ...share, ...updates }
            : share
        )
      };
    }));
  };

  const handleDistributeItem = (itemId: string) => {
    // Mock distribution logic
    console.log("Distributing item:", itemId);
  };

  const handleDistributeAll = () => {
    console.log("Distributing all items");
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      name: "New Item",
      fee: 0,
      splitMethod: "EQUAL" as const,
      type: "NORMAL" as const,
      order: items.length + 1,
      shares: mockParticipants.map(p => ({
        participantId: p.id,
        include: true,
        locked: false,
        paid: false,
        amount: 0,
      })),
    };
    setItems(prev => [...prev, newItem]);
  };

  // Calculate totals like your Google Sheet
  const totals = React.useMemo(() => {
    const participantTotals: Record<string, number> = {};
    
    items.forEach(item => {
      item.shares.forEach(share => {
        if (!participantTotals[share.participantId]) {
          participantTotals[share.participantId] = 0;
        }
        participantTotals[share.participantId] += share.amount;
      });
    });

    return participantTotals;
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Bill Splitting Demo
          </h1>
          <p className="text-gray-600">
            Based on your Google Sheet - Individual item participation with flexible amounts
          </p>
        </div>

        <InteractiveItemsTable
          items={items}
          participants={mockParticipants}
          onItemUpdate={handleItemUpdate}
          onShareUpdate={handleShareUpdate}
          onDistributeItem={handleDistributeItem}
          onDistributeAll={handleDistributeAll}
          onAddItem={handleAddItem}
        />

        {/* Summary matching your Google Sheet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Individual Totals</h3>
            <div className="space-y-2">
              {mockParticipants.map(participant => (
                <div key={participant.id} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    {participant.displayName}
                    {participant.isPayer && (
                      <Badge variant="secondary" className="text-xs">PAYER</Badge>
                    )}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(totals[participant.id] || 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Bill Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Bill:</span>
                <span className="font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency', 
                    currency: 'VND',
                  }).format(
                    items.filter(i => i.type === "NORMAL").reduce((sum, i) => sum + (i.fee || 0), 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payer Paid:</span>
                <span className="font-medium text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND', 
                  }).format(totals["quoc-khai"] || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items:</span>
                <span>{items.filter(i => i.type === "NORMAL").length} items</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <h4 className="font-semibold text-green-800 mb-2">✅ Key Features Implemented:</h4>
          <ul className="text-green-700 space-y-1">
            <li>• Individual checkboxes for item participation (like your sheet)</li>
            <li>• "–" symbol for non-participating members</li> 
            <li>• Payment status tracking ("Đã Thanh Toán")</li>
            <li>• Flexible split methods (Equal/Percent/Custom)</li>
            <li>• Lock amounts to prevent recalculation</li>
            <li>• Payer highlighted in last column</li>
            <li>• Real-time total calculations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
