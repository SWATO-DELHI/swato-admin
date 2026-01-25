// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search, Filter, Eye, Truck, Phone, Mail, Star, MapPin, RefreshCw,
  Bike, Car, CheckCircle, XCircle, FileText, Calendar, Shield
} from 'lucide-react';
import {
  fetchAllDrivers,
  fetchDriverStats,
  verifyDriver,
  toggleDriverOnline,
  AdminDriver,
  DriverStats
} from '@/lib/adminService';

const vehicleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  bike: Bike,
  Bike: Bike,
  scooter: Bike,
  Scooter: Bike,
  car: Car,
  Car: Car
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState<AdminDriver | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [driversData, statsData] = await Promise.all([
        fetchAllDrivers(),
        fetchDriverStats()
      ]);
      setDrivers(driversData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
    setLoading(false);
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch =
      driver.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.user?.phone?.includes(searchQuery) ||
      driver.vehicle_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'online' && driver.is_online) ||
      (statusFilter === 'offline' && !driver.is_online) ||
      (statusFilter === 'verified' && driver.is_verified) ||
      (statusFilter === 'unverified' && !driver.is_verified);
    const matchesVehicle = vehicleFilter === 'all' ||
      driver.vehicle_type?.toLowerCase() === vehicleFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewDriver = (driver: AdminDriver) => {
    setSelectedDriver(driver);
    setIsDetailOpen(true);
  };

  const handleVerifyDriver = async (driverId: string) => {
    const result = await verifyDriver(driverId);
    if (result.success) {
      loadData();
      setIsDetailOpen(false);
    }
  };

  const handleToggleOnline = async (driverId: string, currentStatus: boolean) => {
    const result = await toggleDriverOnline(driverId, !currentStatus);
    if (result.success) {
      loadData();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drivers Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage delivery drivers, verify documents, and track performance
            </p>
          </div>
          <Button
            onClick={loadData}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Online Now</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.active || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.verified || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.avgRating?.toFixed(1) || '0.0'}★
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalDeliveries?.toLocaleString() || 0}
                  </p>
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
              Drivers ({filteredDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, phone, vehicle..."
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
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading drivers...</span>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No drivers found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => {
                    const VehicleIcon = vehicleIcons[driver.vehicle_type] || Bike;
                    return (
                      <TableRow key={driver.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                              <VehicleIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">{driver.user?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {formatDate(driver.created_at)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3" />
                              {driver.user?.email || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {driver.user?.phone || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="capitalize">
                              {driver.vehicle_type || 'N/A'}
                            </Badge>
                            <div className="text-sm font-mono text-gray-600">
                              {driver.vehicle_number || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-mono">
                              {driver.license_number || 'N/A'}
                            </div>
                            {driver.license_expiry && (
                              <div className="text-xs text-gray-500">
                                Expires: {formatDate(driver.license_expiry)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm font-medium">
                                {driver.rating?.toFixed(1) || '0.0'}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({driver.total_ratings || 0})
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {driver.total_deliveries || 0} deliveries
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={driver.is_online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {driver.is_online ? 'Online' : 'Offline'}
                            </Badge>
                            <Badge className={driver.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                              {driver.is_verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDriver(driver)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Driver Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Driver Details - {selectedDriver?.user?.name}</DialogTitle>
            </DialogHeader>

            {selectedDriver && (
              <div className="space-y-4">
                {/* Status Badges */}
                <div className="flex gap-2">
                  <Badge className={selectedDriver.is_online ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {selectedDriver.is_online ? 'Online' : 'Offline'}
                  </Badge>
                  <Badge className={selectedDriver.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                    {selectedDriver.is_verified ? '✓ Verified' : 'Pending Verification'}
                  </Badge>
                </div>

                {/* Contact Info */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Name:</span> {selectedDriver.user?.name || 'N/A'}</div>
                      <div><span className="text-gray-500">Email:</span> {selectedDriver.user?.email || 'N/A'}</div>
                      <div><span className="text-gray-500">Phone:</span> {selectedDriver.user?.phone || 'N/A'}</div>
                      <div><span className="text-gray-500">Joined:</span> {formatDate(selectedDriver.created_at)}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Info */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Vehicle Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Type:</span> {selectedDriver.vehicle_type || 'N/A'}</div>
                      <div><span className="text-gray-500">Number:</span> <span className="font-mono">{selectedDriver.vehicle_number || 'N/A'}</span></div>
                    </div>
                  </CardContent>
                </Card>

                {/* License & Documents */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      License & Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">License Number:</span>
                        <div className="font-mono font-medium">{selectedDriver.license_number || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">License Expiry:</span>
                        <div className={`font-medium ${
                          selectedDriver.license_expiry && new Date(selectedDriver.license_expiry) < new Date()
                            ? 'text-red-600'
                            : ''
                        }`}>
                          {formatDate(selectedDriver.license_expiry)}
                        </div>
                      </div>
                    </div>

                    {/* Document Links */}
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-medium text-gray-700">Uploaded Documents:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedDriver.license_image_url ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            License Image
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">
                            <XCircle className="h-3 w-3 mr-1 text-red-600" />
                            License Image Missing
                          </Badge>
                        )}
                        {selectedDriver.rc_image_url ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            RC Document
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50">
                            <XCircle className="h-3 w-3 mr-1 text-red-600" />
                            RC Missing
                          </Badge>
                        )}
                        {selectedDriver.insurance_image_url ? (
                          <Badge variant="outline" className="bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                            Insurance
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-yellow-50">
                            <XCircle className="h-3 w-3 mr-1 text-yellow-600" />
                            Insurance Missing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance */}
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDriver.rating?.toFixed(1) || '0.0'}
                        </div>
                        <div className="text-sm text-gray-500">Rating</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDriver.total_deliveries || 0}
                        </div>
                        <div className="text-sm text-gray-500">Deliveries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {selectedDriver.total_ratings || 0}
                        </div>
                        <div className="text-sm text-gray-500">Reviews</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Current Location */}
                {selectedDriver.current_location && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Current Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="text-sm">
                        <span className="font-mono">
                          {selectedDriver.current_location.lat.toFixed(6)}, {selectedDriver.current_location.lng.toFixed(6)}
                        </span>
                        <div className="text-gray-500 text-xs mt-1">
                          Last updated: {new Date(selectedDriver.current_location.updated_at).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  {!selectedDriver.is_verified && (
                    <Button
                      onClick={() => handleVerifyDriver(selectedDriver.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Driver
                    </Button>
                  )}
                  <Button
                    variant={selectedDriver.is_online ? "destructive" : "default"}
                    onClick={() => handleToggleOnline(selectedDriver.id, selectedDriver.is_online)}
                  >
                    {selectedDriver.is_online ? 'Set Offline' : 'Set Online'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
