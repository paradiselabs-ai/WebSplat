import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = TabsPrimitive.Root;

export const TabsList: React.FC<TabsPrimitive.TabsListProps> = (props) => (
  <TabsPrimitive.List className="inline-flex items-center justify-center rounded-md bg-gray-100 p-1" {...props} />
);

export const TabsTrigger: React.FC<TabsPrimitive.TabsTriggerProps> = (props) => (
  <TabsPrimitive.Trigger
    className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    {...props}
  />
);

export const TabsContent: React.FC<TabsPrimitive.TabsContentProps> = (props) => (
  <TabsPrimitive.Content
    className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    {...props}
  />
);