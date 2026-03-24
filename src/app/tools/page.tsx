import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import ToolsPage from '@/components/tools/ToolsPage';

export default function ToolsRoute() {
  return (
    <AppShell>
      <TopNav />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ToolsPage />
      </div>
    </AppShell>
  );
}
