export type OrderStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash' | 'Transfer' | 'Credit Card';
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  cateringServiceId: string;
  cateringServiceName?: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingTotal: number;
  grandTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemDescription?: string;
  deliveryDate: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliveryDate: string;
  deliveryTimeWindow?: string;
  deliveryAddress: string;
  shippingCost: number;
  deliveryStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  oldStatus?: string;
  newStatus: string;
  changedBy: string;
  changedByName?: string;
  changedAt: string;
  notes?: string;
}

export interface OrderDetails {
  order: Order;
  items: OrderItem[];
  deliveries: Delivery[];
  statusHistory: OrderStatusHistory[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  cateringServiceId: string;
  menuItems: Array<{
    menuItemId: string;
    deliveryDate: string;
    quantity: number;
  }>;
  deliveries: Array<{
    deliveryDate: string;
    timeWindow?: string;
    address: string;
    shippingCost: number;
  }>;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UpdateStatusRequest {
  status: OrderStatus;
  notes?: string;
}
