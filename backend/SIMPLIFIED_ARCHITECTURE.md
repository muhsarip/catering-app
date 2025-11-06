# Backend Code Style Guide

## Architecture Overview

This backend follows a simplified modular architecture optimized for serverless deployment.

### Module Structure

Two patterns based on complexity:

- **Simple Modules** (4 files) - Single table operations
- **Complex Modules** (5 files) - Multi-table operations

## Simple Module Pattern

For CRUD operations on a single table without complex business logic.

**Structure (4 files):**
```
module-name/
├── module-name.controller.js
├── module-name.transformer.js
├── module-name.validation.js
└── module-name.routes.js
```

### Controller (Direct SQL Access)

```javascript
import { sql } from '../../config/database.js';
import CateringTransformer from './catering.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const cateringTransformer = new CateringTransformer();

class CateringController {
  /**
   * Get all active items
   * GET /api/catering-services
   */
  async getAll(req, res, next) {
    try {
      const items = await sql`
        SELECT * FROM catering_services
        WHERE is_active = true
        ORDER BY name
      `;

      return successResponse(res, {
        cateringServices: cateringTransformer.cateringServicesList(items),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single item by ID
   * GET /api/catering-services/:id
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const items = await sql`
        SELECT * FROM catering_services
        WHERE id = ${id}
      `;

      const item = items[0];

      if (!item) {
        return errorResponse(res, 'Catering service not found', 404);
      }

      return successResponse(res, {
        cateringService: cateringTransformer.cateringService(item),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CateringController();
```

### Transformer

```javascript
import BaseTransformer from '../../shared/transformers/base.transformer.js';

class CateringTransformer extends BaseTransformer {
  /**
   * Transform single item
   */
  cateringService(service) {
    if (!service) return null;

    return {
      id: service.id,
      name: service.name,
      description: service.description,
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at,
    };
  }

  /**
   * Transform list
   */
  cateringServicesList(services) {
    return services.map(service => this.cateringService(service));
  }
}

export default CateringTransformer;
```

### Validation

```javascript
import { param, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const validateGetById = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isUUID()
    .withMessage('Invalid ID format'),

  handleValidationErrors,
];
```

### Routes

```javascript
import express from 'express';
import CateringController from './catering.controller.js';
import { auth } from '../../middleware/auth.js';
import { validateGetById } from './catering.validation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// GET /api/catering-services
router.get('/', CateringController.getAll);

// GET /api/catering-services/:id
router.get('/:id', validateGetById, CateringController.getById);

export default router;
```

## Complex Module Pattern

For operations involving multiple tables, transactions, or complex business logic.

**Structure (5 files):**
```
module-name/
├── module-name.service.js      ← Business logic
├── module-name.controller.js
├── module-name.transformer.js
├── module-name.validation.js
└── module-name.routes.js
```

### Service (Direct SQL Access)

```javascript
import { sql } from '../../config/database.js';
import { validateStatusTransition } from '../../utils/validation.js';

class OrdersService {
  /**
   * Create order with multiple related entities
   */
  async createOrder(orderData, userId) {
    const {
      customerName,
      customerPhone,
      menuItems,
      deliveries,
      // ... other fields
    } = orderData;

    // Calculate totals
    let subtotal = 0;
    for (const item of menuItems) {
      const menuItem = await sql`
        SELECT price FROM menu_items WHERE id = ${item.menuItemId}
      `;

      if (menuItem.length === 0) {
        throw new Error(`Menu item ${item.menuItemId} not found`);
      }

      subtotal += parseFloat(menuItem[0].price) * item.quantity;
    }

    // Create main order
    const orders = await sql`
      INSERT INTO orders (
        customer_name, customer_phone, subtotal, created_by
      ) VALUES (
        ${customerName}, ${customerPhone}, ${subtotal}, ${userId}
      )
      RETURNING *
    `;

    const order = orders[0];

    // Create related entities
    for (const item of menuItems) {
      await sql`
        INSERT INTO order_items (order_id, menu_item_id, quantity)
        VALUES (${order.id}, ${item.menuItemId}, ${item.quantity})
      `;
    }

    for (const delivery of deliveries) {
      await sql`
        INSERT INTO deliveries (order_id, delivery_date, address)
        VALUES (${order.id}, ${delivery.date}, ${delivery.address})
      `;
    }

    return order;
  }

  /**
   * Get list with filters and pagination
   */
  async getOrders(filters) {
    const { search, status, page = 1, limit = 20 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND customer_name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const orders = await sql.unsafe(query, params);

    return { orders };
  }
}

export default OrdersService;
```

### Controller (Thin Layer)

```javascript
import OrdersService from './orders.service.js';
import OrdersTransformer from './orders.transformer.js';
import { successResponse, errorResponse } from '../../shared/helpers/response.js';

const ordersService = new OrdersService();
const ordersTransformer = new OrdersTransformer();

class OrdersController {
  /**
   * Create new order
   * POST /api/orders
   */
  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const orderData = req.body;

      const order = await ordersService.createOrder(orderData, userId);

      return successResponse(
        res,
        { order: ordersTransformer.order(order) },
        'Order created successfully',
        201
      );
    } catch (error) {
      if (error.message.includes('not found')) {
        return errorResponse(res, error.message, 404);
      }
      next(error);
    }
  }

  /**
   * Get all orders
   * GET /api/orders
   */
  async getAll(req, res, next) {
    try {
      const filters = req.query;
      const result = await ordersService.getOrders(filters);

      return successResponse(res, {
        orders: ordersTransformer.ordersList(result.orders),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrdersController();
```

