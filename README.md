# Catering Order Management System

Full-stack serverless application for managing catering orders with customer tracking, menu selection, delivery scheduling, and payment monitoring.

## Tech Stack

- **Frontend**: Angular 20+ | **Backend**: Express.js (Serverless Functions)
- **Database**: PostgreSQL (Neon) | **Deployment**: Netlify | **Auth**: JWT

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure .env (see setup section)
cp .env.example .env

# 3. Setup database (run schema.sql and seed.sql in Neon SQL Editor)

# 4. Run application
npm run dev:backend
```

**Access the app:** `http://localhost:4200`

**Default login:**
- Email: `admin@catering.com`
- Password: `admin123`

## Business Process

### Order Management Workflow
1. **Authentication**: Admin login → JWT token (24h expiry) → Auto-logout
2. **Create Order** (6-step process):
   - Enter customer info → Select catering service → Add menu items with dates/quantities
   - Set delivery schedule → Auto-calculate shipping → Select payment method → Submit
3. **Manage Orders**: List/search/filter → View details → Update status → Track history
4. **Status Lifecycle**: Pending → Confirmed → In Progress → Delivered (or Cancelled anytime except Delivered)

### Calculation Rules
- Menu subtotal = Σ(unit price × quantity)
- Shipping total = Σ(delivery shipping costs)
- Grand total = menu subtotal + shipping total

## Layer Architecture

### Frontend (Angular)
**Component** → **Service** → **Model** → **Guard**

1. **Components**: Presentation logic (< 200 lines), delegate to services
2. **Services**: API calls, business logic, state management
3. **Models**: TypeScript interfaces (camelCase)
4. **Guards**: Route protection (AuthGuard)

**Key Practices**: Never use HttpClient in components | Use `takeUntil()` or `async` pipe | Reactive Forms

### Backend (Express.js)

**Simple Pattern** (4 files): Single table CRUD
**Routes** → **Validation** → **Controller** → **Transformer**

**Complex Pattern** (5 files): Multi-table operations
**Routes** → **Validation** → **Controller** → **Service** → **Transformer**

**Layer Responsibilities**:
- **Routes**: Endpoint definitions
- **Validation**: Input validation (express-validator)
- **Controller**: Request/response handling (thin layer)
- **Service**: Business logic & complex SQL (for complex pattern)
- **Transformer**: Data transformation (snake_case → camelCase)

**Key Practices**: Thin controllers | Parameterized queries | Always transform DB results

## Project Structure

```
catering-app/
├── frontend/          # Angular app
├── backend/           # Express.js serverless functions
│   ├── functions/     # Netlify functions
│   └── src/          # Modules & shared code
├── database/          # Schema (schema.sql) & seed data (seed.sql)
```

## Setup

```bash
npm run install:all    # Install all dependencies
cp .env.example .env   # Configure DATABASE_URL & JWT_SECRET
npm run dev:backend    # Run application (frontend + backend)
```

## API Endpoints

**Auth**: `POST /api/auth/login` | `GET /api/auth/me`
**Orders**: `POST /api/orders` | `GET /api/orders` | `GET /api/orders/:id` | `PATCH /api/orders/:id/status`
**Catering**: `GET /api/catering-services` | `GET /api/menu-items`

## Database Schema

**Tables**: users, catering_services, menu_items, orders, order_items, deliveries, order_status_history

See `database/schema.sql` and `docs/brd.md` for details
