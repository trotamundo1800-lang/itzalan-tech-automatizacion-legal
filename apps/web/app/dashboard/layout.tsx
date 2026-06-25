import type { ReactNode } from 'react';
import { DashboardLayout as SharedDashboardLayout } from '../../components/ui';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <SharedDashboardLayout>{children}</SharedDashboardLayout>;
}
