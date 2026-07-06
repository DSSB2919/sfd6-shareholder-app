import { CashierAuthGuard } from '@/components/CashierAuthGuard';

export default function CashierDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CashierAuthGuard>{children}</CashierAuthGuard>;
}
