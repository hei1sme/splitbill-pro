"use client";

import React, { useState } from "react";
import {
  Bell,
  Clock,
  Send,
  MessageSquare,
  Smartphone,
  Mail,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ReminderSettings {
  autoReminder: boolean;
  reminderDays: number[];
  customMessage: string;
  includeQR: boolean;
  includeDeadline: boolean;
}

interface UnpaidSplit {
  id: string;
  personId: string;
  personName: string;
  personContact?: string;
  amount: number;
  daysSinceCreated: number;
  lastReminderSent?: Date;
}

interface SmartReminderProps {
  billId: string;
  billTitle: string;
  unpaidSplits: UnpaidSplit[];
  onSendReminder: (splitIds: string[], message: string, includeQR: boolean) => void;
  onUpdateReminderSettings: (settings: ReminderSettings) => void;
  defaultSettings?: ReminderSettings;
}

export function SmartReminder({
  billId,
  billTitle,
  unpaidSplits,
  onSendReminder,
  onUpdateReminderSettings,
  defaultSettings = {
    autoReminder: false,
    reminderDays: [3, 7, 14],
    customMessage: "",
    includeQR: true,
    includeDeadline: false,
  },
}: SmartReminderProps) {
  const [selectedSplits, setSelectedSplits] = useState<string[]>([]);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [settings, setSettings] = useState<ReminderSettings>(defaultSettings);

  const totalUnpaidAmount = unpaidSplits.reduce((sum, split) => sum + split.amount, 0);

  const generateSmartMessage = (splits: UnpaidSplit[]) => {
    const names = splits.map(s => s.personName).join(", ");
    const amount = splits.reduce((sum, s) => sum + s.amount, 0);
    
    return `Hi ${names}! 👋

Just a friendly reminder about the "${billTitle}" bill. 

💰 Amount due: $${amount.toFixed(2)}
📅 Days since created: ${Math.max(...splits.map(s => s.daysSinceCreated))}

You can pay using the QR code attached or let me know when you've transferred the money. Thanks! 😊`;
  };

  const getUrgencyBadge = (daysSince: number) => {
    if (daysSince >= 14) return <Badge variant="destructive">Urgent</Badge>;
    if (daysSince >= 7) return <Badge variant="secondary">Follow-up</Badge>;
    return <Badge variant="outline">Recent</Badge>;
  };

  const getReminderSuggestion = (split: UnpaidSplit) => {
    const { daysSinceCreated, lastReminderSent } = split;
    
    if (!lastReminderSent) {
      if (daysSinceCreated >= 3) return "Ready for first reminder";
      return "Too early for reminder";
    }
    
    const daysSinceLastReminder = Math.floor(
      (Date.now() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastReminder >= 7) return "Ready for follow-up";
    if (daysSinceLastReminder >= 3) return "Consider follow-up";
    return "Recently reminded";
  };

  const handleSendReminder = () => {
    if (selectedSplits.length === 0) {
      toast.error("Please select at least one person to remind");
      return;
    }

    const message = customMessage || generateSmartMessage(
      unpaidSplits.filter(s => selectedSplits.includes(s.id))
    );

    onSendReminder(selectedSplits, message, settings.includeQR);
    setReminderDialog(false);
    setSelectedSplits([]);
    setCustomMessage("");
    toast.success(`Reminder sent to ${selectedSplits.length} people`);
  };

  const handleSelectAll = () => {
    if (selectedSplits.length === unpaidSplits.length) {
      setSelectedSplits([]);
    } else {
      setSelectedSplits(unpaidSplits.map(s => s.id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Reminder Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Smart Reminders
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsDialog(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {unpaidSplits.length}
              </div>
              <div className="text-sm text-muted-foreground">Unpaid People</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalUnpaidAmount)}
              </div>
              <div className="text-sm text-muted-foreground">Outstanding</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {unpaidSplits.filter(s => s.daysSinceCreated >= 7).length}
              </div>
              <div className="text-sm text-muted-foreground">Overdue (7+ days)</div>
            </div>
          </div>

          {unpaidSplits.length > 0 && (
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setReminderDialog(true)}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
              <Button
                variant="outline"
                onClick={handleSelectAll}
              >
                {selectedSplits.length === unpaidSplits.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unpaid People List */}
      {unpaidSplits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              People to Remind
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpaidSplits.map((split) => (
                <div
                  key={split.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={selectedSplits.includes(split.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSplits([...selectedSplits, split.id]);
                        } else {
                          setSelectedSplits(selectedSplits.filter(id => id !== split.id));
                        }
                      }}
                    />
                    <div>
                      <div className="font-medium">{split.personName}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(split.amount)} • {split.daysSinceCreated} days ago
                      </div>
                      {split.lastReminderSent && (
                        <div className="text-xs text-muted-foreground">
                          Last reminded {formatDistanceToNow(split.lastReminderSent, { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getUrgencyBadge(split.daysSinceCreated)}
                    <div className="text-xs text-muted-foreground text-right">
                      {getReminderSuggestion(split)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Send Reminder Dialog */}
      <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder to {selectedSplits.length} selected people
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Message Preview</label>
              <Textarea
                placeholder="Use the auto-generated message or write your own..."
                value={customMessage || generateSmartMessage(
                  unpaidSplits.filter(s => selectedSplits.includes(s.id))
                )}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.includeQR}
                onCheckedChange={(checked) => 
                  setSettings({...settings, includeQR: !!checked})
                }
              />
              <label className="text-sm">Include QR code for payment</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReminderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReminder}>
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reminder Settings Dialog */}
      <Dialog open={settingsDialog} onOpenChange={setSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reminder Settings</DialogTitle>
            <DialogDescription>
              Configure automatic reminder preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.autoReminder}
                onCheckedChange={(checked) => 
                  setSettings({...settings, autoReminder: !!checked})
                }
              />
              <label className="text-sm">Enable automatic reminders</label>
            </div>
            
            <div>
              <label className="text-sm font-medium">Send reminders after (days)</label>
              <div className="flex space-x-2 mt-2">
                {[1, 3, 7, 14, 30].map(day => (
                  <label key={day} className="flex items-center space-x-1">
                    <Checkbox
                      checked={settings.reminderDays.includes(day)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSettings({
                            ...settings,
                            reminderDays: [...settings.reminderDays, day].sort((a, b) => a - b)
                          });
                        } else {
                          setSettings({
                            ...settings,
                            reminderDays: settings.reminderDays.filter(d => d !== day)
                          });
                        }
                      }}
                    />
                    <span className="text-sm">{day}d</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={settings.includeQR}
                onCheckedChange={(checked) => 
                  setSettings({...settings, includeQR: !!checked})
                }
              />
              <label className="text-sm">Always include QR code</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onUpdateReminderSettings(settings);
              setSettingsDialog(false);
              toast.success("Reminder settings updated");
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
