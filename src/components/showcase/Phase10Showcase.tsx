"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnterpriseConfig } from '@/components/enterprise/EnterpriseConfig';
import { BankingIntegration } from '@/components/banking/BankingIntegration';
import { Internationalization } from '@/components/i18n/Internationalization';
import { 
  Building2, 
  CreditCard, 
  Globe, 
  Shield,
  Crown,
  Zap,
  TrendingUp,
  Users,
  CheckCircle,
  Star,
  Rocket,
  ArrowRight,
  Database,
  Lock,
  Settings
} from 'lucide-react';

interface Phase10ShowcaseProps {
  onFeatureSelect?: (feature: string) => void;
}

export function Phase10Showcase({ onFeatureSelect }: Phase10ShowcaseProps) {
  const [selectedDemo, setSelectedDemo] = useState<'enterprise' | 'banking' | 'i18n' | null>(null);

  const features = [
    {
      id: 'enterprise-management',
      title: 'Enterprise Management',
      description: 'Complete organization management with teams, billing, and advanced security',
      icon: <Building2 className="h-8 w-8 text-purple-500" />,
      status: 'live',
      tier: 'enterprise',
      highlights: ['Multi-team organization', 'Advanced security', 'SSO integration', 'Usage analytics'],
      demo: 'enterprise'
    },
    {
      id: 'banking-integration',
      title: 'Real-Time Banking',
      description: 'Connect bank accounts for automatic payment verification and transaction matching',
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      status: 'live',
      tier: 'professional',
      highlights: ['Bank-grade security', 'Real-time verification', 'Multiple accounts', 'Auto-sync'],
      demo: 'banking'
    },
    {
      id: 'internationalization',
      title: 'Global Localization',
      description: 'Multi-language support with regional formatting and currency localization',
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      status: 'live',
      tier: 'professional',
      highlights: ['8+ languages', 'Regional formats', 'Community translation', 'Auto-detection'],
      demo: 'i18n'
    },
    {
      id: 'advanced-security',
      title: 'Enterprise Security',
      description: 'Advanced security features including audit logs, compliance, and data governance',
      icon: <Shield className="h-8 w-8 text-red-500" />,
      status: 'preview',
      tier: 'enterprise',
      highlights: ['SOC 2 compliance', 'Audit logging', 'Data encryption', 'IP restrictions'],
      demo: null
    }
  ];

  const stats = [
    { label: 'Enterprise Ready', value: '100%', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Security Rating', value: 'A+', icon: <Shield className="h-4 w-4" /> },
    { label: 'Bank Integration', value: '50+', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Global Reach', value: '8 Languages', icon: <Globe className="h-4 w-4" /> }
  ];

  const enterpriseFeatures = [
    'Multi-organization support',
    'Advanced team management',
    'Single Sign-On (SSO)',
    'Real-time banking integration',
    'Custom integrations API',
    'Advanced analytics & reporting',
    'Multi-language support',
    'Enterprise-grade security',
    'Priority support',
    'Custom branding'
  ];

  const handleDemoClose = () => {
    setSelectedDemo(null);
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>;
      case 'professional':
        return <Badge className="bg-blue-100 text-blue-800"><Zap className="h-3 w-3 mr-1" />Professional</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Standard</Badge>;
    }
  };

  if (selectedDemo === 'enterprise') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Enterprise Management Demo</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <EnterpriseConfig onClose={handleDemoClose} />
      </div>
    );
  }

  if (selectedDemo === 'banking') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Banking Integration Demo</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <BankingIntegration onClose={handleDemoClose} />
      </div>
    );
  }

  if (selectedDemo === 'i18n') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Internationalization Demo</h2>
          <Button variant="outline" onClick={handleDemoClose}>
            ← Back to Overview
          </Button>
        </div>
        <Internationalization onClose={handleDemoClose} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <span>Phase 10: Enterprise & Real-World Integration</span>
            </CardTitle>
            <CardDescription className="mt-2">
              Enterprise-grade features with real banking integration and global localization
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
            Enterprise Ready
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
          <h3 className="text-lg font-semibold mb-4">🏢 Enterprise Features</h3>
          
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
                          {getTierBadge(feature.tier)}
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

        {/* Enterprise Package Highlight */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-semibold text-lg mb-2 flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span>Enterprise Package</span>
              </h4>
              <p className="text-muted-foreground">
                Complete solution for large organizations with advanced requirements
              </p>
            </div>
            <Badge className="bg-purple-100 text-purple-800">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          </div>
          
          <div className="grid gap-4 md:grid-cols-3 text-sm mb-4">
            <div>
              <h5 className="font-medium mb-2">🏢 Organization Management</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Multi-team organization</li>
                <li>• Advanced user management</li>
                <li>• Custom role permissions</li>
                <li>• Billing & usage analytics</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🔒 Security & Compliance</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Single Sign-On (SSO)</li>
                <li>• Two-factor authentication</li>
                <li>• Audit logging</li>
                <li>• Data encryption</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🌐 Global Features</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Multi-language support</li>
                <li>• Regional formatting</li>
                <li>• Banking integrations</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {enterpriseFeatures.slice(0, 6).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              +{enterpriseFeatures.length - 6} more...
            </Badge>
          </div>
        </div>

        {/* Architecture Highlights */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
          <h4 className="font-semibold text-lg mb-3 flex items-center space-x-2">
            <Database className="h-5 w-5 text-blue-600" />
            <span>Enterprise Architecture</span>
          </h4>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div>
              <h5 className="font-medium mb-2">🏗 Infrastructure</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Cloud-native architecture</li>
                <li>• Auto-scaling capabilities</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Global CDN deployment</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🔐 Security Standards</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• SOC 2 Type II certified</li>
                <li>• GDPR compliant</li>
                <li>• Bank-grade encryption</li>
                <li>• Regular security audits</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🔗 Integrations</h5>
              <ul className="space-y-1 text-muted-foreground">
                <li>• RESTful API</li>
                <li>• Webhook support</li>
                <li>• Third-party connectors</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setSelectedDemo('enterprise')} className="bg-purple-600 hover:bg-purple-700">
            <Building2 className="h-4 w-4 mr-2" />
            Enterprise Management
          </Button>
          <Button onClick={() => setSelectedDemo('banking')} className="bg-green-600 hover:bg-green-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Banking Integration
          </Button>
          <Button onClick={() => setSelectedDemo('i18n')} className="bg-blue-600 hover:bg-blue-700">
            <Globe className="h-4 w-4 mr-2" />
            Global Localization
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
