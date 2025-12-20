'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Truck, Phone, Mail, Star, MapPin, Plus, Bike } from 'lucide-react';

// Mock drivers data
const mockDrivers = [
  {
    id: '1',
    name: 'Amit Kumar',
    email: 'amit.kumar@gmail.com',
    phone: '+91-9876543210',
    vehicleType: 'bike',
    status: 'active',
    totalDeliveries: 1247,
    rating: 4.8,
    earnings: 87500,
    joinDate: '2023-05-15',
    currentLocation: 'Connaught Place',
    completedToday: 8,
    onTimeRate: 96
  },
  {
    id: '2',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@outlook.com',
    phone: '+91-9876543211',
    vehicleType: 'scooter',
    status: 'active',
    totalDeliveries: 956,
    rating: 4.6,
    earnings: 67200,
    joinDate: '2023-07-22',
    currentLocation: 'Karol Bagh',
    completedToday: 6,
    onTimeRate: 92
  },
  {
    id: '3',
    name: 'Suresh Sharma',
    email: 'suresh.sharma@yahoo.com',
    phone: '+91-9876543212',
    vehicleType: 'bike',
    status: 'active',
    totalDeliveries: 789,
    rating: 4.9,
    earnings: 54800,
    joinDate: '2023-09-10',
    currentLocation: 'Lajpat Nagar',
    completedToday: 5,
    onTimeRate: 98
  },
  {
    id: '4',
    name: 'Manoj Singh',
    email: 'manoj.singh@gmail.com',
    phone: '+91-9876543213',
    vehicleType: 'car',
    status: 'inactive',
    totalDeliveries: 543,
    rating: 4.4,
    earnings: 42100,
    joinDate: '2023-11-05',
    currentLocation: 'Rajouri Garden',
    completedToday: 0,
    onTimeRate: 88
  },
  {
    id: '5',
    name: 'Vijay Gupta',
    email: 'vijay.gupta@outlook.com',
    phone: '+91-9876543214',
    vehicleType: 'scooter',
    status: 'active',
    totalDeliveries: 1123,
    rating: 4.7,
    earnings: 78900,
    joinDate: '2023-04-18',
    currentLocation: 'Nehru Place',
    completedToday: 7,
    onTimeRate: 94
  }
];

const vehicleIcons = {
  bike: Bike,
  scooter: Bike,
  car: Truck
};

export default function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  const filteredDrivers = mockDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         driver.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || driver.vehicleType === vehicleFilter;
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const activeDrivers = mockDrivers.filter(d => d.status === 'active').length;
  const totalDeliveries = mockDrivers.reduce((sum, d) => sum + d.totalDeliveries, 0);
  const avgRating = mockDrivers.reduce((sum, d) => sum + d.rating, 0) / mockDrivers.length;
  const totalEarnings = mockDrivers.reduce((sum, d) => sum + d.earnings, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage delivery drivers and track their performance
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Driver
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{mockDrivers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{activeDrivers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}★</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalDeliveries}</p>
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
              Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search drivers by name, email, phone..."
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
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="bike">Bike</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drivers Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => {
                  const VehicleIcon = vehicleIcons[driver.vehicleType as keyof typeof vehicleIcons] || Bike;
                  return (
                    <TableRow key={driver.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            <VehicleIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium">{driver.name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {driver.currentLocation}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {driver.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3" />
                            {driver.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {driver.vehicleType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm font-medium">{driver.rating}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {driver.totalDeliveries} deliveries
                          </div>
                          <div className="text-sm text-gray-600">
                            {driver.onTimeRate}% on-time
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">₹{driver.earnings.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Today: {driver.completedToday}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {driver.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {filteredDrivers.length} of {mockDrivers.length} drivers
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










