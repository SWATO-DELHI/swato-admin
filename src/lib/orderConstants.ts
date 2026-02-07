/**
 * Order Status Constants - Production-Ready Flow
 *
 * CANONICAL STATUS FLOW:
 * pending → confirmed → preparing → ready → assigned → picked_up → delivered
 *
 * Alternative flows:
 * - Any active status → cancelled (with reason)
 * - assigned → ready (driver no-show, reassignment)
 */

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

// Status display configuration
export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  step: number;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}> = {
  pending: {
    label: 'Order Placed',
    step: 1,
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    icon: 'clock',
    description: 'Waiting for restaurant to accept'
  },
  confirmed: {
    label: 'Confirmed',
    step: 2,
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    icon: 'check-circle',
    description: 'Restaurant has accepted your order'
  },
  preparing: {
    label: 'Preparing',
    step: 3,
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    icon: 'utensils',
    description: 'Your order is being prepared'
  },
  ready: {
    label: 'Ready for Pickup',
    step: 4,
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    icon: 'package',
    description: 'Order is ready, finding delivery partner'
  },
  assigned: {
    label: 'Driver Assigned',
    step: 5,
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    icon: 'user-check',
    description: 'Delivery partner is on the way to restaurant'
  },
  picked_up: {
    label: 'Out for Delivery',
    step: 6,
    color: 'text-cyan-800',
    bgColor: 'bg-cyan-100',
    icon: 'truck',
    description: 'Your order is on the way'
  },
  delivered: {
    label: 'Delivered',
    step: 7,
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    icon: 'check-circle',
    description: 'Order delivered successfully'
  },
  cancelled: {
    label: 'Cancelled',
    step: -1,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    icon: 'x-circle',
    description: 'Order was cancelled'
  }
};

// Get status step number
export function getStatusStep(status: string): number {
  return ORDER_STATUS_CONFIG[status as OrderStatus]?.step || 0;
}

// Get status display info
export function getStatusDisplay(status: string) {
  return ORDER_STATUS_CONFIG[status as OrderStatus] || ORDER_STATUS_CONFIG.pending;
}

// Check if order is active (not completed or cancelled)
export function isOrderActive(status: string): boolean {
  return !['delivered', 'cancelled'].includes(status);
}

// Check if order can be cancelled
export function canCancelOrder(status: string): boolean {
  return ['pending', 'confirmed'].includes(status);
}

// Get next status in flow
export function getNextStatus(currentStatus: string): string | null {
  const flow: Record<string, string> = {
    pending: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'assigned',
    assigned: 'picked_up',
    picked_up: 'delivered'
  };
  return flow[currentStatus] || null;
}

// Actor types for event logging
export const ACTOR_TYPES = {
  USER: 'user',
  PARTNER: 'partner',
  DRIVER: 'driver',
  SYSTEM: 'system',
  ADMIN: 'admin'
} as const;

export type ActorType = typeof ACTOR_TYPES[keyof typeof ACTOR_TYPES];
