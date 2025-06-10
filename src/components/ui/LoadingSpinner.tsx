import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 48, className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", `h-${size/4} w-${size/4}`)} style={{ width: size, height: size }} />
    </div>
  );
}
