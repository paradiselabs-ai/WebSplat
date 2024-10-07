import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

export const Avatar: React.FC<AvatarPrimitive.AvatarProps> = (props) => (
  <AvatarPrimitive.Root
    className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full"
    {...props}
  />
);

export const AvatarImage: React.FC<AvatarPrimitive.AvatarImageProps> = (props) => (
  <AvatarPrimitive.Image
    className="aspect-square h-full w-full"
    {...props}
  />
);

export const AvatarFallback: React.FC<AvatarPrimitive.AvatarFallbackProps> = (props) => (
  <AvatarPrimitive.Fallback
    className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
    {...props}
  />
);