## Database Access

### Using Neon Serverless

```javascript
import { sql } from '../../config/database.js';

// Parameterized queries (tagged templates)
const users = await sql`
  SELECT * FROM users
  WHERE email = ${email}
`;

// Dynamic queries
const query = 'SELECT * FROM orders WHERE status = $1 LIMIT $2';
const params = [status, limit];
const orders = await sql.unsafe(query, params);

// Insert with RETURNING
const newOrders = await sql`
  INSERT INTO orders (customer_name, total)
  VALUES (${name}, ${total})
  RETURNING *
`;
const order = newOrders[0];
```

## Naming Conventions

### Files
```
module-name.controller.js
module-name.service.js
module-name.transformer.js
module-name.validation.js
module-name.routes.js
```

### Classes
```javascript
class ModuleNameController { }
class ModuleNameService { }
class ModuleNameTransformer { }
```

### Database Columns
```javascript
// Database: snake_case
customer_name, created_at, is_active

// Transform to: camelCase
customerName, createdAt, isActive
```

## Response Format

### Success Response

```javascript
import { successResponse } from '../../shared/helpers/response.js';

return successResponse(res, data, message, statusCode);

// Examples:
return successResponse(res, { user });
return successResponse(res, { items }, 'Items retrieved', 200);
```

### Error Response

```javascript
import { errorResponse } from '../../shared/helpers/response.js';

return errorResponse(res, message, statusCode);

// Examples:
return errorResponse(res, 'Not found', 404);
return errorResponse(res, 'Unauthorized', 401);
```

## Validation Patterns

### Simple Validation

```javascript
import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

export const validateCreate = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .trim(),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),

  handleValidationErrors,
];
```

### Custom Validation

```javascript
import { validateEmail, validatePhone } from '../../utils/validation.js';

body('phone')
  .notEmpty().withMessage('Phone is required')
  .custom((value) => {
    if (!validatePhone(value)) {
      throw new Error('Invalid phone format');
    }
    return true;
  }),
```

## Module Registration

### app.js

```javascript
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/orders', ordersRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
};

export default createApp;
```

## Decision Guide

### When to Use Simple Pattern (4 files)

✅ Use when:
- Single table operations
- Simple CRUD (Create, Read, Update, Delete)
- Minimal business logic
- Direct data transformation

Examples: User list, Categories, Settings, Tags

### When to Use Complex Pattern (5 files)

✅ Use when:
- Multiple table operations
- Complex calculations
- Business rules/validation
- Transactions needed

Examples: Orders with items, Invoices, Reports, Workflows

## Best Practices

### 1. Keep Controllers Thin

```javascript
// ✅ Good - Controller delegates to service
async create(req, res, next) {
  const result = await service.createOrder(req.body, req.user.id);
  return successResponse(res, result);
}

// ❌ Bad - Business logic in controller
async create(req, res, next) {
  // 50 lines of calculation and validation
  // Multiple database calls
  // Complex transformations
}
```

### 2. Use Transformers Consistently

```javascript
// ✅ Good - Always transform database results
return successResponse(res, {
  items: transformer.itemsList(dbResults)
});

// ❌ Bad - Return raw database results
return successResponse(res, {
  items: dbResults  // Exposes database structure
});
```

### 3. Validate All Inputs

```javascript
// ✅ Good - Validation middleware
router.post('/', validateCreate, Controller.create);

// ❌ Bad - No validation
router.post('/', Controller.create);
```

### 4. Handle Errors Properly

```javascript
// ✅ Good - Specific error handling
try {
  // ... code
} catch (error) {
  if (error.message.includes('not found')) {
    return errorResponse(res, error.message, 404);
  }
  next(error);  // Let error handler deal with unexpected errors
}

// ❌ Bad - Generic error response
try {
  // ... code
} catch (error) {
  return errorResponse(res, 'Error', 500);
}
```

### 5. Use Async/Await

```javascript
// ✅ Good
async getAll(req, res, next) {
  try {
    const items = await sql`SELECT * FROM items`;
    return successResponse(res, { items });
  } catch (error) {
    next(error);
  }
}

// ❌ Bad - Don't use promises with .then()
getAll(req, res, next) {
  sql`SELECT * FROM items`.then(items => {
    return successResponse(res, { items });
  });
}
```

## Environment Configuration

### Required Variables

```env
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

### Config Files

```javascript
// config/database.js
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);
```

## Testing Example

```javascript
// Test module loads without errors
import createApp from './app.js';

const app = createApp();
console.log('✅ App created successfully');
```

---

**Remember:** Keep it simple. Use the simple pattern by default, add complexity (service layer) only when needed.
