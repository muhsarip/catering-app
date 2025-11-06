# Catering Order Management System - Frontend

Angular-based admin interface for managing catering orders, customers, menu items, and deliveries.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start
```

**Access the application:** Open `http://localhost:4200` in your browser

**Default admin login:**
- Email: `admin@catering.com`
- Password: `admin123`

## Development

### Running the Frontend Only
```bash
npm start                # Development server on port 4200
npm run build           # Production build
npm test                # Run unit tests
npm run lint            # Run linter
```

### Running Full Stack (Recommended)
To run both frontend and backend together:
```bash
cd ../backend && npm run dev
```
- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:8888/.netlify/functions/`

## Project Structure

```
src/
├── app/
│   ├── components/     # UI components
│   ├── services/       # API services
│   ├── models/         # TypeScript interfaces
│   └── guards/         # Auth guards
├── assets/             # Static files
└── environments/       # Environment configs
```

## Business Process

### Order Management Workflow
1. **Authentication**
   - Admin login with email/password
   - JWT token stored (24-hour expiration)
   - Auto-logout on token expiry

2. **Create Order** (Multi-step process)
   - Step 1: Enter customer info (name, phone, email, address)
   - Step 2: Select catering service provider
   - Step 3: Add menu items with delivery dates and quantities
   - Step 4: Set delivery schedule (dates, time windows, addresses)
   - Step 5: System auto-calculates shipping cost per delivery
   - Step 6: Select payment method and set payment status
   - Review summary and submit → Generate unique Order ID

3. **View & Manage Orders**
   - List all orders with search/filter/sort capabilities
   - View complete order details (customer, menu, deliveries, totals)
   - Update order status with validation
   - Track status history with timestamps

4. **Order Status Lifecycle**
   - **Pending** → **Confirmed** → **In Progress** → **Delivered**
   - Can be **Cancelled** from any status (except Delivered)
   - All status changes logged with user and timestamp

### Calculation Rules
- Menu subtotal = Σ(unit price × quantity)
- Shipping total = Σ(delivery shipping costs)
- Grand total = menu subtotal + shipping total

## Key Features

- Order creation and management
- Customer information tracking
- Menu item selection with delivery scheduling
- Order status workflow with validation
- Search, filter, and pagination
- Responsive design (desktop, tablet, mobile)

## Tech Stack

- Angular 20.3.8
- TypeScript
- Angular Material (UI components)
- RxJS (reactive programming)

## Code Style & Architecture

### Module Structure (Feature-Based)

```
feature-name/
├── feature-name.component.ts      # UI logic & template binding
├── feature-name.component.html    # Template
├── feature-name.component.scss    # Styles
└── feature-name.component.spec.ts # Unit tests
```

### Layer Responsibilities

**1. Components** (Presentation)
- Handle user interactions
- Bind data to templates
- Delegate business logic to services
- Keep components thin (< 200 lines)

**2. Services** (Business Logic)
- API communication via HttpClient
- State management
- Data transformation
- Shared business logic

**3. Models/Interfaces** (Data Types)
- TypeScript interfaces for type safety
- Match API response structures
- Use camelCase (transform from API snake_case)

**4. Guards** (Route Protection)
- Authentication checks (`AuthGuard`)
- Authorization checks
- Prevent unauthorized access

### Naming Conventions

```typescript
// Files
order-list.component.ts
order.service.ts
order.model.ts
auth.guard.ts

// Classes
export class OrderListComponent { }
export class OrderService { }
export interface Order { }

// API Properties (camelCase)
customerName, orderId, createdAt, isActive
```

### API Communication Pattern

```typescript
// ✅ Service handles API calls
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  getOrders(filters?: any): Observable<Order[]> {
    return this.http.get<ApiResponse<Order[]>>(this.apiUrl, { params: filters })
      .pipe(
        map(response => response.data.orders),
        catchError(this.handleError)
      );
  }
}

// ✅ Component uses service
export class OrderListComponent {
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe({
      next: (orders) => this.orders = orders,
      error: (error) => this.handleError(error)
    });
  }
}
```

### Best Practices

- **Use Services**: Never call HttpClient directly in components
- **Type Everything**: Leverage TypeScript for type safety
- **Unsubscribe**: Use `takeUntil()` or `async` pipe to prevent memory leaks
- **Form Validation**: Use Reactive Forms with validators
- **Error Handling**: Show user-friendly error messages
- **Loading States**: Display spinners during API calls

## Additional Commands

```bash
ng generate component component-name  # Generate new component
ng build --configuration production   # Optimized production build
```

For more details, see the [project documentation](../docs/) or [Angular CLI docs](https://angular.dev/tools/cli).
