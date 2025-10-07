"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Receipt, 
  Users, 
  BarChart3, 
  Camera, 
  Settings,
  Plus,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface MobileNavigationProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
  isNew?: boolean;
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const pathname = usePathname();
  const router = useRouter();

  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard'
    },
    {
      id: 'bills',
      label: 'Bills',
      icon: <Receipt className="h-5 w-5" />,
      href: '/bills'
    },
    {
      id: 'groups',
      label: 'Groups',
      icon: <Users className="h-5 w-5" />,
      href: '/groups'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/analytics',
      isNew: true
    }
  ];

  const quickActions = [
    {
      id: 'scan',
      label: 'Scan Receipt',
      icon: <Camera className="h-5 w-5" />,
      action: () => {
        // Would trigger AI expense recognition
        console.log('Opening AI scanner...');
      },
      isNew: true
    },
    {
      id: 'create',
      label: 'New Bill',
      icon: <Plus className="h-5 w-5" />,
      action: () => router.push('/bills/create')
    }
  ];

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Mobile-first responsive detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) {
    return null; // Hide on desktop
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="font-bold text-lg">SplitBill Pro</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                  {notifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Slide-out Panel */}
          <div className="fixed top-16 left-0 bottom-0 w-80 bg-white shadow-xl z-50 md:hidden overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
                  Quick Actions
                </h3>
                <div className="grid gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      onClick={action.action}
                      className="justify-start h-12"
                    >
                      <div className="flex items-center space-x-3">
                        {action.icon}
                        <span>{action.label}</span>
                        {action.isNew && (
                          <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {mainNavItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={isActive(item.href) ? "default" : "ghost"}
                      onClick={() => handleNavigation(item.href)}
                      className="w-full justify-start h-12"
                    >
                      <div className="flex items-center space-x-3">
                        {item.icon}
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge className="ml-auto">{item.badge}</Badge>
                        )}
                        {item.isNew && (
                          <Badge className="ml-auto bg-blue-100 text-blue-800 text-xs">New</Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">
                  More
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/settings')}
                  className="w-full justify-start h-12"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </div>
                </Button>
              </div>

              {/* Phase 9 Highlight */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">🚀 New in Phase 9</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI Receipt Scanning</li>
                  <li>• Smart Analytics</li>
                  <li>• Offline Mode</li>
                  <li>• Push Notifications</li>
                </ul>
                <Button 
                  size="sm" 
                  className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleNavigation('/dashboard')}
                >
                  Explore Features
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 md:hidden">
        <div className="grid grid-cols-4 p-2">
          {mainNavItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              className={`flex flex-col items-center space-y-1 h-16 ${
                isActive(item.href) ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
              {item.isNew && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
          onClick={quickActions[0].action}
        >
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-20 md:hidden"></div>
    </>
  );
}
