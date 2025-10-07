"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CreditCard, 
  Building, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Clock,
  Eye,
  Settings,
  Link,
  Unlink,
  Activity,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'credit';
  accountNumber: string;
  balance: number;
  currency: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  lastSync: string;
  permissions: string[];
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  merchant: string;
  status: 'completed' | 'pending' | 'failed';
  billId?: string;
  verified: boolean;
}

interface PaymentVerification {
  billId: string;
  billTitle: string;
  expectedAmount: number;
  actualAmount?: number;
  paymentDate?: string;
  status: 'pending' | 'verified' | 'failed';
  confidence: number;
}

interface BankingIntegrationProps {
  onClose: () => void;
}

export function BankingIntegration({ onClose }: BankingIntegrationProps) {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: 'acc-001',
      bankName: 'Chase Bank',
      accountType: 'checking',
      accountNumber: '****1234',
      balance: 2847.50,
      currency: 'USD',
      status: 'connected',
      lastSync: '2025-09-03T10:30:00Z',
      permissions: ['read_balance', 'read_transactions', 'verify_payments']
    },
    {
      id: 'acc-002',
      bankName: 'Bank of America',
      accountType: 'credit',
      accountNumber: '****5678',
      balance: -435.20,
      currency: 'USD',
      status: 'connected',
      lastSync: '2025-09-03T10:25:00Z',
      permissions: ['read_balance', 'read_transactions']
    },
    {
      id: 'acc-003',
      bankName: 'Wells Fargo',
      accountType: 'savings',
      accountNumber: '****9012',
      balance: 15420.75,
      currency: 'USD',
      status: 'disconnected',
      lastSync: '2025-08-28T14:20:00Z',
      permissions: []
    }
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'txn-001',
      amount: 87.45,
      description: 'MARIO\'S ITALIAN RESTAURANT',
      date: '2025-09-02T19:30:00Z',
      category: 'Restaurants',
      merchant: 'Mario\'s Italian Restaurant',
      status: 'completed',
      billId: 'bill-123',
      verified: true
    },
    {
      id: 'txn-002',
      amount: 45.20,
      description: 'UBER EATS',
      date: '2025-09-02T12:15:00Z',
      category: 'Food Delivery',
      merchant: 'Uber Eats',
      status: 'completed',
      verified: false
    },
    {
      id: 'txn-003',
      amount: 23.50,
      description: 'STARBUCKS COFFEE',
      date: '2025-09-01T08:45:00Z',
      category: 'Coffee & Tea',
      merchant: 'Starbucks',
      status: 'completed',
      verified: false
    }
  ]);

  const [verifications, setVerifications] = useState<PaymentVerification[]>([
    {
      billId: 'bill-123',
      billTitle: 'Team Dinner at Mario\'s',
      expectedAmount: 87.45,
      actualAmount: 87.45,
      paymentDate: '2025-09-02T19:30:00Z',
      status: 'verified',
      confidence: 0.98
    },
    {
      billId: 'bill-124',
      billTitle: 'Office Lunch Order',
      expectedAmount: 45.20,
      status: 'pending',
      confidence: 0.85
    }
  ]);

  const handleSyncAccount = async (accountId: string) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, lastSync: new Date().toISOString() }
        : acc
    ));
    setIsLoading(false);
  };

  const handleConnectAccount = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'connected', lastSync: new Date().toISOString() }
        : acc
    ));
  };

  const handleDisconnectAccount = (accountId: string) => {
    setAccounts(accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, status: 'disconnected', permissions: [] }
        : acc
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Disconnected</Badge>;
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Building className="h-5 w-5 text-blue-500" />;
      case 'credit':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'savings':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      default:
        return <Building className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Banking Integration</h2>
          <p className="text-muted-foreground">
            Connect your bank accounts for real-time payment verification
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Bank-Grade Security
          </Badge>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {accounts.filter(acc => acc.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {accounts.length} total accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {verifications.filter(v => v.status === 'verified').length}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m</div>
            <p className="text-xs text-muted-foreground">
              ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bank Accounts</h3>
            <Button>
              <Link className="h-4 w-4 mr-2" />
              Connect Account
            </Button>
          </div>

          <div className="space-y-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getAccountIcon(account.accountType)}
                      <div>
                        <h4 className="font-semibold">{account.bankName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} • {account.accountNumber}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          {getStatusBadge(account.status)}
                          <span className="text-sm text-muted-foreground">
                            Last sync: {formatDate(account.lastSync)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {account.status === 'connected' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSyncAccount(account.id)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnectAccount(account.id)}
                            >
                              <Unlink className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnectAccount(account.id)}
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {account.permissions.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h5 className="text-sm font-medium mb-2">Permissions</h5>
                      <div className="flex flex-wrap gap-2">
                        {account.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{transaction.merchant}</h4>
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {transaction.verified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </div>
                        {transaction.billId && (
                          <Button variant="link" size="sm" className="p-0 h-auto">
                            View Bill
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Payment Verification</h3>
            <Button>
              <Eye className="h-4 w-4 mr-2" />
              Verify All
            </Button>
          </div>

          <div className="space-y-4">
            {verifications.map((verification) => (
              <Card key={verification.billId}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{verification.billTitle}</h4>
                      <p className="text-sm text-muted-foreground">
                        Expected: {formatCurrency(verification.expectedAmount)}
                        {verification.actualAmount && (
                          <span> • Actual: {formatCurrency(verification.actualAmount)}</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {verification.status === 'verified' ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : verification.status === 'failed' ? (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {Math.round(verification.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {verification.paymentDate && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {formatDate(verification.paymentDate)}
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Sync Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-sync transactions</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync new transactions every hour
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Real-time verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Verify payments as soon as they appear
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">SMS notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of payment verifications
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">Bank-Grade Security</span>
                  </div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• 256-bit SSL encryption</li>
                    <li>• Read-only access permissions</li>
                    <li>• No storage of banking credentials</li>
                    <li>• SOC 2 Type II certified</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data retention period</Label>
                  <Input id="data-retention" defaultValue="90 days" />
                </div>

                <Button variant="outline" className="w-full">
                  View Security Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
