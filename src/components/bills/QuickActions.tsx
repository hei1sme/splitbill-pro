"use client";

import React, { useState } from "react";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Share,
  Download,
  Copy,
  Archive,
  CheckSquare,
  Square,
  DollarSign,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Bill {
  id: string;
  name: string;
  totalAmount: number;
  status: "PENDING" | "PARTIAL" | "SETTLED";
  createdAt: string;
}

interface QuickActionsProps {
  selectedBills: string[];
  onSelectionChange: (billIds: string[]) => void;
  bills: Bill[];
  onBulkAction: (action: string, billIds: string[]) => void;
}

export function QuickActions({
  selectedBills,
  onSelectionChange,
  bills,
  onBulkAction,
}: QuickActionsProps) {
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");

  const selectedBillsData = bills.filter((bill) =>
    selectedBills.includes(bill.id)
  );

  const totalSelectedAmount = selectedBillsData.reduce(
    (sum, bill) => sum + bill.totalAmount,
    0
  );

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  const confirmBulkAction = () => {
    onBulkAction(bulkAction, selectedBills);
    setShowBulkDialog(false);
    onSelectionChange([]);
    
    const actionMessages = {
      delete: "Bills deleted successfully",
      archive: "Bills archived successfully",
      export: "Bills exported successfully",
      settle: "Bills marked as settled",
      remind: "Reminders sent successfully",
    };
    
    toast.success(actionMessages[bulkAction as keyof typeof actionMessages]);
  };

  const selectAll = () => {
    if (selectedBills.length === bills.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(bills.map((bill) => bill.id));
    }
  };

  if (selectedBills.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="flex items-center"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Select All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select bills to perform bulk actions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectionChange([])}
              >
                <Square className="h-4 w-4 mr-2" />
                Clear Selection
              </Button>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {selectedBills.length} selected
                </Badge>
                <Badge variant="outline">
                  Total: ${totalSelectedAmount.toFixed(2)}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="flex items-center"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              {selectedBills.length === bills.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("export")}
              className="flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("settle")}
              className="flex items-center"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Mark as Settled
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("remind")}
              className="flex items-center"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("archive")}
              className="flex items-center"
            >
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("duplicate")}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Bills
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("share")}>
                  <Share className="h-4 w-4 mr-2" />
                  Share Bills
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleBulkAction("delete")}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Bills
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
            <DialogDescription>
              {bulkAction === "delete" && (
                <>
                  Are you sure you want to delete {selectedBills.length} selected bills?
                  This action cannot be undone.
                </>
              )}
              {bulkAction === "archive" && (
                <>
                  Archive {selectedBills.length} selected bills? 
                  They will be moved to the archive and hidden from the main view.
                </>
              )}
              {bulkAction === "settle" && (
                <>
                  Mark {selectedBills.length} selected bills as settled?
                  This will update their status to "Settled".
                </>
              )}
              {bulkAction === "export" && (
                <>
                  Export {selectedBills.length} selected bills to CSV format?
                </>
              )}
              {bulkAction === "remind" && (
                <>
                  Send payment reminders for {selectedBills.length} selected bills?
                  Notifications will be sent to all participants.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmBulkAction}
              variant={bulkAction === "delete" ? "destructive" : "default"}
            >
              {bulkAction === "delete" && "Delete Bills"}
              {bulkAction === "archive" && "Archive Bills"}
              {bulkAction === "settle" && "Mark as Settled"}
              {bulkAction === "export" && "Export Bills"}
              {bulkAction === "remind" && "Send Reminders"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
