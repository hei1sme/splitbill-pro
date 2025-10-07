"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subMonths, subYears } from "date-fns";

interface PaymentRecord {
  id: string;
  billId: string;
  billTitle: string;
  personId: string;
  personName: string;
  amount: number;
  paidAt: Date;
  confirmedAt?: Date;
  paymentMethod?: string;
  notes?: string;
  status: "confirmed" | "pending" | "disputed";
}

interface PaymentStats {
  totalPaid: number;
  totalConfirmed: number;
  avgPaymentTime: number; // days
  paymentCount: number;
  onTimePayments: number;
  latePayments: number;
}

interface PersonStats {
  personId: string;
  personName: string;
  totalPaid: number;
  paymentsCount: number;
  avgPaymentTime: number;
  onTimeRate: number;
  lastPayment?: Date;
}

interface PaymentHistoryProps {
  payments: PaymentRecord[];
  onExportData: (timeRange: string) => void;
}

export function PaymentHistory({ payments, onExportData }: PaymentHistoryProps) {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");

  const getFilteredPayments = () => {
    let cutoffDate: Date;
    
    switch (timeRange) {
      case "7days":
        cutoffDate = subDays(new Date(), 7);
        break;
      case "30days":
        cutoffDate = subDays(new Date(), 30);
        break;
      case "3months":
        cutoffDate = subMonths(new Date(), 3);
        break;
      case "1year":
        cutoffDate = subYears(new Date(), 1);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }

    return payments.filter(payment => {
      const withinTimeRange = payment.paidAt >= cutoffDate;
      const matchesPerson = selectedPerson === "all" || payment.personId === selectedPerson;
      return withinTimeRange && matchesPerson;
    });
  };

  const filteredPayments = getFilteredPayments();

  const calculateStats = (): PaymentStats => {
    const totalPaid = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const confirmedPayments = filteredPayments.filter(p => p.status === "confirmed");
    const totalConfirmed = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate average payment time (assuming bill creation date vs payment date)
    const avgPaymentTime = filteredPayments.reduce((sum, p) => {
      // For demo, assuming 3 days average - would calculate from actual bill creation dates
      return sum + 3;
    }, 0) / filteredPayments.length || 0;

    const onTimePayments = filteredPayments.filter(p => {
      // Assuming "on time" is within 7 days
      return true; // Simplified for demo
    }).length;

    return {
      totalPaid,
      totalConfirmed,
      avgPaymentTime,
      paymentCount: filteredPayments.length,
      onTimePayments,
      latePayments: filteredPayments.length - onTimePayments,
    };
  };

  const calculatePersonStats = (): PersonStats[] => {
    const personMap = new Map<string, PersonStats>();

    filteredPayments.forEach(payment => {
      const existing = personMap.get(payment.personId);
      
      if (existing) {
        existing.totalPaid += payment.amount;
        existing.paymentsCount += 1;
        if (!existing.lastPayment || payment.paidAt > existing.lastPayment) {
          existing.lastPayment = payment.paidAt;
        }
      } else {
        personMap.set(payment.personId, {
          personId: payment.personId,
          personName: payment.personName,
          totalPaid: payment.amount,
          paymentsCount: 1,
          avgPaymentTime: 3, // Simplified
          onTimeRate: 85, // Simplified
          lastPayment: payment.paidAt,
        });
      }
    });

    return Array.from(personMap.values()).sort((a, b) => b.totalPaid - a.totalPaid);
  };

  const stats = calculateStats();
  const personStats = calculatePersonStats();
  const uniquePersons = Array.from(new Set(payments.map(p => ({ id: p.personId, name: p.personName }))))
    .filter((person, index, self) => self.findIndex(p => p.id === person.id) === index);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default" className="bg-green-500">Confirmed</Badge>;
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Payment History & Analytics
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExportData(timeRange)}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div>
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="1year">Last year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Person</label>
              <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All people</SelectItem>
                  {uniquePersons.map(person => (
                    <SelectItem key={person.id} value={person.id}>
                      {person.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.paymentCount} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalConfirmed)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPaid > 0 ? Math.round((stats.totalConfirmed / stats.totalPaid) * 100) : 0}% confirmed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Payment Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPaymentTime.toFixed(1)} days</div>
            <p className="text-xs text-muted-foreground">
              Average response time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.paymentCount > 0 ? Math.round((stats.onTimePayments / stats.paymentCount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.onTimePayments} on time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Person Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Person Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personStats.slice(0, 8).map((person) => (
                <div key={person.personId} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{person.personName}</div>
                    <div className="text-sm text-muted-foreground">
                      {person.paymentsCount} payments • {person.onTimeRate}% on time
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(person.totalPaid)}</div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {person.avgPaymentTime} days
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredPayments.slice(0, 8).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{payment.personName}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.billTitle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(payment.paidAt, "MMM d, h:mm a")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(payment.amount)}</div>
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.slice(0, 20).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.personName}
                    </TableCell>
                    <TableCell>{payment.billTitle}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      {format(payment.paidAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No payments found for the selected criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
