import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import DeliverablesPage from '@/components/tamir/deliverables/DeliverablesPage';

export default function DeliverablesRoute() {
  return (
    <AppShell>
      <TopNav />
      <div className="flex-1 min-h-0 overflow-hidden">
        <DeliverablesPage />
      </div>
    </AppShell>
  );
}
