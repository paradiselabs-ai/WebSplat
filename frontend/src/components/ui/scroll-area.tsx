import React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => {
  return (
    <ScrollAreaPrimitive.Root className={`relative overflow-hidden ${className}`}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="flex touch-none select-none transition-colors"
        orientation="vertical"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-gray-300" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  );
};