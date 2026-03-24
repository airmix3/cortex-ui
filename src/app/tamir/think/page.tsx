import AppShell from '@/components/layout/AppShell';
import TopNav from '@/components/layout/TopNav';
import ThinkPage from '@/components/tamir/think/ThinkPage';

export default function ThinkModePage() {
  return (
    <AppShell>
      <TopNav />
      <div className="flex-1 min-h-0 overflow-hidden">
        <ThinkPage />
      </div>
    </AppShell>
  );
}
