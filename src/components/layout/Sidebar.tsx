"use client";

import Link from 'next/link';
import { Home, Banknote, Users, User, FileText, Plus } from 'lucide-react';
import { NotificationCenter, useSmartNotifications } from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/banks', label: 'Banks', icon: Banknote },
  { href: '/people', label: 'People', icon: User },
  { href: '/groups', label: 'Groups', icon: Users },
  { href: '/bills', label: 'Bills Archive', icon: FileText },
];

export function Sidebar() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useSmartNotifications();

  const handleNotificationClick = (notification: any) => {
    // Handle notification click - could navigate to relevant page
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <aside className="w-64 h-screen p-4 glass-card" suppressHydrationWarning>
      <div className="flex items-center justify-between mb-8" suppressHydrationWarning>
        <div className="text-2xl font-bold" suppressHydrationWarning>SplitBill</div>
        <NotificationCenter
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
          onNotificationClick={handleNotificationClick}
        />
      </div>
      
      {/* Prominent Add Bill Button */}
      <div className="mb-6" suppressHydrationWarning>
        <Link href="/bills?action=add">
          <Button className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl">
            <Plus className="w-5 h-5 mr-2" />
            Add New Bill
          </Button>
        </Link>
      </div>

      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="flex items-center p-2 rounded-lg hover:bg-primary/10">
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
