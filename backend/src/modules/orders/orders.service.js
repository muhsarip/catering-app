import { sql } from '../../config/database.js';
import { validateStatusTransition } from '../../utils/validation.js';

class OrdersService {
  /**
   * Create a new order with items and deliveries
   */
  async createOrder(orderData, userId) {
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      cateringServiceId,
      menuItems,
      deliveries,
      paymentMethod,
      paymentStatus,
    } = orderData;

    // Calculate order totals
    let orderSubtotal = 0;
    const enrichedMenuItems = [];

    for (const item of menuItems) {
      // Get menu item price
      const menuItemResult = await sql`
        SELECT price FROM menu_items WHERE id = ${item.menuItemId}
      `;

      if (menuItemResult.length === 0) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }

      const unitPrice = parseFloat(menuItemResult[0].price);
      const subtotal = unitPrice * item.quantity;
      orderSubtotal += subtotal;

      enrichedMenuItems.push({
        menuItemId: item.menuItemId,
        deliveryDate: item.deliveryDate,
        quantity: item.quantity,
        unitPrice,
        subtotal,
      });
    }

    // Calculate shipping total
    let shippingTotal = 0;
    for (const delivery of deliveries) {
      shippingTotal += parseFloat(delivery.shippingCost);
    }

    const grandTotal = orderSubtotal + shippingTotal;

    // Create main order
    const orders = await sql`
      INSERT INTO orders (
        customer_name, customer_phone, customer_email, customer_address,
        catering_service_id, status, payment_method, payment_status,
        subtotal, shipping_total, grand_total, created_by
      ) VALUES (
        ${customerName},
        ${customerPhone},
        ${customerEmail || null},
        ${customerAddress},
        ${cateringServiceId},
        'Pending',
        ${paymentMethod || null},
        ${paymentStatus || 'Pending'},
        ${orderSubtotal},
        ${shippingTotal},
        ${grandTotal},
        ${userId}
      )
      RETURNING *
    `;

    const order = orders[0];

    // Insert order items
    for (const item of enrichedMenuItems) {
      await sql`
        INSERT INTO order_items (
          order_id, menu_item_id, delivery_date, quantity, unit_price, subtotal
        ) VALUES (
          ${order.id}, ${item.menuItemId}, ${item.deliveryDate},
          ${item.quantity}, ${item.unitPrice}, ${item.subtotal}
        )
      `;
    }

    // Insert deliveries
    for (const delivery of deliveries) {
      await sql`
        INSERT INTO deliveries (
          order_id, delivery_date, delivery_time_window, delivery_address, shipping_cost
        ) VALUES (
          ${order.id}, ${delivery.deliveryDate}, ${delivery.timeWindow || null},
          ${delivery.address}, ${delivery.shippingCost}
        )
      `;
    }

    // Log initial status
    await sql`
      INSERT INTO order_status_history (
        order_id, old_status, new_status, changed_by
      ) VALUES (
        ${order.id}, NULL, 'Pending', ${userId}
      )
    `;

    return order;
  }

  /**
   * Get orders list with filters and pagination
   */
  async getOrders(filters) {
    const {
      search,
      status,
      paymentStatus,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = filters;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Validate and sanitize sort field
    const validSortFields = ['created_at', 'customer_name', 'grand_total', 'order_number'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    // Build WHERE conditions manually
    const params = [];
    const conditions = ['1=1'];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(o.order_number ILIKE $${paramIndex} OR o.customer_name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (paymentStatus) {
      conditions.push(`o.payment_status = $${paramIndex}`);
      params.push(paymentStatus);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`o.created_at >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`o.created_at <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Build full query
    const query = `
      SELECT o.*, cs.name as catering_service_name
      FROM orders o
      LEFT JOIN catering_services cs ON o.catering_service_id = cs.id
      WHERE ${whereClause}
      ORDER BY o.${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limitNum, offset);

    // Execute query
    const orders = await sql(query, params);

    // Get total count (use params without limit/offset)
    const countQuery = `
      SELECT COUNT(*)::int as count
      FROM orders o
      WHERE ${whereClause}
    `;

    const countParams = params.slice(0, -2); // Remove limit and offset
    const countResult = await sql(countQuery, countParams);
    const total = countResult[0].count;

    return {
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get order by ID with all related data
   */
  async getOrderById(id) {
    // Get order
    const orders = await sql`
      SELECT o.*, cs.name as catering_service_name, cs.description as catering_service_description
      FROM orders o
      LEFT JOIN catering_services cs ON o.catering_service_id = cs.id
      WHERE o.id = ${id}
    `;

    if (orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    // Get order items with menu item details
    const orderItems = await sql`
      SELECT oi.*, mi.name as menu_item_name, mi.description as menu_item_description
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = ${id}
      ORDER BY oi.delivery_date
    `;

    // Get deliveries
    const deliveries = await sql`
      SELECT * FROM deliveries
      WHERE order_id = ${id}
      ORDER BY delivery_date
    `;

    // Get status history
    const statusHistory = await sql`
      SELECT osh.*, u.name as changed_by_name
      FROM order_status_history osh
      LEFT JOIN users u ON osh.changed_by = u.id
      WHERE osh.order_id = ${id}
      ORDER BY osh.changed_at DESC
    `;

    return {
      order,
      items: orderItems,
      deliveries,
      statusHistory,
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id, status, userId, notes = null) {
    // Get current order
    const currentOrders = await sql`
      SELECT * FROM orders WHERE id = ${id}
    `;

    if (currentOrders.length === 0) {
      throw new Error('Order not found');
    }

    const currentOrder = currentOrders[0];

    // Validate status transition
    if (!validateStatusTransition(currentOrder.status, status)) {
      throw new Error(
        `Invalid status transition from ${currentOrder.status} to ${status}`
      );
    }

    // Update status
    const updatedOrders = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Log status change
    await sql`
      INSERT INTO order_status_history (
        order_id, old_status, new_status, changed_by, notes
      ) VALUES (
        ${id}, ${currentOrder.status}, ${status}, ${userId}, ${notes}
      )
    `;

    return updatedOrders[0];
  }
}

export default OrdersService;
