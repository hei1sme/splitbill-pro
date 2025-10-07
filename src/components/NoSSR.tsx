"use client";

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';

interface NoSSRProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const NoSSR = ({ children, fallback = null }: NoSSRProps) => {
  return <>{children}</>;
};

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
  loading: () => <div className="animate-pulse">Loading...</div>
});
