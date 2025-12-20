'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Store, Users, Truck, DollarSign } from 'lucide-react';

const stats = [
  {
    name: 'Total Orders Today',
    value: '2,847',
    change: '+18.7%',
    changeType: 'positive' as const,
    icon: ShoppingCart,
  },
  {
    name: 'Revenue Today',
    value: '₹84,392',
    change: '+12.3%',
    changeType: 'positive' as const,
    icon: DollarSign,
  },
  {
    name: 'Active Restaurants',
    value: '156',
    change: '+5.2%',
    changeType: 'positive' as const,
    icon: Store,
  },
  {
    name: 'Active Drivers',
    value: '89',
    change: '+8.1%',
    changeType: 'positive' as const,
    icon: Truck,
  },
  {
    name: 'Avg. Delivery Time',
    value: '28 min',
    change: '-2.1%',
    changeType: 'positive' as const,
    icon: Users,
  },
  {
    name: 'Customer Rating',
    value: '4.7★',
    change: '+0.2',
    changeType: 'positive' as const,
    icon: Users,
  },
];

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              <span
                className={
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : 'text-red-600'
                }
              >
                {stat.change}
              </span>{' '}
              from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
