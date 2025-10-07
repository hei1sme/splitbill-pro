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
  Building2, 
  Users, 
  Shield, 
  Settings, 
  CreditCard,
  Globe,
  BarChart3,
  FileText,
  Database,
  Lock,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  users: number;
  maxUsers: number;
  features: string[];
  billing: {
    amount: number;
    currency: string;
    interval: 'monthly' | 'yearly';
    nextBilling: string;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: number;
  role: 'admin' | 'manager' | 'member';
  permissions: string[];
}

interface EnterpriseConfigProps {
  onClose: () => void;
}

export function EnterpriseConfig({ onClose }: EnterpriseConfigProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [organization, setOrganization] = useState<Organization>({
    id: 'org-001',
    name: 'Acme Corporation',
    domain: 'acme.com',
    plan: 'enterprise',
    users: 47,
    maxUsers: 100,
    features: [
      'Advanced Analytics',
      'Custom Integrations',
      'Single Sign-On',
      'Advanced Security',
      'Priority Support',
      'Custom Branding'
    ],
    billing: {
      amount: 299,
      currency: 'USD',
      interval: 'monthly',
      nextBilling: '2024-10-03'
    }
  });

  const [teams, setTeams] = useState<Team[]>([
    {
      id: 'team-001',
      name: 'Engineering Team',
      description: 'Software development and technical operations',
      members: 12,
      role: 'admin',
      permissions: ['all']
    },
    {
      id: 'team-002',
      name: 'Sales Team',
      description: 'Sales and customer relations',
      members: 8,
      role: 'manager',
      permissions: ['view_analytics', 'manage_bills', 'export_data']
    },
    {
      id: 'team-003',
      name: 'Finance Team',
      description: 'Financial planning and analysis',
      members: 5,
      role: 'admin',
      permissions: ['all']
    }
  ]);

  const [integrations, setIntegrations] = useState([
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and notifications',
      enabled: true,
      configured: true,
      icon: '💬'
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      description: 'Enterprise communication platform',
      enabled: false,
      configured: false,
      icon: '🔗'
    },
    {
      id: 'quickbooks',
      name: 'QuickBooks',
      description: 'Accounting and financial management',
      enabled: true,
      configured: true,
      icon: '📊'
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Cloud-based accounting software',
      enabled: false,
      configured: false,
      icon: '💼'
    },
    {
      id: 'okta',
      name: 'Okta SSO',
      description: 'Single sign-on and identity management',
      enabled: true,
      configured: true,
      icon: '🔐'
    },
    {
      id: 'azure-ad',
      name: 'Azure Active Directory',
      description: 'Microsoft identity platform',
      enabled: false,
      configured: false,
      icon: '🏢'
    }
  ]);

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Enterprise</Badge>;
      case 'professional':
        return <Badge className="bg-blue-100 text-blue-800"><Zap className="h-3 w-3 mr-1" />Professional</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Starter</Badge>;
    }
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(integration => 
      integration.id === id 
        ? { ...integration, enabled: !integration.enabled }
        : integration
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enterprise Management</h2>
          <p className="text-muted-foreground">
            Advanced organization settings and enterprise features
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {getPlanBadge(organization.plan)}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Organization Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.users}</div>
            <p className="text-xs text-muted-foreground">
              of {organization.maxUsers} maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              Active teams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integrations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.enabled).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${organization.billing.amount}
            </div>
            <p className="text-xs text-muted-foreground">
              Next billing: {organization.billing.nextBilling}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Organization Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={organization.name}
                    onChange={(e) => setOrganization({...organization, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-domain">Domain</Label>
                  <Input
                    id="org-domain"
                    value={organization.domain}
                    onChange={(e) => setOrganization({...organization, domain: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Plan</Label>
                  <div className="flex items-center justify-between">
                    {getPlanBadge(organization.plan)}
                    <Button variant="link" size="sm">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>User Capacity</span>
                    <span>{organization.users}/{organization.maxUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(organization.users / organization.maxUsers) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bills Created</span>
                    <span className="font-medium">2,847</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount Managed</span>
                    <span className="font-medium">$47,392</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Calls</span>
                    <span className="font-medium">15,432</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Management</h3>
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
          
          <div className="space-y-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{team.name}</h4>
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>{team.members} members</span>
                        <Badge variant={team.role === 'admin' ? 'default' : 'secondary'}>
                          {team.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Third-Party Integrations</h3>
            <Button>
              <Globe className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {integration.configured && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={() => toggleIntegration(integration.id)}
                      />
                    </div>
                  </div>
                  {integration.enabled && !integration.configured && (
                    <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Configuration required</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Single Sign-On (SSO)</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable SSO with your identity provider
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Require 2FA for all organization members
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">IP Restrictions</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit access to specific IP addresses
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after 8 hours of inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Data & Privacy</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">
                      Encrypt all data at rest and in transit
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <Lock className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Track all user actions and system events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Retention</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically delete old data after 7 years
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Security Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Current Plan</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-lg">Enterprise Plan</div>
                    <div className="text-sm text-muted-foreground">
                      ${organization.billing.amount}/{organization.billing.interval}
                    </div>
                  </div>
                  {getPlanBadge(organization.plan)}
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium">Included Features:</h5>
                  <ul className="text-sm space-y-1">
                    {organization.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className="w-full">
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Usage & Billing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Period</span>
                    <span>Sep 3 - Oct 3, 2025</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Users</span>
                    <span>{organization.users} of {organization.maxUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>API Calls</span>
                    <span>15,432 of 50,000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Storage</span>
                    <span>2.3 GB of 10 GB</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button variant="outline" className="w-full">
                    View Billing History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
