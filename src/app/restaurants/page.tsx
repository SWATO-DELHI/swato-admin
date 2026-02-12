// @ts-nocheck
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Plus, Edit, Star, MapPin, Phone, Clock, Filter, RefreshCw,
  CheckCircle, XCircle, FileText, Building2, Mail, Shield, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import {
  fetchAllRestaurants,
  fetchRestaurantStats,
  verifyRestaurant,
  toggleRestaurantActive,
  AdminRestaurant,
  RestaurantStats
} from '@/lib/adminService';

function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedFood = searchParams.get('food');

  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<AdminRestaurant | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [restaurantsData, statsData] = await Promise.all([
        fetchAllRestaurants(),
        fetchRestaurantStats()
      ]);
      setRestaurants(restaurantsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading restaurants:', error);
    }
    setLoading(false);
  }

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch =
      restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && restaurant.is_active) ||
      (statusFilter === 'inactive' && !restaurant.is_active) ||
      (statusFilter === 'verified' && restaurant.is_verified) ||
      (statusFilter === 'unverified' && !restaurant.is_verified);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleViewRestaurant = (restaurant: AdminRestaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailOpen(true);
  };

  const handleVerifyRestaurant = async (restaurantId: string) => {
    const result = await verifyRestaurant(restaurantId);
    if (result.success) {
      loadData();
      setIsDetailOpen(false);
    }
  };

  const handleToggleActive = async (restaurantId: string, currentStatus: boolean) => {
    const result = await toggleRestaurantActive(restaurantId, !currentStatus);
    if (result.success) {
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Restaurants Management
              </h1>
              <p className="mt-2 text-gray-600">
                {filteredRestaurants.length} restaurants found
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

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Building2 className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active</p>
                    <p className="text-2xl font-bold">{stats?.active || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold">{stats?.verified || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold">{stats?.avgRating?.toFixed(1) || '0.0'}★</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative max-w-sm">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Restaurants Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600">Loading restaurants...</span>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Menu Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-sm text-gray-500">{restaurant.cuisine_type || 'Multi-cuisine'}</div>
                            <div className="text-xs text-gray-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {restaurant.city || restaurant.address?.split(',')[0] || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {restaurant.owner_phone || 'N/A'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {restaurant.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {restaurant.fssai_license ? (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              <CheckCircle className="h-2 w-2 mr-1 text-green-600" />
                              FSSAI
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-red-50">
                              <XCircle className="h-2 w-2 mr-1 text-red-600" />
                              FSSAI
                            </Badge>
                          )}
                          {restaurant.gst_number ? (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              <CheckCircle className="h-2 w-2 mr-1 text-green-600" />
                              GST
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-yellow-50">
                              <XCircle className="h-2 w-2 mr-1 text-yellow-600" />
                              GST
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{restaurant.rating?.toFixed(1) || '0.0'}</span>
                          <span className="text-xs text-gray-500">({restaurant.total_ratings || 0})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{restaurant.menu_item_count || 0}</span>
                        <span className="text-gray-500 text-sm"> items</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={restaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {restaurant.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge className={restaurant.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                            {restaurant.is_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewRestaurant(restaurant)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Restaurant Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRestaurant?.name}</DialogTitle>
          </DialogHeader>

          {selectedRestaurant && (
            <div className="space-y-4">
              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge className={selectedRestaurant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {selectedRestaurant.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge className={selectedRestaurant.is_verified ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                  {selectedRestaurant.is_verified ? '✓ Verified' : 'Pending Verification'}
                </Badge>
              </div>

              {/* Basic Info */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Cuisine:</span> {selectedRestaurant.cuisine_type || 'Multi-cuisine'}</div>
                    <div><span className="text-gray-500">City:</span> {selectedRestaurant.city || 'N/A'}</div>
                    <div className="col-span-2"><span className="text-gray-500">Address:</span> {selectedRestaurant.address}</div>
                    <div><span className="text-gray-500">Phone:</span> {selectedRestaurant.owner_phone || 'N/A'}</div>
                    <div><span className="text-gray-500">Email:</span> {selectedRestaurant.email || 'N/A'}</div>
                    <div><span className="text-gray-500">Min Order:</span> ₹{selectedRestaurant.min_order || 0}</div>
                    <div><span className="text-gray-500">Delivery Fee:</span> ₹{selectedRestaurant.delivery_fee || 0}</div>
                    <div><span className="text-gray-500">Avg Delivery:</span> {selectedRestaurant.avg_delivery_time || 30} mins</div>
                    <div><span className="text-gray-500">Hours:</span> {selectedRestaurant.opening_time || '09:00'} - {selectedRestaurant.closing_time || '22:00'}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Info */}
              {selectedRestaurant.owner && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Name:</span> {selectedRestaurant.owner.name}</div>
                      <div><span className="text-gray-500">Email:</span> {selectedRestaurant.owner.email}</div>
                      <div><span className="text-gray-500">Phone:</span> {selectedRestaurant.owner.phone}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Documents & Licenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">FSSAI License:</span>
                      <div className="font-mono font-medium">{selectedRestaurant.fssai_license || 'Not provided'}</div>
                      {selectedRestaurant.fssai_expiry && (
                        <div className={`text-xs ${
                          new Date(selectedRestaurant.fssai_expiry) < new Date()
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          Expires: {formatDate(selectedRestaurant.fssai_expiry)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500">GST Number:</span>
                      <div className="font-mono font-medium">{selectedRestaurant.gst_number || 'Not provided'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">PAN Number:</span>
                      <div className="font-mono font-medium">{selectedRestaurant.pan_number || 'Not provided'}</div>
                    </div>
                  </div>

                  {/* Document Status */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedRestaurant.fssai_license ? (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        FSSAI License
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50">
                        <XCircle className="h-3 w-3 mr-1 text-red-600" />
                        FSSAI Missing
                      </Badge>
                    )}
                    {selectedRestaurant.gst_number ? (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        GST Registered
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50">
                        <XCircle className="h-3 w-3 mr-1 text-yellow-600" />
                        GST Not Provided
                      </Badge>
                    )}
                    {selectedRestaurant.pan_number ? (
                      <Badge variant="outline" className="bg-green-50">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                        PAN Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50">
                        <XCircle className="h-3 w-3 mr-1 text-yellow-600" />
                        PAN Not Provided
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              {(selectedRestaurant.bank_account_number || selectedRestaurant.bank_name) && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm">Bank Details</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Bank:</span> {selectedRestaurant.bank_name || 'N/A'}</div>
                      <div><span className="text-gray-500">IFSC:</span> {selectedRestaurant.bank_ifsc || 'N/A'}</div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Account:</span>{' '}
                        <span className="font-mono">
                          {selectedRestaurant.bank_account_number
                            ? '****' + selectedRestaurant.bank_account_number.slice(-4)
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                        {selectedRestaurant.rating?.toFixed(1) || '0.0'}★
                      </div>
                      <div className="text-sm text-gray-500">Rating</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRestaurant.total_ratings || 0}
                      </div>
                      <div className="text-sm text-gray-500">Reviews</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedRestaurant.menu_item_count || 0}
                      </div>
                      <div className="text-sm text-gray-500">Menu Items</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {!selectedRestaurant.is_verified && (
                  <Button
                    onClick={() => handleVerifyRestaurant(selectedRestaurant.id)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Restaurant
                  </Button>
                )}
                <Button
                  variant={selectedRestaurant.is_active ? "destructive" : "default"}
                  onClick={() => handleToggleActive(selectedRestaurant.id, selectedRestaurant.is_active)}
                >
                  {selectedRestaurant.is_active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/restaurants/${selectedRestaurant.id}/menu`)}
                >
                  View Menu
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
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RestaurantsPageContent />
    </Suspense>
  );
}
