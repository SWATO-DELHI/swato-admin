'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for the revenue chart
const revenueData = [
  { date: '2024-12-03', revenue: 1200, orders: 45 },
  { date: '2024-12-04', revenue: 1350, orders: 52 },
  { date: '2024-12-05', revenue: 1180, orders: 48 },
  { date: '2024-12-06', revenue: 1420, orders: 58 },
  { date: '2024-12-07', revenue: 1650, orders: 62 },
  { date: '2024-12-08', revenue: 1480, orders: 55 },
  { date: '2024-12-09', revenue: 1720, orders: 68 },
];

export function RevenueChart() {
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {revenueData.map((data, index) => (
              <div key={data.date} className="flex flex-col items-center flex-1">
                <div
                  className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                  style={{
                    height: `${(data.revenue / maxRevenue) * 100}%`,
                    minHeight: '20px',
                  }}
                  title={`$${data.revenue} (${data.orders} orders)`}
                />
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                  {new Date(data.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-4 text-sm text-gray-600">
          <span>Last 7 days</span>
          <span>
            Total: $
            {revenueData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}











