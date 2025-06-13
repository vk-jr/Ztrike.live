'use client';

import { cn } from "@/lib/utils";

export function LoadingSpinner({ size = 'default', className }: { size?: 'small' | 'default' | 'large', className?: string }) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-solid border-primary border-t-transparent`}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
