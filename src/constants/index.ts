// Application constants for the food delivery admin panel

export const APP_CONFIG = {
  name: 'Swato Admin',
  version: '1.0.0',
  description: 'Admin panel for food delivery application',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL_WALLET: 'digital_wallet',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  RESTAURANT_OWNER: 'restaurant_owner',
  DRIVER: 'driver',
  CUSTOMER: 'customer',
} as const;

export const VEHICLE_TYPES = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  BICYCLE: 'bicycle',
} as const;

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORDER_STATUS.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [ORDER_STATUS.PREPARING]: 'bg-orange-100 text-orange-800',
  [ORDER_STATUS.READY]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.PICKED_UP]: 'bg-purple-100 text-purple-800',
  [ORDER_STATUS.DELIVERED]: 'bg-green-100 text-green-800',
  [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
} as const;

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [PAYMENT_STATUS.PAID]: 'bg-green-100 text-green-800',
  [PAYMENT_STATUS.FAILED]: 'bg-red-100 text-red-800',
  [PAYMENT_STATUS.REFUNDED]: 'bg-blue-100 text-blue-800',
} as const;

export const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Mexican',
  'Indian',
  'Japanese',
  'Thai',
  'American',
  'Mediterranean',
  'French',
  'Korean',
  'Vietnamese',
  'Middle Eastern',
  'Fast Food',
  'Healthy',
  'Desserts',
  'Beverages',
] as const;

export const MENU_CATEGORIES = [
  'Appetizers',
  'Main Courses',
  'Sides',
  'Desserts',
  'Beverages',
  'Specials',
] as const;

export const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Gluten',
  'Sesame',
] as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',

  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',

  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
  ORDER_STATUS_UPDATE: (id: string) => `/api/orders/${id}/status`,

  // Restaurants
  RESTAURANTS: '/api/restaurants',
  RESTAURANT_BY_ID: (id: string) => `/api/restaurants/${id}`,
  RESTAURANT_MENU: (id: string) => `/api/restaurants/${id}/menu`,

  // Menu Items
  MENU_ITEMS: '/api/menu-items',
  MENU_ITEM_BY_ID: (id: string) => `/api/menu-items/${id}`,

  // Drivers
  DRIVERS: '/api/drivers',
  DRIVER_BY_ID: (id: string) => `/api/drivers/${id}`,
  DRIVER_LOCATION: (id: string) => `/api/drivers/${id}/location`,

  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id: string) => `/api/customers/${id}`,

  // Analytics
  ANALYTICS_REVENUE: '/api/analytics/revenue',
  ANALYTICS_ORDERS: '/api/analytics/orders',
  ANALYTICS_PERFORMANCE: '/api/analytics/performance',
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  RESTAURANTS: '/restaurants',
  CUSTOMERS: '/customers',
  DRIVERS: '/drivers',
  MENU: '/menu',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;








