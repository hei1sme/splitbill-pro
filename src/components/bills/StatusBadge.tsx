"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "SETTLED";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: '📝',
          label: 'Draft'
        };
      case 'ACTIVE':
        return {
          color: 'bg-orange-100 text-orange-700 border-orange-300',
          icon: '🔴',
          label: 'Active'
        };
      case 'COMPLETED':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-300',
          icon: '✅',
          label: 'Completed'
        };
      case 'SETTLED':
        return {
          color: 'bg-green-100 text-green-700 border-green-300',
          icon: '💚',
          label: 'Settled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: '❓',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} border font-medium px-3 py-1`}
    >
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}
