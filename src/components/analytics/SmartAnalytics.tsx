"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Brain,
  AlertTriangle,
  Target,
  PieChart,
  BarChart3,
  LineChart,
  Zap
} from 'lucide-react';

interface AnalyticsData {
  totalSpent: number;
  monthlyAverage: number;
  topCategory: string;
  frequentPayers: string[];
  trends: {
    spending: 'up' | 'down' | 'stable';
    frequency: 'up' | 'down' | 'stable';
    groupSize: 'up' | 'down' | 'stable';
  };
  predictions: {
    nextMonthSpending: number;
    budgetRecommendation: number;
    savingsOpportunity: number;
  };
  insights: Array<{
    type: 'warning' | 'info' | 'success';
    title: string;
    description: string;
    action?: string;
  }>;
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface SmartAnalyticsProps {
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

// Mock analytics data - would come from AI analysis service
const generateAnalyticsData = (timeRange: string): AnalyticsData => {
  const baseSpending = timeRange === '7d' ? 250 : timeRange === '30d' ? 1200 : timeRange === '90d' ? 3600 : 14400;
  
  return {
    totalSpent: baseSpending + Math.random() * 200,
    monthlyAverage: baseSpending / (timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12),
    topCategory: ['Restaurants', 'Groceries', 'Entertainment', 'Transportation'][Math.floor(Math.random() * 4)],
    frequentPayers: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
    trends: {
      spending: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      frequency: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
      groupSize: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
    },
    predictions: {
      nextMonthSpending: baseSpending * 1.1 + Math.random() * 100,
      budgetRecommendation: baseSpending * 0.9,
      savingsOpportunity: Math.random() * 200 + 50,
    },
    insights: [
      {
        type: 'warning',
        title: 'High Restaurant Spending',
        description: 'Your group spent 40% more on restaurants this month compared to last month.',
        action: 'Set dining budget'
      },
      {
        type: 'info',
        title: 'New Spending Pattern',
        description: 'Weekend expenses are 60% higher than weekdays. Consider planning ahead.',
        action: 'View breakdown'
      },
      {
        type: 'success',
        title: 'Savings Opportunity',
        description: 'You could save $75/month by optimizing recurring group expenses.',
        action: 'View suggestions'
      }
    ],
    categories: [
      { name: 'Restaurants', amount: baseSpending * 0.4, percentage: 40, trend: 'up' },
      { name: 'Groceries', amount: baseSpending * 0.25, percentage: 25, trend: 'stable' },
      { name: 'Entertainment', amount: baseSpending * 0.2, percentage: 20, trend: 'down' },
      { name: 'Transportation', amount: baseSpending * 0.15, percentage: 15, trend: 'up' },
    ]
  };
};

export function SmartAnalytics({ timeRange, onTimeRangeChange }: SmartAnalyticsProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const analyticsData = useMemo(() => generateAnalyticsData(timeRange), [timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightIcon = (type: 'warning' | 'info' | 'success') => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'info': return <Brain className="h-4 w-4 text-blue-500" />;
      case 'success': return <Target className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Analytics</h2>
          <p className="text-muted-foreground">
            AI-powered insights into your group spending patterns
          </p>
        </div>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '1y'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTimeRangeChange(range as any)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.totalSpent.toFixed(2)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analyticsData.trends.spending)}
              <span className={getTrendColor(analyticsData.trends.spending)}>
                {analyticsData.trends.spending === 'up' ? '+12%' : analyticsData.trends.spending === 'down' ? '-8%' : '0%'} from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsData.monthlyAverage.toFixed(2)}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analyticsData.trends.frequency)}
              <span className={getTrendColor(analyticsData.trends.frequency)}>
                Based on {timeRange} data
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.topCategory}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.categories.find(c => c.name === analyticsData.topCategory)?.percentage}% of total spending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Group Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.frequentPayers.length}</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getTrendIcon(analyticsData.trends.groupSize)}
              <span className={getTrendColor(analyticsData.trends.groupSize)}>
                Active members
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Spending Trends</span>
                </CardTitle>
                <CardDescription>How your group spending has changed over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Week 1</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-16 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">$320</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Week 2</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">$240</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Week 3</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-18 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">$360</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Week 4</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">$280</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Top Contributors</span>
                </CardTitle>
                <CardDescription>Most active group members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.frequentPayers.map((payer, index) => (
                    <div key={payer} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium">{payer}</span>
                      </div>
                      <Badge variant="secondary">
                        {Math.floor(Math.random() * 5) + 3} bills
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Next Month Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  ${analyticsData.predictions.nextMonthSpending.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on current spending patterns and seasonal trends
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-green-500" />
                  <span>Recommended Budget</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ${analyticsData.predictions.budgetRecommendation.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Optimal budget to maintain current lifestyle
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <span>Savings Potential</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  ${analyticsData.predictions.savingsOpportunity.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Potential monthly savings with optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="space-y-4">
            {analyticsData.insights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button variant="link" size="sm" className="mt-2 p-0 h-auto">
                          {insight.action} →
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="space-y-4">
            {analyticsData.categories.map((category) => (
              <Card key={category.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{category.name}</h4>
                    <div className="flex items-center space-x-2">
                      {getTrendIcon(category.trend)}
                      <span className="font-bold">${category.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.percentage}% of total spending
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
