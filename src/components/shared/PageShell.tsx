'use client';

import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';

export default function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <TopNav />
      <div className="flex-1 overflow-y-auto relative z-10">
        {children}
      </div>
    </AppShell>
  );
}
