import BaseTransformer from '../../shared/transformers/base.transformer.js';

class OrdersTransformer extends BaseTransformer {
  /**
   * Transform single order
   */
  order(order) {
    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      customerAddress: order.customer_address,
      cateringServiceId: order.catering_service_id,
      cateringServiceName: order.catering_service_name,
      status: order.status,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      subtotal: parseFloat(order.subtotal),
      shippingTotal: parseFloat(order.shipping_total),
      grandTotal: parseFloat(order.grand_total),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };
  }

  /**
   * Transform order with full details
   */
  orderDetails(orderData) {
    if (!orderData) return null;

    const { order, items, deliveries, statusHistory } = orderData;

    return {
      order: {
        ...this.order(order),
        cateringServiceDescription: order.catering_service_description,
      },
      items: items.map(item => this.orderItem(item)),
      deliveries: deliveries.map(delivery => this.delivery(delivery)),
      statusHistory: statusHistory.map(history => this.statusHistory(history)),
    };
  }

  /**
   * Transform order item
   */
  orderItem(item) {
    if (!item) return null;

    return {
      id: item.id,
      orderId: item.order_id,
      menuItemId: item.menu_item_id,
      menuItemName: item.menu_item_name,
      menuItemDescription: item.menu_item_description,
      deliveryDate: item.delivery_date,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal),
      createdAt: item.created_at,
    };
  }

  /**
   * Transform delivery
   */
  delivery(delivery) {
    if (!delivery) return null;

    return {
      id: delivery.id,
      orderId: delivery.order_id,
      deliveryDate: delivery.delivery_date,
      deliveryTimeWindow: delivery.delivery_time_window,
      deliveryAddress: delivery.delivery_address,
      shippingCost: parseFloat(delivery.shipping_cost),
      deliveryStatus: delivery.delivery_status,
      notes: delivery.notes,
      createdAt: delivery.created_at,
      updatedAt: delivery.updated_at,
    };
  }

  /**
   * Transform status history
   */
  statusHistory(history) {
    if (!history) return null;

    return {
      id: history.id,
      orderId: history.order_id,
      oldStatus: history.old_status,
      newStatus: history.new_status,
      changedBy: history.changed_by,
      changedByName: history.changed_by_name,
      changedAt: history.changed_at,
      notes: history.notes,
    };
  }

  /**
   * Transform orders list
   */
  ordersList(orders) {
    return orders.map(order => this.order(order));
  }
}

export default OrdersTransformer;
