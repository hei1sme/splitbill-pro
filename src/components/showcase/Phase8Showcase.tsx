"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  CreditCard, 
  Bell, 
  Share2, 
  TrendingUp,
  Users, 
  Clock,
  Sparkles
} from "lucide-react";

export function Phase8Showcase() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Sparkles className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-2xl">🎉 Phase 8: Payment Tracking & Communication</CardTitle>
              <p className="text-muted-foreground">
                Streamlined payment management with smart communication tools
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Payment Tracker</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Comprehensive payment status management
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark as paid/unpaid
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Payment confirmations
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Progress overview
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 inline mr-2" />
                  <span className="text-sm font-medium text-blue-700">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg">Smart Reminders</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Automated reminder system with smart timing
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Auto-generated messages
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Bulk reminders
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Smart timing
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-orange-600 inline mr-2" />
                  <span className="text-sm font-medium text-orange-700">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Share2 className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Enhanced QR Sharing</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Professional QR codes with multiple sharing options
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <Share2 className="h-3 w-3 mr-1" />
                    Multi-platform sharing
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Enhanced QR codes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Payment instructions
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 inline mr-2" />
                  <span className="text-sm font-medium text-purple-700">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Payment Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Detailed payment history and performance metrics
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Payment patterns
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Person performance
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Success metrics
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-green-500" />
              Phase 8 Enhancement Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-600 mb-1">✅ Payment Management Features:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Manual payment confirmation workflow</li>
                  <li>• Payment status tracking with timestamps</li>
                  <li>• Receipt upload and proof management</li>
                  <li>• Payment dispute resolution system</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-600 mb-1">🚀 Communication Features:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Smart reminder system with auto-messages</li>
                  <li>• Multi-platform sharing (WhatsApp, Email, etc.)</li>
                  <li>• Enhanced QR codes with instructions</li>
                  <li>• Payment analytics and insights</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
            <h4 className="font-semibold mb-2 flex items-center text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Real-World Payment Flow
            </h4>
            <div className="text-sm text-green-600 space-y-1">
              <p>1. 📱 <strong>Share QR Code</strong> - Send payment details via WhatsApp/Email</p>
              <p>2. 💰 <strong>User Pays</strong> - Scan QR code or use bank details manually</p>
              <p>3. ✅ <strong>Mark as Paid</strong> - User confirms payment in the app</p>
              <p>4. 🔔 <strong>Smart Reminders</strong> - Gentle nudges for unpaid amounts</p>
              <p>5. 📊 <strong>Track Progress</strong> - Real-time payment status overview</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
