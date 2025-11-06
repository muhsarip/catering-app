import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { Order, OrderStatus, PaymentStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="page-container">
      <header>
        <h1>Catering Order Management</h1>
        <div class="user-menu">
          <span>Welcome, {{ authService.currentUser()?.name }}</span>
          <button (click)="logout()" class="btn-logout">Logout</button>
        </div>
      </header>

      <nav class="main-nav">
        <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a routerLink="/orders" routerLinkActive="active">Orders</a>
      </nav>

      <main class="content">
        <div class="page-header">
          <h2>Orders</h2>
          <a routerLink="/orders/new" class="btn-primary">Create New Order</a>
        </div>

        <!-- Search and Filters -->
        <div class="filters-section">
          <form [formGroup]="filterForm" class="filters-form">
            <div class="search-bar">
              <input
                type="text"
                formControlName="search"
                placeholder="Search by order number or customer name..."
                (input)="onSearchChange()"
              />
            </div>

            <div class="filters-row">
              <div class="filter-group">
                <label for="status">Status</label>
                <select id="status" formControlName="status" (change)="applyFilters()">
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="paymentStatus">Payment Status</label>
                <select id="paymentStatus" formControlName="paymentStatus" (change)="applyFilters()">
                  <option value="">All Payment Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="sortBy">Sort By</label>
                <select id="sortBy" formControlName="sortBy" (change)="applyFilters()">
                  <option value="created_at">Date Created</option>
                  <option value="customer_name">Customer Name</option>
                  <option value="grand_total">Total Amount</option>
                </select>
              </div>

              <div class="filter-group">
                <label for="sortOrder">Order</label>
                <select id="sortOrder" formControlName="sortOrder" (change)="applyFilters()">
                  <option value="DESC">Descending</option>
                  <option value="ASC">Ascending</option>
                </select>
              </div>

              <button type="button" (click)="resetFilters()" class="btn-secondary">
                Reset Filters
              </button>
            </div>
          </form>
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="loading">
            <p>Loading orders...</p>
          </div>
        }

        <!-- Error State -->
        @if (errorMessage()) {
          <div class="error-alert">
            {{ errorMessage() }}
          </div>
        }

        <!-- Orders Table -->
        @if (!isLoading() && orders().length > 0) {
          <div class="table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Delivery Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders(); track order.id) {
                  <tr>
                    <td class="order-number">{{ order.orderNumber }}</td>
                    <td>{{ order.customerName }}</td>
                    <td>{{ order.customerPhone }}</td>
                    <td>{{ formatDate(order.createdAt) }}</td>
                    <td class="amount">\${{ order.grandTotal.toFixed(2) }}</td>
                    <td>
                      <span [class]="'badge badge-' + getStatusClass(order.status)">
                        {{ order.status }}
                      </span>
                    </td>
                    <td>
                      <span [class]="'badge badge-' + getPaymentClass(order.paymentStatus)">
                        {{ order.paymentStatus }}
                      </span>
                    </td>
                    <td class="actions">
                      <a [routerLink]="['/orders', order.id]" class="btn-view">View</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (pagination()) {
            <div class="pagination">
              <div class="pagination-info">
                Showing {{ getStartRecord() }} to {{ getEndRecord() }} of {{ pagination()!.total }} orders
              </div>
              <div class="pagination-controls">
                <button
                  (click)="goToPage(pagination()!.page - 1)"
                  [disabled]="pagination()!.page === 1"
                  class="btn-page"
                >
                  Previous
                </button>

                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    [class.active]="page === pagination()!.page"
                    class="btn-page"
                  >
                    {{ page }}
                  </button>
                }

                <button
                  (click)="goToPage(pagination()!.page + 1)"
                  [disabled]="pagination()!.page === pagination()!.totalPages"
                  class="btn-page"
                >
                  Next
                </button>
              </div>
            </div>
          }
        }

        <!-- Empty State -->
        @if (!isLoading() && orders().length === 0) {
          <div class="empty-state">
            <h3>No orders found</h3>
            <p>There are no orders matching your criteria.</p>
            <a routerLink="/orders/new" class="btn-primary">Create First Order</a>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      background: #f5f7fa;
    }

    header {
      background: white;
      padding: 1.5rem 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .main-nav {
      background: white;
      padding: 0 2rem;
      display: flex;
      gap: 2rem;
      border-bottom: 1px solid #eee;
    }

    .main-nav a {
      padding: 1rem 0;
      text-decoration: none;
      color: #666;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;
    }

    .main-nav a.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h2 {
      margin: 0;
      color: #333;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary:hover {
      background: #5568d3;
    }

    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-bar {
      margin-bottom: 1rem;
    }

    .search-bar input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
    }

    .filter-group label {
      margin-bottom: 0.5rem;
      color: #666;
      font-size: 0.875rem;
    }

    .filter-group select {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
    }

    .btn-secondary {
      padding: 0.75rem 1.5rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    .loading, .error-alert {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
    }

    .error-alert {
      background: #ffebee;
      color: #c62828;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table thead {
      background: #f5f7fa;
    }

    .orders-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #eee;
    }

    .orders-table td {
      padding: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }

    .orders-table tbody tr:hover {
      background: #f9fafb;
    }

    .order-number {
      font-family: monospace;
      font-weight: 600;
      color: #667eea;
    }

    .amount {
      font-weight: 600;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-pending {
      background: #fff3cd;
      color: #856404;
    }

    .badge-confirmed {
      background: #cfe2ff;
      color: #084298;
    }

    .badge-inprogress {
      background: #e7f1ff;
      color: #0c5cb4;
    }

    .badge-delivered {
      background: #d1e7dd;
      color: #0f5132;
    }

    .badge-cancelled {
      background: #f8d7da;
      color: #842029;
    }

    .badge-paid {
      background: #d1e7dd;
      color: #0f5132;
    }

    .badge-partial {
      background: #fff3cd;
      color: #856404;
    }

    .actions {
      text-align: right;
    }

    .btn-view {
      padding: 0.5rem 1rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.875rem;
      transition: background 0.3s;
    }

    .btn-view:hover {
      background: #5568d3;
    }

    .pagination {
      margin-top: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 1rem;
      border-radius: 8px;
    }

    .pagination-info {
      color: #666;
    }

    .pagination-controls {
      display: flex;
      gap: 0.5rem;
    }

    .btn-page {
      padding: 0.5rem 1rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-page:hover:not(:disabled) {
      background: #f5f7fa;
    }

    .btn-page:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-page.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .empty-state {
      background: white;
      padding: 4rem 2rem;
      border-radius: 8px;
      text-align: center;
    }

    .empty-state h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .empty-state p {
      color: #666;
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .table-container {
        overflow-x: auto;
      }

      .orders-table {
        min-width: 800px;
      }

      .pagination {
        flex-direction: column;
        gap: 1rem;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class OrderListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  authService = inject(AuthService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  pagination = signal<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  filterForm = this.fb.group({
    search: [''],
    status: [''],
    paymentStatus: [''],
    sortBy: ['created_at'],
    sortOrder: ['DESC' as 'ASC' | 'DESC']
  });

  private searchTimeout: any;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page: number = 1): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const filters = {
      ...this.filterForm.value,
      page,
      limit: 20
    };

    this.orderService.getOrders(filters as any).subscribe({
      next: (response) => {
        this.orders.set(response.orders);
        this.pagination.set(response.pagination);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error || 'Failed to load orders');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 500);
  }

  applyFilters(): void {
    this.loadOrders(1);
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      status: '',
      paymentStatus: '',
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= (this.pagination()?.totalPages || 1)) {
      this.loadOrders(page);
    }
  }

  getPageNumbers(): number[] {
    const total = this.pagination()?.totalPages || 1;
    const current = this.pagination()?.page || 1;
    const pages: number[] = [];

    // Show up to 5 page numbers
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getStartRecord(): number {
    const p = this.pagination();
    return p ? (p.page - 1) * p.limit + 1 : 0;
  }

  getEndRecord(): number {
    const p = this.pagination();
    return p ? Math.min(p.page * p.limit, p.total) : 0;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase().replace(' ', '');
  }

  getPaymentClass(status: PaymentStatus): string {
    return status.toLowerCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
