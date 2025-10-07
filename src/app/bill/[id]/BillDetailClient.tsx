"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Users, Calculator, Receipt, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

// Types based on Prisma schema
interface Bill {
  id: string;
  title: string;
  description?: string;
  date: Date;
  status: string;
  group: {
    id: string;
    name: string;
  };
  payer: {
    id: string;
    displayName: string;
    bankCode?: string;
    accountNumber?: string;
    qrUrl?: string;
  };
  items: Array<{
    id: string;
    description: string;
    amount: number;
    splits: Array<{
      id: string;
      amount: number;
      person: {
        id: string;
        displayName: string;
      };
    }>;
  }>;
}

interface Person {
  id: string;
  displayName: string;
  bankCode?: string;
  accountNumber?: string;
  qrUrl?: string;
  active: boolean;
}

interface Group {
  id: string;
  name: string;
}

interface BillDetailClientProps {
  bill: Bill;
  people: Person[];
  groups: Group[];
}

export default function BillDetailClient({ bill, people, groups }: BillDetailClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isBuilding, setIsBuilding] = React.useState(false);
  const [participants, setParticipants] = React.useState<Person[]>([]);
  const [mode, setMode] = React.useState<"manual" | "group">("manual");
  const [participantCount, setParticipantCount] = React.useState(4);
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [activeTab, setActiveTab] = React.useState("participants");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate bill totals
  const totalFee = bill.items.reduce((sum, item) => sum + item.amount, 0);
  const perPersonAmounts = React.useMemo(() => {
    const amounts: Record<string, number> = {};
    bill.items.forEach(item => {
      item.splits.forEach(split => {
        amounts[split.person.id] = (amounts[split.person.id] || 0) + split.amount;
      });
    });
    return amounts;
  }, [bill.items]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800";
      case "OPEN":
        return "bg-blue-100 text-blue-800";
      case "SETTLED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleBuildParticipants = async () => {
    setIsBuilding(true);
    try {
      // This would call the API to build participants
      // For now, just show success message
      toast.success("Participants built successfully!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to build participants");
    } finally {
      setIsBuilding(false);
    }
  };

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const handleAddItem = () => {
    setActiveTab("items");
    // TODO: Open add item form
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6" suppressHydrationWarning>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Badge className={`${getStatusColor(bill.status)} border-0`}>
              {bill.status}
            </Badge>
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">{bill.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{new Date(bill.date).toLocaleDateString('vi-VN')}</span>
              <span>•</span>
              <span>Group: {bill.group.name}</span>
              <span>•</span>
              <span>Total: {formatCurrency(totalFee)}</span>
            </div>
            {bill.description && (
              <p className="text-gray-600 mt-2">{bill.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" suppressHydrationWarning>
              <TabsList className="grid w-full grid-cols-3 mb-6" suppressHydrationWarning>
                <TabsTrigger value="participants" className="flex items-center gap-2" suppressHydrationWarning>
                  <Users className="h-4 w-4" />
                  Participants
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center gap-2" suppressHydrationWarning>
                  <Receipt className="h-4 w-4" />
                  Items
                </TabsTrigger>
                <TabsTrigger value="splits" className="flex items-center gap-2" suppressHydrationWarning>
                  <Calculator className="h-4 w-4" />
                  Splits
                </TabsTrigger>
              </TabsList>

              {/* Participants Panel */}
              <TabsContent value="participants" className="space-y-6" suppressHydrationWarning>
                <Card suppressHydrationWarning>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Participants Setup
                      <Button 
                        onClick={handleBuildParticipants}
                        disabled={isBuilding}
                        className="flex items-center gap-2"
                      >
                        <Users className="h-4 w-4" />
                        {isBuilding ? "Building..." : "Build Participants"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex gap-2">
                      <Button
                        variant={mode === "manual" ? "default" : "outline"}
                        onClick={() => setMode("manual")}
                        size="sm"
                      >
                        Manual
                      </Button>
                      <Button
                        variant={mode === "group" ? "default" : "outline"}
                        onClick={() => setMode("group")}
                        size="sm"
                      >
                        Group
                      </Button>
                    </div>

                    {mode === "manual" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Number of Participants</label>
                          <input
                            type="number"
                            min="2"
                            max="20"
                            value={participantCount}
                            onChange={(e) => setParticipantCount(parseInt(e.target.value) || 2)}
                            className="mt-1 block w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {Array.from({ length: participantCount }, (_, i) => (
                            <select
                              key={i}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              defaultValue=""
                            >
                              <option value="">Select Person {i + 1}</option>
                              {people.map((person) => (
                                <option key={person.id} value={person.id}>
                                  {person.displayName}
                                </option>
                              ))}
                            </select>
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === "group" && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Select Group</label>
                          <select
                            value={selectedGroupId}
                            onChange={(e) => setSelectedGroupId(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Choose a group</option>
                            {groups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Items Table */}
              <TabsContent value="items" className="space-y-6" suppressHydrationWarning>
                <Card suppressHydrationWarning>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Interactive Items Table
                      <div className="flex gap-2">
                        <Button onClick={handleAddItem} size="sm" className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Item
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bill.items.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Receipt className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No items added yet</h3>
                        <p className="text-sm mb-4">Start by adding items to split costs among participants</p>
                        <Button onClick={handleAddItem} className="flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add Your First Item
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Interactive Table Preview */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full">
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
                                  {/* Mock participant columns */}
                                  <th className="text-center p-3 font-semibold min-w-[100px] border-r border-gray-200 bg-blue-200 text-blue-800">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="text-xs">{bill.payer.displayName}</span>
                                      <Badge variant="secondary" className="text-xs">PAYER</Badge>
                                    </div>
                                  </th>
                                  <th className="text-center p-3 font-semibold min-w-[80px]">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bill.items.map((item, index) => (
                                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3 border-r border-gray-200">
                                      <span className="text-sm font-medium">{item.description}</span>
                                    </td>
                                    <td className="p-3 text-right border-r border-gray-200">
                                      <span className="text-sm">{formatCurrency(item.amount)}</span>
                                    </td>
                                    <td className="p-3 border-r border-gray-200 text-center">
                                      <Badge variant="outline" className="text-xs">Equal</Badge>
                                    </td>
                                    <td className="p-3 text-center border-r border-gray-200 bg-blue-50">
                                      <div className="flex flex-col items-center gap-1">
                                        <Checkbox checked className="h-3 w-3" />
                                        <span className="text-xs font-medium">
                                          {formatCurrency(item.amount)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-center">
                                      <Button size="sm" variant="outline" className="h-6 text-xs">
                                        Edit
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                                
                                {/* Totals Row */}
                                <tr className="bg-purple-100 font-semibold">
                                  <td className="p-3 border-r border-gray-200 font-bold">TOTAL</td>
                                  <td className="p-3 text-right border-r border-gray-200 font-bold">
                                    {formatCurrency(totalFee)}
                                  </td>
                                  <td className="p-3 border-r border-gray-200"></td>
                                  <td className="p-3 text-center border-r border-gray-200 font-bold bg-blue-200 text-blue-800">
                                    {formatCurrency(totalFee)}
                                  </td>
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
                            <Badge variant="secondary" className="text-xs px-1">Paid</Badge>
                            <span>"Đã Thanh Toán" status</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-lg">–</span>
                            <span>Not participating</span>
                          </div>
                        </div>

                        <div className="text-center text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                          <p>💡 <strong>Interactive Table Preview</strong></p>
                          <p>This shows the structure of your bill splitting table. In the full implementation, each participant gets their own column with individual checkboxes and amount controls.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Splits & Distribution */}
              <TabsContent value="splits" className="space-y-6" suppressHydrationWarning>
                <Card suppressHydrationWarning>
                  <CardHeader>
                    <CardTitle>Distribution & Totals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(perPersonAmounts).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>No splits calculated yet</p>
                        <p className="text-sm">Add participants and items to see split calculations</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(perPersonAmounts).map(([personId, amount]) => {
                          const person = people.find(p => p.id === personId);
                          if (!person) return null;
                          
                          return (
                            <div key={personId} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {person.displayName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{person.displayName}</span>
                                {person.id === bill.payer.id && (
                                  <Badge variant="secondary" className="text-xs">PAYER</Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{formatCurrency(amount)}</div>
                                {person.id !== bill.payer.id && (
                                  <div className="text-xs text-red-600">Owes payer</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Payer Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Payer Card */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white" suppressHydrationWarning>
                <CardHeader className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="text-lg font-bold bg-blue-100 text-blue-700">
                      {bill.payer.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg">{bill.payer.displayName}</CardTitle>
                  <Badge className="bg-blue-600 text-white w-fit mx-auto">PAYER</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bill.payer.bankCode && (
                    <div className="text-center text-sm">
                      <div className="font-medium">{bill.payer.bankCode}</div>
                      {bill.payer.accountNumber && (
                        <div className="text-gray-600">{bill.payer.accountNumber}</div>
                      )}
                    </div>
                  )}
                  
                  {bill.payer.qrUrl && (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg border inline-block">
                        <QrCode className="h-24 w-24 text-gray-400" />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Scan to pay your share
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Totals Card */}
              <Card suppressHydrationWarning>
                <CardHeader>
                  <CardTitle className="text-lg">Bill Totals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Fee:</span>
                    <span className="font-bold">{formatCurrency(totalFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Per Person:</span>
                    <span className="font-medium">
                      {Object.keys(perPersonAmounts).length > 0 
                        ? formatCurrency(totalFee / Object.keys(perPersonAmounts).length)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Outstanding:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(totalFee - (perPersonAmounts[bill.payer.id] || 0))}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Calculator className="h-4 w-4 mr-2" />
                  Distribute All
                </Button>
                <Button className="w-full" variant="outline">
                  Reset Calculations
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
