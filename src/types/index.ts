// Core entity types for the food delivery admin panel

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'restaurant_owner' | 'driver' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  description?: string;
  address: Address;
  phone: string;
  email: string;
  cuisine: string[];
  rating: number;
  deliveryTime: number; // in minutes
  deliveryFee: number;
  minimumOrder: number;
  isActive: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
  ingredients: string[];
  allergens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  tax: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Driver {
  id: string;
  userId: string;
  vehicle: {
    type: 'car' | 'motorcycle' | 'bicycle';
    model: string;
    licensePlate: string;
  };
  licenseNumber: string;
  isAvailable: boolean;
  currentLocation?: Location;
  rating: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId: string;
  addresses: Address[];
  favoriteRestaurants: string[];
  orderHistory: string[];
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: Location;
}

export interface Location {
  latitude: number;
  longitude: number;
}

// Enums
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'digital_wallet';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreateRestaurantForm {
  name: string;
  description: string;
  address: Address;
  phone: string;
  email: string;
  cuisine: string[];
  deliveryFee: number;
  minimumOrder: number;
}

export interface CreateMenuItemForm {
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  allergens: string[];
  preparationTime: number;
}

// Dashboard types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeRestaurants: number;
  activeDrivers: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface RevenueChart {
  date: string;
  revenue: number;
  orders: number;
}

// Filter and sort types
export interface OrderFilters {
  status?: OrderStatus;
  restaurantId?: string;
  driverId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  minTotal?: number;
  maxTotal?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}



















