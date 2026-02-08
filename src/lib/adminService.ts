// @ts-nocheck
/**
 * Admin Data Service
 * Fetches all data from Supabase for the Admin Panel
 *
 * CANONICAL STATUS FLOW:
 * pending → confirmed → preparing → ready → assigned → picked_up → delivered
 */

import { createClient } from './supabase/client';

// ============ ORDER STATUS CONSTANTS ============

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// ============ TYPES ============

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  } | null;
  restaurant_id: string;
  restaurant: {
    name: string;
    address: string;
    owner_phone: string;
  } | null;
  driver_id: string | null;
  driver: {
    id: string;
    vehicle_number: string;
    user: {
      name: string;
      phone: string;
    } | null;
  } | null;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  tax: number | null;
  total: number;
  payment_method: string | null;
  payment_status: string;
  delivery_address: string;
  created_at: string;
  updated_at: string;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  cancellation_reason: string | null;
  order_items?: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface AdminRestaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  address: string;
  city: string | null;
  owner_phone: string | null;
  email: string | null;
  owner_id: string | null;
  owner: {
    name: string;
    email: string;
    phone: string;
  } | null;
  rating: number;
  total_ratings: number;
  is_active: boolean;
  is_verified: boolean;
  opening_time: string | null;
  closing_time: string | null;
  min_order: number | null;
  delivery_fee: number | null;
  avg_delivery_time: number | null;
  created_at: string;
  // Documents
  fssai_license: string | null;
  fssai_expiry: string | null;
  gst_number: string | null;
  pan_number: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  // Menu counts
  menu_item_count?: number;
}

export type DriverVerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AdminDriver {
  id: string;
  user_id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  } | null;
  vehicle_type: string;
  vehicle_number: string;
  license_number: string;
  license_expiry: string | null;
  license_image_url: string | null;
  rc_image_url: string | null;
  insurance_image_url: string | null;
  is_verified: boolean;
  is_online: boolean;
  total_deliveries: number;
  rating: number;
  total_ratings: number;
  created_at: string;
  current_lat: number | null;
  current_lng: number | null;
  current_location?: {
    lat: number;
    lng: number;
    updated_at: string;
  } | null;
  // Verification fields
  verification_status: DriverVerificationStatus | null;
  rejection_reason: string | null;
  submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
}

export interface OrderStats {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  assigned: number;
  picked_up: number;
  delivered: number;
  cancelled: number;
  total: number;
  todayDelivered: number;
  todayRevenue: number;
}

export interface DriverStats {
  total: number;
  active: number;
  verified: number;
  avgRating: number;
  totalDeliveries: number;
}

export interface RestaurantStats {
  total: number;
  active: number;
  verified: number;
  avgRating: number;
}

// ============ ORDER FUNCTIONS ============

export async function fetchAllOrders(limit = 50): Promise<AdminOrder[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name, email, phone),
      restaurant:restaurants!orders_restaurant_id_fkey(name, address, owner_phone),
      driver:drivers!orders_driver_id_fkey(
        id,
        vehicle_number,
        user:users!drivers_user_id_fkey(name, phone)
      ),
      order_items(id, name, quantity, price)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return (data || []) as AdminOrder[];
}

