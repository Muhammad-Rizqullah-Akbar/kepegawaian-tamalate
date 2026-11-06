'use client';

import * as Tabs from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';

interface StatusTabsProps {
  portRegistryTab: ReactNode;
  innerStackTab: ReactNode;
  infraChecksTab: ReactNode;
}

export function StatusTabs({ portRegistryTab, innerStackTab, infraChecksTab }: StatusTabsProps): ReactNode {
  return (
    <Tabs.Root defaultValue="ports" className="space-y-4">
      <Tabs.List
        aria-label="Navigasi Status Infrastruktur"
        className="inline-flex flex-wrap gap-1.5 rounded-xl border border-line bg-surface p-1.5"
      >
        <Tabs.Trigger
          value="ports"
          className="rounded-lg px-3.5 py-2 text-xs font-medium transition data-[state=active]:bg-accent data-[state=active]:text-white muted data-[state=active]:shadow-sm"
        >
          Live Port Registry & Anti-Collision
        </Tabs.Trigger>
        <Tabs.Trigger
          value="stack"
          className="rounded-lg px-3.5 py-2 text-xs font-medium transition data-[state=active]:bg-accent data-[state=active]:text-white muted data-[state=active]:shadow-sm"
        >
          21 Tech Stack Lingkar Dalam
        </Tabs.Trigger>
        <Tabs.Trigger
          value="checks"
          className="rounded-lg px-3.5 py-2 text-xs font-medium transition data-[state=active]:bg-accent data-[state=active]:text-white muted data-[state=active]:shadow-sm"
        >
          Deep Probe Data Plane
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="ports" className="focus:outline-none">
        {portRegistryTab}
      </Tabs.Content>
      <Tabs.Content value="stack" className="focus:outline-none">
        {innerStackTab}
      </Tabs.Content>
      <Tabs.Content value="checks" className="focus:outline-none">
        {infraChecksTab}
      </Tabs.Content>
    </Tabs.Root>
  );
}
