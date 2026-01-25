'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Store, Truck, DollarSign, Star, Package, RefreshCw } from 'lucide-react';
import { fetchDashboardStats } from '@/lib/adminService';

interface DashboardData {
  totalOrders: number;
  todayRevenue: number;
  activeRestaurants: number;
  onlineDrivers: number;
  avgRating: number;
  pendingOrders: number;
}

export function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    try {
      const stats = await fetchDashboardStats();
      setData({
        totalOrders: stats.orders.total,
        todayRevenue: stats.orders.todayRevenue,
        activeRestaurants: stats.restaurants.active,
        onlineDrivers: stats.drivers.active,
        avgRating: stats.restaurants.avgRating,
        pendingOrders: stats.orders.placed + stats.orders.confirmed + stats.orders.preparing
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
    setLoading(false);
  }

  const stats = [
    {
      name: 'Total Orders',
      value: loading ? '...' : data?.totalOrders?.toLocaleString() || '0',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      name: 'Today Revenue',
      value: loading ? '...' : `₹${data?.todayRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      name: 'Active Restaurants',
      value: loading ? '...' : data?.activeRestaurants?.toString() || '0',
      icon: Store,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    },
    {
      name: 'Online Drivers',
      value: loading ? '...' : data?.onlineDrivers?.toString() || '0',
      icon: Truck,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      name: 'Pending Orders',
      value: loading ? '...' : data?.pendingOrders?.toString() || '0',
      icon: Package,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    {
      name: 'Avg Rating',
      value: loading ? '...' : `${data?.avgRating?.toFixed(1) || '0.0'}★`,
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live from database
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