export async function fetchOrdersByStatus(status: string, limit = 50): Promise<AdminOrder[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name, email, phone),
      restaurant:restaurants!orders_restaurant_id_fkey(name, address, owner_phone),
      driver:drivers!orders_driver_id_fkey(
        id,
        vehicle_number,
        user:users!drivers_user_id_fkey(name, phone)
      )
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching orders by status:', error);
    return [];
  }

  return (data || []) as AdminOrder[];
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const supabase = createClient();

  // Get counts by status
  const { data: statusCounts, error } = await supabase
    .from('orders')
    .select('status, total');

  if (error) {
    console.error('Error fetching order stats:', error);
    return {
      pending: 0, confirmed: 0, preparing: 0, ready: 0,
      assigned: 0, picked_up: 0, delivered: 0, cancelled: 0, total: 0,
      todayDelivered: 0, todayRevenue: 0
    };
  }

  const stats: OrderStats = {
    pending: 0, confirmed: 0, preparing: 0, ready: 0,
    assigned: 0, picked_up: 0, delivered: 0, cancelled: 0, total: 0,
    todayDelivered: 0, todayRevenue: 0
  };

  (statusCounts || []).forEach((order: { status: string; total: number }) => {
    stats.total++;
    switch (order.status) {
      case 'pending': stats.pending++; break;
      case 'confirmed': stats.confirmed++; break;
      case 'preparing': stats.preparing++; break;
      case 'ready': stats.ready++; break;
      case 'assigned': stats.assigned++; break;
      case 'picked_up': stats.picked_up++; break;
      case 'delivered':
        stats.delivered++;
        stats.todayRevenue += order.total || 0;
        break;
      case 'cancelled': stats.cancelled++; break;
    }
  });

  return stats;
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  additionalData?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const updateData = {
    status,
    updated_at: new Date().toISOString(),
    ...additionalData
  };

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============ ORDER EVENTS ============

export interface OrderEvent {
  id: string;
  order_id: string;
  status: string;
  actor_type: 'user' | 'partner' | 'driver' | 'system' | 'admin';
  actor_id: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function fetchOrderEvents(orderId: string): Promise<OrderEvent[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching order events:', error);
    return [];
  }

  return (data || []) as OrderEvent[];
}

