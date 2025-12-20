import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatCurrency } from '@/utils';

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    restaurant: 'Pizza Palace',
    total: 25.99,
    status: 'delivered',
    createdAt: new Date('2024-12-09T14:30:00'),
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    restaurant: 'Burger Joint',
    total: 18.50,
    status: 'preparing',
    createdAt: new Date('2024-12-09T14:15:00'),
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    restaurant: 'Sushi Express',
    total: 42.75,
    status: 'picked_up',
    createdAt: new Date('2024-12-09T13:45:00'),
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    restaurant: 'Taco Town',
    total: 15.25,
    status: 'confirmed',
    createdAt: new Date('2024-12-09T13:20:00'),
  },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {order.id}
                  </p>
                  <Badge
                    variant="secondary"
                    className={statusColors[order.status as keyof typeof statusColors]}
                  >
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{order.customer}</p>
                <p className="text-xs text-gray-400">{order.restaurant}</p>
                <p className="text-xs text-gray-400">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}











