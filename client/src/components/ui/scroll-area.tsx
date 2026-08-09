import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const ScrollArea = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('overflow-y-auto overflow-x-hidden custom-scrollbar', className)}
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = 'ScrollArea';

export function ScrollBar() {
  return null;
}
