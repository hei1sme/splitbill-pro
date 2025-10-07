"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useRouter } from "next/navigation";

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  clickAction?: {
    href?: string;
    onClick?: () => void;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function EnhancedMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  clickAction,
  variant = 'default'
}: EnhancedMetricCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (clickAction?.href) {
      router.push(clickAction.href);
    } else if (clickAction?.onClick) {
      clickAction.onClick();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50/50 hover:bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50';
      case 'destructive':
        return 'border-red-200 bg-red-50/50 hover:bg-red-50';
      default:
        return 'hover:bg-accent/50';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Minus className="h-3 w-3 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${getVariantStyles()} ${clickAction ? 'cursor-pointer' : ''}`}
      onClick={clickAction ? handleClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-xs font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend.label}
          </p>
        )}
        {clickAction && (
          <div className="flex items-center gap-1 mt-2 text-xs text-primary">
            <span>{clickAction.label}</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
