'use client';

import { SettingsProvider } from '@/contexts/SettingsContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
