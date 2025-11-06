"use client";

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
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] px-6 py-5 text-slate-200 shadow-[0_25px_70px_-55px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-300/80">
        <Info className="h-4 w-4" />
        Bill workflow
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {workflowSteps.map((step, index) => {
          const IconComponent = step.icon;
          return (
            <div key={step.status} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-2">
                <div className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white shadow-inner shadow-slate-900/40">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white">
                    {step.label}
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-[0.28em] text-slate-400">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-slate-500/70" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
