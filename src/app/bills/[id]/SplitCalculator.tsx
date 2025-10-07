"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calculator, Users, DollarSign } from "lucide-react";

interface SplitCalculatorProps {
  billId: string;
}

interface Balance {
  personId: string;
  name: string;
  owes: number;
  paid: number;
  balance: number;
}

interface Settlement {
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
}

interface CalculationResult {
  bill: any;
  balances: Balance[];
  settlements: Settlement[];
  totalAmount: number;
  splitAmount: number;
}

export function SplitCalculator({ billId }: SplitCalculatorProps) {
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const calculateSplit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/bills/${billId}/calculate`, {
        method: "POST",
      });
      
      if (response.ok) {
        const result = await response.json();
        setCalculation(result);
      }
    } catch (error) {
      console.error("Failed to calculate split:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Split Calculator
              </CardTitle>
              <CardDescription>
                Calculate how much each person owes and settlement recommendations
              </CardDescription>
            </div>
            <Button onClick={calculateSplit} disabled={isLoading}>
              {isLoading ? "Calculating..." : "Calculate Split"}
            </Button>
          </div>
        </CardHeader>
        
        {calculation && (
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Total Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(calculation.totalAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">Per Person</p>
                      <p className="text-2xl font-bold">{formatCurrency(calculation.splitAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">People Count</p>
                      <p className="text-2xl font-bold">{calculation.balances.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Balances */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Individual Balances</h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Person</TableHead>
                      <TableHead className="text-right">Owes</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculation.balances.map((balance) => (
                      <TableRow key={balance.personId}>
                        <TableCell className="font-medium">{balance.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.owes)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(balance.paid)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {formatCurrency(Math.abs(balance.balance))}
                            <Badge variant={balance.balance >= 0 ? "default" : "destructive"}>
                              {balance.balance >= 0 ? "Credit" : "Debt"}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Settlement Recommendations */}
            {calculation.settlements.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Settlement Recommendations</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calculation.settlements.map((settlement, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{settlement.payerName}</TableCell>
                          <TableCell>{settlement.payeeName}</TableCell>
                          <TableCell className="text-right">{formatCurrency(settlement.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline">
                              Mark as Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
