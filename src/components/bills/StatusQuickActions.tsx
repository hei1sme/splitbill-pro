"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle2, 
  Archive, 
  Edit3, 
  Eye,
  Download,
  FileCheck
} from "lucide-react";

interface StatusQuickActionsProps {
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
  selectedBills: string[];
  onBulkStatusChange?: (newStatus: string) => void;
  onBulkExport?: () => void;
  onClearSelection?: () => void;
}

export function StatusQuickActions({ 
  status, 
  selectedBills, 
  onBulkStatusChange,
  onBulkExport,
  onClearSelection 
}: StatusQuickActionsProps) {
  if (selectedBills.length === 0) return null;

  const getStatusActions = () => {
    switch (status) {
      case "DRAFT":
        return [
          {
            label: "Activate Bills",
            icon: Play,
            action: () => onBulkStatusChange?.("ACTIVE"),
            variant: "default" as const,
            description: "Make bills active for payment tracking"
          },
          {
            label: "Edit Multiple",
            icon: Edit3,
            action: () => {},
            variant: "outline" as const,
            description: "Bulk edit selected drafts"
          }
        ];
      
      case "ACTIVE":
        return [
          {
            label: "Mark Completed",
            icon: CheckCircle2,
            action: () => onBulkStatusChange?.("COMPLETED"),
            variant: "default" as const,
            description: "Mark as completed for settlement"
          },
          {
            label: "View Details",
            icon: Eye,
            action: () => {},
            variant: "outline" as const,
            description: "View payment details"
          }
        ];
      
      case "COMPLETED":
        return [
          {
            label: "Settle Bills",
            icon: FileCheck,
            action: () => onBulkStatusChange?.("SETTLED"),
            variant: "default" as const,
            description: "Mark as fully settled"
          },
          {
            label: "Export Summary",
            icon: Download,
            action: () => onBulkExport?.(),
            variant: "outline" as const,
            description: "Download settlement report"
          }
        ];
      
      case "SETTLED":
        return [
          {
            label: "Export Archive",
            icon: Download,
            action: () => onBulkExport?.(),
            variant: "outline" as const,
            description: "Download historical data"
          },
          {
            label: "Archive",
            icon: Archive,
            action: () => {},
            variant: "secondary" as const,
            description: "Move to archived storage"
          }
        ];
    }
  };

  const actions = getStatusActions();

  return (
    <div className="bg-muted/50 rounded-lg p-4 border border-dashed">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {selectedBills.length} bill{selectedBills.length !== 1 ? 's' : ''} selected
          </Badge>
          <span className="text-sm text-muted-foreground">
            Status: <strong>{status}</strong>
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
          className="text-xs"
        >
          Clear Selection
        </Button>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={action.action}
              className="flex items-center gap-2"
              title={action.description}
            >
              <IconComponent className="h-4 w-4" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
