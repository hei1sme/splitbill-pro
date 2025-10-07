"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Smartphone, 
  Download, 
  Wifi, 
  WifiOff, 
  Cloud, 
  RefreshCw, 
  Bell,
  MapPin,
  Camera,
  Settings,
  Shield,
  Battery,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface PWAFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  status: 'available' | 'pending' | 'unavailable';
}

interface PWAConfigProps {
  onClose: () => void;
}

export function PWAConfig({ onClose }: PWAConfigProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [features, setFeatures] = useState<PWAFeature[]>([
    {
      id: 'offline',
      name: 'Offline Mode',
      description: 'Access your bills even without internet connection',
      enabled: true,
      icon: <WifiOff className="h-5 w-5" />,
      status: 'available'
    },
    {
      id: 'notifications',
      name: 'Push Notifications',
      description: 'Get reminders for payments and bill updates',
      enabled: true,
      icon: <Bell className="h-5 w-5" />,
      status: 'available'
    },
    {
      id: 'camera',
      name: 'Camera Access',
      description: 'Take photos of receipts for expense tracking',
      enabled: true,
      icon: <Camera className="h-5 w-5" />,
      status: 'available'
    },
    {
      id: 'location',
      name: 'Location Services',
      description: 'Auto-detect venues for location-based expenses',
      enabled: false,
      icon: <MapPin className="h-5 w-5" />,
      status: 'pending'
    },
    {
      id: 'sync',
      name: 'Background Sync',
      description: 'Sync data automatically when connection is restored',
      enabled: true,
      icon: <RefreshCw className="h-5 w-5" />,
      status: 'available'
    }
  ]);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    if (result.outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
    }
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(feature => 
      feature.id === featureId 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mobile App Settings</h2>
          <p className="text-muted-foreground">
            Configure your Progressive Web App experience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Installation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6" />
            <span>App Installation</span>
          </CardTitle>
          <CardDescription>
            Install SplitBill Pro as a mobile app for the best experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInstalled ? (
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-900">App Installed</h4>
                <p className="text-sm text-green-700">
                  SplitBill Pro is installed and ready to use offline
                </p>
              </div>
            </div>
          ) : installPrompt ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Ready to Install</h4>
                  <p className="text-sm text-blue-700">
                    Add SplitBill Pro to your home screen for quick access
                  </p>
                </div>
                <Button onClick={handleInstallApp} className="bg-blue-600 hover:bg-blue-700">
                  Install App
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div className="flex items-center space-x-2">
                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className="h-4 w-4 text-muted-foreground" />
                  <span>Battery efficient</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Installation Not Available</h4>
                <p className="text-sm text-gray-700">
                  Use a supported browser (Chrome, Firefox, Safari) to install the app
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-6 w-6" />
            <span>App Features</span>
          </CardTitle>
          <CardDescription>
            Control which mobile features are enabled for your app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{feature.name}</h4>
                      {getStatusIcon(feature.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                  <Switch
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id)}
                    disabled={feature.status === 'unavailable'}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Offline Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-6 w-6" />
            <span>Offline Storage</span>
          </CardTitle>
          <CardDescription>
            Manage how your data is stored for offline access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2.3 MB</div>
                <div className="text-sm text-blue-700">Cached Data</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-green-700">Bills Stored</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">24h</div>
                <div className="text-sm text-purple-700">Last Sync</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-sync when online</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync changes when internet connection is available
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Cache recent bills</Label>
                <p className="text-sm text-muted-foreground">
                  Keep recent bills available for offline viewing
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Security & Privacy</span>
          </CardTitle>
          <CardDescription>
            Control how your data is protected in the mobile app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Biometric authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Use fingerprint or face unlock to secure your app
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Auto-lock timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically lock the app after 5 minutes of inactivity
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Encrypted local storage</Label>
                <p className="text-sm text-muted-foreground">
                  Encrypt all data stored locally on your device
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
