import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { AuthService } from '../../../services/auth.service';
import { OrderDetails, OrderStatus } from '../../../models/order.model';

@Component({
  selector: 'app-order-details',
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
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/orders">Orders</a>
      </nav>

      <main class="content">
        @if (isLoading()) {
          <div class="loading">Loading order details...</div>
        } @else if (errorMessage()) {
          <div class="error-alert">{{ errorMessage() }}</div>
        } @else if (orderDetails()) {
          <div class="order-header">
            <div>
              <h2>Order #{{ orderDetails()!.order.orderNumber }}</h2>
              <span [class]="'badge badge-' + getStatusClass(orderDetails()!.order.status)">
                {{ orderDetails()!.order.status }}
              </span>
            </div>
            <div class="header-actions">
              <button (click)="showStatusModal.set(true)" class="btn-primary">Update Status</button>
              <a routerLink="/orders" class="btn-secondary">Back to Orders</a>
            </div>
          </div>

          <div class="details-grid">
            <!-- Customer Info -->
            <div class="card">
              <h3>Customer Information</h3>
              <div class="info-row"><strong>Name:</strong> {{ orderDetails()!.order.customerName }}</div>
              <div class="info-row"><strong>Phone:</strong> {{ orderDetails()!.order.customerPhone }}</div>
              @if (orderDetails()!.order.customerEmail) {
                <div class="info-row"><strong>Email:</strong> {{ orderDetails()!.order.customerEmail }}</div>
              }
              <div class="info-row"><strong>Address:</strong> {{ orderDetails()!.order.customerAddress }}</div>
            </div>

            <!-- Financial Summary -->
            <div class="card">
              <h3>Financial Summary</h3>
              <div class="info-row"><strong>Menu Subtotal:</strong> \${{ orderDetails()!.order.subtotal.toFixed(2) }}</div>
              <div class="info-row"><strong>Shipping Total:</strong> \${{ orderDetails()!.order.shippingTotal.toFixed(2) }}</div>
              <div class="info-row total"><strong>Grand Total:</strong> \${{ orderDetails()!.order.grandTotal.toFixed(2) }}</div>
              <div class="info-row">
                <strong>Payment Method:</strong> {{ orderDetails()!.order.paymentMethod || 'N/A' }}
              </div>
              <div class="info-row">
                <strong>Payment Status:</strong>
                <span [class]="'badge badge-' + getPaymentClass(orderDetails()!.order.paymentStatus)">
                  {{ orderDetails()!.order.paymentStatus }}
                </span>
              </div>
            </div>
          </div>

          <!-- Menu Items -->
          <div class="card">
            <h3>Menu Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Delivery Date</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                @for (item of orderDetails()!.items; track item.id) {
                  <tr>
                    <td>
                      <strong>{{ item.menuItemName }}</strong>
                      @if (item.menuItemDescription) {
                        <br><small>{{ item.menuItemDescription }}</small>
                      }
                    </td>
                    <td>{{ formatDate(item.deliveryDate) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>\${{ item.unitPrice.toFixed(2) }}</td>
                    <td>\${{ item.subtotal.toFixed(2) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Deliveries -->
          <div class="card">
            <h3>Delivery Schedule</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Window</th>
                  <th>Address</th>
                  <th>Shipping Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (delivery of orderDetails()!.deliveries; track delivery.id) {
                  <tr>
                    <td>{{ formatDate(delivery.deliveryDate) }}</td>
                    <td>{{ delivery.deliveryTimeWindow || 'Not specified' }}</td>
                    <td>{{ delivery.deliveryAddress }}</td>
                    <td>\${{ delivery.shippingCost.toFixed(2) }}</td>
                    <td>{{ delivery.deliveryStatus }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Status History -->
          @if (orderDetails()!.statusHistory.length > 0) {
            <div class="card">
              <h3>Status History</h3>
              <div class="timeline">
                @for (history of orderDetails()!.statusHistory; track history.id) {
                  <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                      <strong>{{ history.newStatus }}</strong>
                      <div class="timeline-meta">
                        {{ formatDateTime(history.changedAt) }}
                        by {{ history.changedByName || 'Admin' }}
                      </div>
                      @if (history.notes) {
                        <div class="timeline-notes">{{ history.notes }}</div>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Status Update Modal -->
          @if (showStatusModal()) {
            <div class="modal-overlay" (click)="showStatusModal.set(false)">
              <div class="modal" (click)="$event.stopPropagation()">
                <h3>Update Order Status</h3>
                <form [formGroup]="statusForm" (ngSubmit)="updateStatus()">
                  <div class="form-group">
                    <label>Current Status: <strong>{{ orderDetails()!.order.status }}</strong></label>
                  </div>
                  <div class="form-group">
                    <label for="newStatus">New Status</label>
                    <select id="newStatus" formControlName="status">
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="notes">Notes (optional)</label>
                    <textarea id="notes" formControlName="notes" rows="3"></textarea>
                  </div>
                  @if (updateError()) {
                    <div class="error-message">{{ updateError() }}</div>
                  }
                  <div class="modal-actions">
                    <button type="button" (click)="showStatusModal.set(false)" class="btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" [disabled]="statusForm.invalid || isUpdating()" class="btn-primary">
                      {{ isUpdating() ? 'Updating...' : 'Update Status' }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          }
        }
      </main>
    </div>
  `,
  styles: [`
    .page-container { min-height: 100vh; background: #f5f7fa; }
    header { background: white; padding: 1.5rem 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    h1 { margin: 0; font-size: 1.5rem; color: #333; }
    .user-menu { display: flex; align-items: center; gap: 1rem; }
    .btn-logout { padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .main-nav { background: white; padding: 0 2rem; display: flex; gap: 2rem; border-bottom: 1px solid #eee; }
    .main-nav a { padding: 1rem 0; text-decoration: none; color: #666; }
    .content { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .loading, .error-alert { background: white; padding: 2rem; border-radius: 8px; text-align: center; }
    .error-alert { background: #ffebee; color: #c62828; }
    .order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; background: white; padding: 1.5rem; border-radius: 8px; }
    .order-header h2 { margin: 0 1rem 0 0; display: inline; }
    .header-actions { display: flex; gap: 1rem; }
    .btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .card h3 { margin: 0 0 1rem 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .info-row { padding: 0.5rem 0; }
    .info-row.total { font-size: 1.25rem; color: #667eea; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #eee; }
    .items-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    .items-table th { text-align: left; padding: 0.75rem; background: #f5f7fa; border-bottom: 2px solid #eee; }
    .items-table td { padding: 0.75rem; border-bottom: 1px solid #f0f0f0; }
    .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 500; }
    .badge-pending { background: #fff3cd; color: #856404; }
    .badge-confirmed { background: #cfe2ff; color: #084298; }
    .badge-inprogress { background: #e7f1ff; color: #0c5cb4; }
    .badge-delivered { background: #d1e7dd; color: #0f5132; }
    .badge-cancelled { background: #f8d7da; color: #842029; }
    .badge-paid { background: #d1e7dd; color: #0f5132; }
    .badge-partial { background: #fff3cd; color: #856404; }
    .timeline { padding: 1rem 0; }
    .timeline-item { display: flex; gap: 1rem; padding: 1rem 0; position: relative; }
    .timeline-item:not(:last-child)::after { content: ''; position: absolute; left: 7px; top: 40px; bottom: -20px; width: 2px; background: #ddd; }
    .timeline-marker { width: 16px; height: 16px; border-radius: 50%; background: #667eea; margin-top: 4px; flex-shrink: 0; }
    .timeline-content { flex: 1; }
    .timeline-meta { color: #666; font-size: 0.875rem; margin-top: 0.25rem; }
    .timeline-notes { margin-top: 0.5rem; color: #666; font-style: italic; }
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal { background: white; padding: 2rem; border-radius: 8px; max-width: 500px; width: 90%; }
    .modal h3 { margin: 0 0 1.5rem 0; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
    .form-group select, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
    .error-message { background: #ffebee; color: #c62828; padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; }
    .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
    @media (max-width: 768px) { .details-grid { grid-template-columns: 1fr; } .order-header { flex-direction: column; align-items: flex-start; gap: 1rem; } }
  `]
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  orderDetails = signal<OrderDetails | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  showStatusModal = signal(false);
  isUpdating = signal(false);
  updateError = signal('');

  statusForm = this.fb.group({
    status: ['', Validators.required],
    notes: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrderDetails(id);
    }
  }

  loadOrderDetails(id: string): void {
    this.isLoading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (details) => {
        this.orderDetails.set(details);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error || 'Failed to load order');
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(): void {
    if (this.statusForm.invalid) return;

    this.isUpdating.set(true);
    this.updateError.set('');

    const orderId = this.orderDetails()!.order.id;
    const update = {
      status: this.statusForm.value.status as OrderStatus,
      notes: this.statusForm.value.notes || undefined
    };

    this.orderService.updateOrderStatus(orderId, update).subscribe({
      next: () => {
        this.isUpdating.set(false);
        this.showStatusModal.set(false);
        this.loadOrderDetails(orderId); // Reload to get updated data
      },
      error: (error) => {
        this.updateError.set(error.error?.error || 'Failed to update status');
        this.isUpdating.set(false);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getStatusClass(status: OrderStatus): string {
    return status.toLowerCase().replace(' ', '');
  }

  getPaymentClass(status: string): string {
    return status.toLowerCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