export async function logOrderEvent(
  orderId: string,
  status: string,
  actorType: 'admin',
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('order_events')
    .insert({
      order_id: orderId,
      status,
      actor_type: actorType,
      notes
    });

  if (error) {
    console.error('Error logging order event:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============ RESTAURANT FUNCTIONS ============

export async function fetchAllRestaurants(): Promise<AdminRestaurant[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      owner:users!restaurants_owner_id_fkey(name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }

  // Get menu item counts for each restaurant
  const restaurantIds = (data || []).map(r => r.id);

  const { data: menuCounts } = await supabase
    .from('menu_items')
    .select('restaurant_id')
    .in('restaurant_id', restaurantIds);

  const countMap: Record<string, number> = {};
  (menuCounts || []).forEach((item: { restaurant_id: string }) => {
    countMap[item.restaurant_id] = (countMap[item.restaurant_id] || 0) + 1;
  });

  return (data || []).map(r => ({
    ...r,
    menu_item_count: countMap[r.id] || 0
  })) as AdminRestaurant[];
}

export async function fetchRestaurantById(id: string): Promise<AdminRestaurant | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select(`
      *,
      owner:users!restaurants_owner_id_fkey(name, email, phone),
      menu_categories(id, name, sort_order),
      menu_items(id, name, price, is_available, is_veg)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }

  return data as AdminRestaurant;
}

export async function fetchRestaurantStats(): Promise<RestaurantStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('restaurants')
    .select('is_active, is_verified, rating');

  if (error) {
    console.error('Error fetching restaurant stats:', error);
    return { total: 0, active: 0, verified: 0, avgRating: 0 };
  }

  const stats: RestaurantStats = {
    total: data?.length || 0,
    active: data?.filter(r => r.is_active).length || 0,
    verified: data?.filter(r => r.is_verified).length || 0,
    avgRating: data?.length ?
      data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length : 0
  };

  return stats;
}

export async function verifyRestaurant(
  restaurantId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('restaurants')
    .update({
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', restaurantId);

  if (error) {
    console.error('Error verifying restaurant:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function toggleRestaurantActive(
  restaurantId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('restaurants')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', restaurantId);

  if (error) {
    console.error('Error toggling restaurant:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============ DRIVER FUNCTIONS ============

export async function fetchAllDrivers(): Promise<AdminDriver[]> {
  const supabase = createClient();

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select(`
      *,
      user:users!drivers_user_id_fkey(name, email, phone)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }

  console.log("🔍 Debug: Raw drivers data from database:", JSON.stringify(drivers?.slice(0, 1), null, 2));
  
  // Check for image URLs in the fetched data
  if (drivers && drivers.length > 0) {
    const driverWithImages = drivers.find(d => d.license_image_url || d.rc_image_url || d.insurance_image_url);
    if (driverWithImages) {
      console.log("📸 Found driver with images:", {
        id: driverWithImages.id,
        license_image_url: driverWithImages.license_image_url,
        rc_image_url: driverWithImages.rc_image_url,
        insurance_image_url: driverWithImages.insurance_image_url
      });
    } else {
      console.log("❌ No drivers found with image URLs");
    }
  }

  // Get current locations
  const driverIds = (drivers || []).map(d => d.id);

  const { data: locations } = await supabase
    .from('driver_locations')
    .select('driver_id, lat, lng, updated_at')
    .in('driver_id', driverIds);

  const locationMap: Record<string, { lat: number; lng: number; updated_at: string }> = {};
  (locations || []).forEach((loc: { driver_id: string; lat: number; lng: number; updated_at: string }) => {
    locationMap[loc.driver_id] = {
      lat: loc.lat,
      lng: loc.lng,
      updated_at: loc.updated_at
    };
  });

  return (drivers || []).map(d => ({
    ...d,
    current_location: locationMap[d.id] || null
  })) as AdminDriver[];
}

export async function fetchDriverById(id: string): Promise<AdminDriver | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('drivers')
    .select(`
      *,
      user:users!drivers_user_id_fkey(name, email, phone)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching driver:', error);
    return null;
  }

  // Get current location
  const { data: location } = await supabase
    .from('driver_locations')
    .select('lat, lng, updated_at')
    .eq('driver_id', id)
    .single();

  return {
    ...data,
    current_location: location || null
  } as AdminDriver;
}

export async function fetchDriverStats(): Promise<DriverStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('drivers')
    .select('is_online, is_verified, rating, total_deliveries');

  if (error) {
    console.error('Error fetching driver stats:', error);
    return { total: 0, active: 0, verified: 0, avgRating: 0, totalDeliveries: 0 };
  }

  const stats: DriverStats = {
    total: data?.length || 0,
    active: data?.filter(d => d.is_online).length || 0,
    verified: data?.filter(d => d.is_verified).length || 0,
    avgRating: data?.length ?
      data.reduce((sum, d) => sum + (d.rating || 0), 0) / data.length : 0,
    totalDeliveries: data?.reduce((sum, d) => sum + (d.total_deliveries || 0), 0) || 0
  };

  return stats;
}

export async function verifyDriver(
  driverId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drivers')
    .update({
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', driverId);

  if (error) {
    console.error('Error verifying driver:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Approve a driver's verification
 */
export async function approveDriverVerification(
  driverId: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drivers')
    .update({
      verification_status: 'approved',
      is_verified: true,
      verified_at: new Date().toISOString(),
      verified_by: adminUserId || null,
      rejection_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', driverId);

  if (error) {
    console.error('Error approving driver:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reject a driver's verification
 */
export async function rejectDriverVerification(
  driverId: string,
  reason: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drivers')
    .update({
      verification_status: 'rejected',
      is_verified: false,
      rejection_reason: reason,
      verified_at: new Date().toISOString(),
      verified_by: adminUserId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', driverId);

  if (error) {
    console.error('Error rejecting driver:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Suspend a driver
 */
export async function suspendDriver(
  driverId: string,
  reason: string,
  adminUserId?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drivers')
    .update({
      verification_status: 'suspended',
      is_verified: false,
      is_online: false,
      rejection_reason: reason,
      verified_at: new Date().toISOString(),
      verified_by: adminUserId || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', driverId);

  if (error) {
    console.error('Error suspending driver:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get pending driver verifications
 */
export async function fetchPendingDriverVerifications(): Promise<AdminDriver[]> {
  const supabase = createClient();

  const { data: drivers, error } = await supabase
    .from('drivers')
    .select(`
      *,
      user:users!drivers_user_id_fkey(name, email, phone)
    `)
    .eq('verification_status', 'pending')
    .order('submitted_at', { ascending: true });

  if (error) {
    console.error('Error fetching pending verifications:', error);
    return [];
  }

  return (drivers || []) as AdminDriver[];
}

export async function toggleDriverOnline(
  driverId: string,
  isOnline: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from('drivers')
    .update({
      is_online: isOnline,
      updated_at: new Date().toISOString()
    })
    .eq('id', driverId);

  if (error) {
    console.error('Error toggling driver online:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============ DASHBOARD STATS ============

export async function fetchDashboardStats(): Promise<{
  orders: OrderStats;
  restaurants: RestaurantStats;
  drivers: DriverStats;
}> {
  const [orders, restaurants, drivers] = await Promise.all([
    fetchOrderStats(),
    fetchRestaurantStats(),
    fetchDriverStats()
  ]);

  return { orders, restaurants, drivers };
}

// ============ DELIVERY MANAGEMENT ============

export async function fetchActiveDeliveries() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:users!orders_customer_id_fkey(name, phone),
      restaurant:restaurants!orders_restaurant_id_fkey(name, address, lat, lng),
      driver:drivers!orders_driver_id_fkey(
        id,
        current_lat,
        current_lng,
        vehicle_type,
        vehicle_number,
        user:users!drivers_user_id_fkey(name, phone)
      )
    `)
    .in('status', ['assigned', 'picked_up'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active deliveries:', error);
    return [];
  }

  return data || [];
}

export async function fetchDeliveryRequests(orderId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('delivery_requests')
    .select(`
      *,
      driver:drivers!delivery_requests_driver_id_fkey(
        id,
        vehicle_type,
        vehicle_number,
        rating,
        user:users!drivers_user_id_fkey(name, phone)
      )
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching delivery requests:', error);
    return [];
  }

  return data || [];
}

export async function adminAssignDriver(
  orderId: string,
  driverId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Try atomic RPC first
  const { error: rpcError } = await supabase.rpc('accept_delivery', {
    p_order_id: orderId,
    p_driver_id: driverId,
  });

  if (!rpcError) {
    return { success: true };
  }

  console.warn('RPC assign failed, using direct update:', rpcError);

  // Fallback to direct operations
  const { error } = await supabase
    .from('orders')
    .update({
      driver_id: driverId,
      status: 'assigned',
      driver_assigned_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase
    .from('drivers')
    .update({ current_order_id: orderId })
    .eq('id', driverId);

  return { success: true };
}

export async function fetchAvailableDrivers() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('drivers')
    .select(`
      id,
      user_id,
      vehicle_type,
      vehicle_number,
      rating,
      total_deliveries,
      is_online,
      is_verified,
      current_lat,
      current_lng,
      current_order_id,
      user:users!drivers_user_id_fkey(name, phone)
    `)
    .eq('is_verified', true)
    .is('current_order_id', null)
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching available drivers:', error);
    return [];
  }

  return data || [];
}

// ============ PICKUP OTP MANAGEMENT ============

export async function fetchPickupOTP(orderId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('pickup_otps')
    .select('*')
    .eq('order_id', orderId)
    .eq('is_used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // Fallback: check orders table
    const { data: order } = await supabase
      .from('orders')
      .select('pickup_otp')
      .eq('id', orderId)
      .single();

    return order?.pickup_otp || null;
  }

  return data?.otp_code || null;
}

// ============ REAL-TIME SUBSCRIPTIONS ============

export function subscribeToOrders(callback: (payload: { eventType: string; order: any }) => void) {
  const supabase = createClient();

  return supabase
    .channel('admin-orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      (payload) => {
        console.log('📡 Admin: Order change detected', payload.eventType, payload);
        callback({ eventType: payload.eventType, order: payload.new || payload.old });
      }
    )
    .subscribe();
}

export function subscribeToDriverLocations(
  callback: (location: { driver_id: string; lat: number; lng: number }) => void
) {
  const supabase = createClient();

  return supabase
    .channel('admin-driver-locations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'driver_locations' },
      (payload) => {
        callback(payload.new as { driver_id: string; lat: number; lng: number });
      }
    )
    .subscribe();
}
