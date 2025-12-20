'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, User, Phone, Mail, MapPin, ShoppingBag } from 'lucide-react';

// Mock customers data
const mockCustomers = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91-9876543210',
    totalOrders: 24,
    totalSpent: 15480,
    joinDate: '2023-08-15',
    status: 'active',
    addresses: [
      'Connaught Place, Delhi',
      'Karol Bagh, Delhi'
    ],
    lastOrder: '2024-01-15',
    avgRating: 4.8,
    favoriteCuisine: 'Italian'
  },
  {
    id: '2',
    name: 'Priya Singh',
    email: 'priya.singh@outlook.com',
    phone: '+91-9876543211',
    totalOrders: 18,
    totalSpent: 12350,
    joinDate: '2023-09-22',
    status: 'active',
    addresses: [
      'Lajpat Nagar, Delhi'
    ],
    lastOrder: '2024-01-14',
    avgRating: 4.6,
    favoriteCuisine: 'Indian'
  },
  {
    id: '3',
    name: 'Vikram Mehta',
    email: 'vikram.mehta@yahoo.com',
    phone: '+91-9876543212',
    totalOrders: 31,
    totalSpent: 22100,
    joinDate: '2023-06-10',
    status: 'active',
    addresses: [
      'Rajouri Garden, Delhi',
      'Punjabi Bagh, Delhi'
    ],
    lastOrder: '2024-01-15',
    avgRating: 4.9,
    favoriteCuisine: 'Mexican'
  },
  {
    id: '4',
    name: 'Anjali Gupta',
    email: 'anjali.gupta@gmail.com',
    phone: '+91-9876543213',
    totalOrders: 12,
    totalSpent: 8760,
    joinDate: '2023-11-05',
    status: 'inactive',
    addresses: [
      'Nehru Place, Delhi'
    ],
    lastOrder: '2023-12-20',
    avgRating: 4.4,
    favoriteCuisine: 'Japanese'
  },
  {
    id: '5',
    name: 'Rohit Verma',
    email: 'rohit.verma@outlook.com',
    phone: '+91-9876543214',
    totalOrders: 27,
    totalSpent: 19800,
    joinDate: '2023-07-18',
    status: 'active',
    addresses: [
      'Connaught Place, Delhi',
      'South Extension, Delhi'
    ],
    lastOrder: '2024-01-13',
    avgRating: 4.7,
    favoriteCuisine: 'American'
  }
];

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCustomers = mockCustomers.filter(c => c.status === 'active').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalOrders = mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage customer accounts and view their activity
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            Export Customers
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{mockCustomers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 1000).toFixed(0)}K</p>
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
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search customers by name, email, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {customer.addresses[0]}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.totalOrders}</div>
                        <div className="text-sm text-gray-600">Last: {customer.lastOrder}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">₹{customer.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Avg: ₹{(customer.totalSpent / customer.totalOrders).toFixed(0)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.joinDate}</TableCell>
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
            Showing {filteredCustomers.length} of {mockCustomers.length} customers
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










