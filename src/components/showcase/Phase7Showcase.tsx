"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Search, 
  Filter, 
  Zap, 
  Bell, 
  Users, 
  BarChart3,
  Sparkles
} from "lucide-react";

export function Phase7Showcase() {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">🚀 Phase 7: Enhanced User Experience</CardTitle>
              <p className="text-muted-foreground">
                Advanced features for professional bill management
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <Card className="border border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg">Advanced Search</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Powerful search and filtering system with multiple criteria
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <Filter className="h-3 w-3 mr-1" />
                    Multi-field search
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Amount range filters
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Group & status filters
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-green-600 inline mr-2" />
                  <span className="text-sm font-medium text-green-700">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Bulk operations and smart actions for efficient management
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Bulk select & actions
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Export & reporting
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Smart reminders
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 inline mr-2" />
                  <span className="text-sm font-medium text-blue-700">Active</span>
                </div>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg">Smart Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Intelligent notification system with contextual alerts
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Real-time alerts
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Payment tracking
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Smart grouping
                  </Badge>
                </div>
                <div className="pt-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 inline mr-2" />
                  <span className="text-sm font-medium text-purple-700">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Phase 7 Enhancements Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-green-600 mb-1">✅ Implemented Features:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Advanced multi-criteria search & filtering</li>
                  <li>• Bulk operations with confirmation dialogs</li>
                  <li>• Smart notification center in sidebar</li>
                  <li>• Enhanced bills data table integration</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-600 mb-1">🎯 User Experience Improvements:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Faster bill discovery and management</li>
                  <li>• Streamlined bulk operations workflow</li>
                  <li>• Proactive notification system</li>
                  <li>• Professional enterprise-grade UI/UX</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
