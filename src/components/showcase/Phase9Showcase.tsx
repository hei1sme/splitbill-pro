"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SmartAnalytics } from '@/components/analytics/SmartAnalytics';
import { ExpenseRecognition } from '@/components/ai/ExpenseRecognition';
import { PWAConfig } from '@/components/mobile/PWAConfig';
import { 
  Brain, 
  Smartphone, 
  BarChart3, 
  Camera, 
  Zap,
  TrendingUp,
  Eye,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star
} from 'lucide-react';

interface Phase9ShowcaseProps {
  onFeatureSelect?: (feature: string) => void;
}

export function Phase9Showcase({ onFeatureSelect }: Phase9ShowcaseProps) {
  const [selectedDemo, setSelectedDemo] = useState<'analytics' | 'ai' | 'mobile' | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const features = [
    {
      id: 'smart-analytics',
      title: 'Smart Analytics Dashboard',
      description: 'AI-powered insights into spending patterns, predictions, and recommendations',
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      status: 'live',
      highlights: ['Spending predictions', 'AI insights', 'Trend analysis', 'Budget recommendations'],
      demo: 'analytics'
    },
    {
      id: 'expense-recognition',
      title: 'AI Expense Recognition',
      description: 'Scan receipts with AI to automatically extract expense details',
      icon: <Camera className="h-8 w-8 text-green-500" />,
      status: 'live',
      highlights: ['OCR scanning', 'Smart categorization', 'Multi-language support', 'Confidence scoring'],
      demo: 'ai'
    },
    {
      id: 'mobile-pwa',
      title: 'Progressive Web App',
      description: 'Mobile-first experience with offline capabilities and native features',
      icon: <Smartphone className="h-8 w-8 text-purple-500" />,
      status: 'live',
      highlights: ['Offline mode', 'Push notifications', 'Home screen install', 'Background sync'],
      demo: 'mobile'
    },
    {
      id: 'predictive-insights',
      title: 'Predictive Intelligence',
      description: 'Machine learning models for expense forecasting and anomaly detection',
      icon: <Brain className="h-8 w-8 text-amber-500" />,
      status: 'preview',
      highlights: ['Spending forecasts', 'Anomaly detection', 'Budget optimization', 'Smart suggestions'],
      demo: null
    }
  ];

  const stats = [
    { label: 'AI Accuracy', value: '94%', icon: <Eye className="h-4 w-4" /> },
    { label: 'Processing Speed', value: '2.3s', icon: <Zap className="h-4 w-4" /> },
    { label: 'Mobile Users', value: '78%', icon: <Smartphone className="h-4 w-4" /> },
    { label: 'User Satisfaction', value: '4.8/5', icon: <Star className="h-4 w-4" /> }
  ];

  const handleDemoClose = () => {
    setSelectedDemo(null);
  };

  const handleExpenseRecognized = (expense: any) => {
    console.log('Expense recognized:', expense);
    setSelectedDemo(null);
    // In real app, would navigate to create bill with pre-filled data
  };

  if (selectedDemo === 'analytics') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Smart Analytics Demo</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <SmartAnalytics 
          timeRange={timeRange} 
          onTimeRangeChange={setTimeRange}
        />
      </div>
    );
  }

  if (selectedDemo === 'ai') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">AI Expense Recognition Demo</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <ExpenseRecognition 
          onExpenseRecognized={handleExpenseRecognized}
          onCancel={handleDemoClose}
        />
      </div>
    );
  }

  if (selectedDemo === 'mobile') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mobile PWA Configuration</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <PWAConfig onClose={handleDemoClose} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span>Phase 9: Advanced Analytics & Intelligence</span>
            </CardTitle>
            <CardDescription className="mt-2">
              Next-generation features powered by AI, analytics, and mobile-first design
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            Latest Features
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-white rounded-full">
                {stat.icon}
              </div>
              <div>
                <div className="font-bold text-lg">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">🚀 New Features Available</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {feature.icon}
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            className={feature.status === 'live' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                            }
                          >
                            {feature.status === 'live' ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Live
                              </>
                            ) : (
                              'Preview'
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Key Features:</h5>
                    <ul className="grid gap-1 text-sm text-muted-foreground">
                      {feature.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {feature.demo && (
                    <Button 
                      onClick={() => setSelectedDemo(feature.demo as any)}
                      className="w-full group-hover:bg-blue-600"
                    >
                      Try Demo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                  
                  {!feature.demo && (
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>Advanced Technology Stack</span>
          </h4>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h5 className="font-medium mb-2">🤖 AI & Machine Learning</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Computer Vision (OCR)</li>
                <li>• Natural Language Processing</li>
                <li>• Predictive Analytics</li>
                <li>• Anomaly Detection</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">📱 Mobile Technologies</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Progressive Web App</li>
                <li>• Service Workers</li>
                <li>• WebRTC Camera API</li>
                <li>• Push Notifications</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">📊 Analytics & Insights</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Real-time Analytics</li>
                <li>• Data Visualization</li>
                <li>• Trend Analysis</li>
                <li>• Custom Dashboards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setSelectedDemo('analytics')} className="bg-blue-600 hover:bg-blue-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button onClick={() => setSelectedDemo('ai')} className="bg-green-600 hover:bg-green-700">
            <Camera className="h-4 w-4 mr-2" />
            Try AI Scanner
          </Button>
          <Button onClick={() => setSelectedDemo('mobile')} className="bg-purple-600 hover:bg-purple-700">
            <Download className="h-4 w-4 mr-2" />
            Install Mobile App
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
