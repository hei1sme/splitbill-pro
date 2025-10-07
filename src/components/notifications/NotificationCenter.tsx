"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  Check,
  X,
  Clock,
  DollarSign,
  Users,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "payment_due" | "payment_received" | "bill_created" | "settlement_complete" | "reminder" | "system";
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    billId?: string;
    amount?: number;
    fromUser?: string;
    toUser?: string;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onNotificationClick,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "payment_due":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "payment_received":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "bill_created":
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case "settlement_complete":
        return <Check className="h-4 w-4 text-green-500" />;
      case "reminder":
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case "system":
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "payment_due":
        return "border-l-orange-500";
      case "payment_received":
        return "border-l-green-500";
      case "bill_created":
        return "border-l-blue-500";
      case "settlement_complete":
        return "border-l-green-500";
      case "reminder":
        return "border-l-yellow-500";
      case "system":
        return "border-l-gray-500";
      default:
        return "border-l-gray-300";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onNotificationClick(notification);
    setIsOpen(false);
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
                    <div key={date}>
                      <div className="px-4 py-2 bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground">
                          {new Date(date).toDateString() === new Date().toDateString()
                            ? "Today"
                            : formatDistanceToNow(new Date(date), { addSuffix: true })
                          }
                        </p>
                      </div>
                      {dateNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`
                            border-l-4 ${getNotificationColor(notification.type)}
                            ${!notification.read ? "bg-muted/30" : ""}
                            hover:bg-muted/50 cursor-pointer
                          `}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium leading-none">
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {notification.message}
                                  </p>
                                  {notification.metadata?.amount && (
                                    <p className="text-xs font-medium text-green-600">
                                      ${notification.metadata.amount.toFixed(2)}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

// Smart Notification Generator Hook
export function useSmartNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Smart notification generators
  const notifyPaymentDue = (billName: string, amount: number, dueDate: Date) => {
    addNotification({
      type: "payment_due",
      title: "Payment Due Soon",
      message: `Payment for "${billName}" is due ${formatDistanceToNow(dueDate, { addSuffix: true })}`,
      metadata: { amount },
    });
  };

  const notifyPaymentReceived = (fromUser: string, amount: number, billName: string) => {
    addNotification({
      type: "payment_received",
      title: "Payment Received",
      message: `${fromUser} paid $${amount.toFixed(2)} for "${billName}"`,
      metadata: { amount, fromUser },
    });
  };

  const notifyBillCreated = (billName: string, amount: number, creator: string) => {
    addNotification({
      type: "bill_created",
      title: "New Bill Created",
      message: `${creator} created "${billName}" for $${amount.toFixed(2)}`,
      metadata: { amount },
    });
  };

  const notifySettlementComplete = (billName: string) => {
    addNotification({
      type: "settlement_complete",
      title: "Bill Settled",
      message: `"${billName}" has been fully settled`,
    });
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    // Smart generators
    notifyPaymentDue,
    notifyPaymentReceived,
    notifyBillCreated,
    notifySettlementComplete,
  };
}
