"use client";

import { ReactNode } from "react";

interface HydrationSafeProps {
  children: ReactNode;
  className?: string;
  [key: string]: any;
}

/**
 * A wrapper component that prevents hydration mismatches caused by browser extensions
 * that modify the DOM (like ad blockers adding bis_skin_checked attributes)
 */
export function HydrationSafe({ children, className, ...props }: HydrationSafeProps) {
  return (
    <div 
      className={className} 
      suppressHydrationWarning 
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A specialized wrapper for search/filter components that are prone to hydration issues
 */
export function SearchContainer({ children, ...props }: HydrationSafeProps) {
  return (
    <HydrationSafe {...props}>
      {children}
    </HydrationSafe>
  );
}
