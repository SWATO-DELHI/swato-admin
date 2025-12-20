import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { RevenueChart } from '@/components/dashboard/RevenueChart';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to your food delivery admin panel
          </p>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RevenueChart />
          <RecentOrders />
        </div>
      </div>
    </AdminLayout>
  );
}











