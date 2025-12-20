'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'Rahul Sharma',
    restaurant: 'Pizza Palace',
    items: ['Margherita Pizza', 'Garlic Bread'],
    total: 485,
    status: 'delivered',
    orderTime: '2024-01-15 14:30',
    deliveryTime: '2024-01-15 15:05',
    driver: 'Amit Kumar',
    paymentMethod: 'UPI',
    deliveryAddress: 'Connaught Place, Delhi'
  },
  {
    id: 'ORD-002',
    customer: 'Priya Singh',
    restaurant: 'Burger Junction',
    items: ['Chicken Burger', 'Fries', 'Coke'],
    total: 320,
    status: 'preparing',
    orderTime: '2024-01-15 15:45',
    deliveryTime: null,
    driver: 'Rajesh Patel',
    paymentMethod: 'Card',
    deliveryAddress: 'Karol Bagh, Delhi'
  },
  {
    id: 'ORD-003',
    customer: 'Vikram Mehta',
    restaurant: 'Taco Fiesta',
    items: ['Beef Tacos', 'Nachos', 'Salsa'],
    total: 675,
    status: 'out_for_delivery',
    orderTime: '2024-01-15 16:20',
    deliveryTime: null,
    driver: 'Suresh Sharma',
    paymentMethod: 'Cash',
    deliveryAddress: 'Lajpat Nagar, Delhi'
  },
  {
    id: 'ORD-004',
    customer: 'Anjali Gupta',
    restaurant: 'Curry House',
    items: ['Butter Chicken', 'Naan', 'Rice'],
    total: 420,
    status: 'confirmed',
    orderTime: '2024-01-15 17:10',
    deliveryTime: null,
    driver: null,
    paymentMethod: 'UPI',
    deliveryAddress: 'Rajouri Garden, Delhi'
  },
  {
    id: 'ORD-005',
    customer: 'Rohit Verma',
    restaurant: 'Sushi Express',
    items: ['California Roll', 'Miso Soup', 'Green Tea'],
    total: 890,
    status: 'cancelled',
    orderTime: '2024-01-15 17:30',
    deliveryTime: null,
    driver: null,
    paymentMethod: 'Card',
    deliveryAddress: 'Nehru Place, Delhi'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Clock,
  ready: CheckCircle,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusDisplay = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons] || Clock;
    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors]} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage all customer orders
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            Export Orders
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-indigo-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Out for Delivery</p>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered Today</p>
                  <p className="text-2xl font-bold text-gray-900">47</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders, customers, restaurants..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.restaurant}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={order.items.join(', ')}>
                        {order.items.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>₹{order.total}</TableCell>
                    <TableCell>{getStatusDisplay(order.status)}</TableCell>
                    <TableCell>{order.orderTime}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredOrders.length} of {mockOrders.length} orders
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button variant="outline" className="bg-orange-500 text-white hover:bg-orange-600">
              1
            </Button>
            <Button variant="outline" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}










