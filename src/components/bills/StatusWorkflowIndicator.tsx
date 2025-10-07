"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Archive,
  ArrowRight,
  Info
} from "lucide-react";

export function StatusWorkflowIndicator() {
  const workflowSteps = [
    {
      status: "DRAFT",
      icon: FileText,
      label: "Draft",
      description: "Create & edit bills",
      color: "text-gray-600"
    },
    {
      status: "ACTIVE", 
      icon: Clock,
      label: "Active",
      description: "Track payments",
      color: "text-orange-600"
    },
    {
      status: "COMPLETED",
      icon: CheckCircle,
      label: "Completed", 
      description: "Ready to settle",
      color: "text-blue-600"
    },
    {
      status: "SETTLED",
      icon: Archive,
      label: "Settled",
      description: "Archived & done",
      color: "text-green-600"
    }
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Bill Workflow</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 overflow-x-auto">
          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={step.status} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div className={`p-2 rounded-full border-2 border-current ${step.color}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-medium ${step.color}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {step.description}
                    </div>
                  </div>
                </div>
                
                {index < workflowSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
