import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { CateringApiService } from '../../../services/catering.service';
import { AuthService } from '../../../services/auth.service';
import { CateringService, MenuItem } from '../../../models/catering.model';

@Component({
  selector: 'app-order-create',
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
        <div class="page-header">
          <h2>Create New Order</h2>
          <a routerLink="/orders" class="btn-secondary">Cancel</a>
        </div>

        @if (errorMessage()) {
          <div class="error-alert">{{ errorMessage() }}</div>
        }

        <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
          <!-- Customer Information -->
          <div class="card">
            <h3>Customer Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="customerName">Customer Name *</label>
                <input id="customerName" formControlName="customerName" />
                @if (orderForm.get('customerName')?.invalid && orderForm.get('customerName')?.touched) {
                  <span class="error">Required</span>
                }
              </div>
              <div class="form-group">
                <label for="customerPhone">Phone *</label>
                <input id="customerPhone" formControlName="customerPhone" />
                @if (orderForm.get('customerPhone')?.invalid && orderForm.get('customerPhone')?.touched) {
                  <span class="error">Required</span>
                }
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="customerEmail">Email</label>
                <input id="customerEmail" type="email" formControlName="customerEmail" />
              </div>
              <div class="form-group">
                <label for="customerAddress">Address *</label>
                <input id="customerAddress" formControlName="customerAddress" />
                @if (orderForm.get('customerAddress')?.invalid && orderForm.get('customerAddress')?.touched) {
                  <span class="error">Required</span>
                }
              </div>
            </div>
          </div>

          <!-- Catering Service Selection -->
          <div class="card">
            <h3>Catering Service</h3>
            <div class="form-group">
              <label for="cateringService">Select Service *</label>
              <select id="cateringService" formControlName="cateringServiceId" (change)="onServiceChange()">
                <option value="">Select a catering service</option>
                @for (service of cateringServices(); track service.id) {
                  <option [value]="service.id">{{ service.name }}</option>
                }
              </select>
              @if (orderForm.get('cateringServiceId')?.invalid && orderForm.get('cateringServiceId')?.touched) {
                <span class="error">Required</span>
              }
            </div>
          </div>

          <!-- Menu Items -->
          <div class="card">
            <h3>Menu Items</h3>
            <div formArrayName="menuItems">
              @for (item of menuItems.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="menu-item-row">
                  <div class="form-group flex-2">
                    <label>Menu Item *</label>
                    <select formControlName="menuItemId">
                      <option value="">Select menu item</option>
                      @for (menuItem of availableMenuItems(); track menuItem.id) {
                        <option [value]="menuItem.id">{{ menuItem.name }} - \${{ menuItem.price }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Delivery Date *</label>
                    <input type="date" formControlName="deliveryDate" />
                  </div>
                  <div class="form-group">
                    <label>Quantity *</label>
                    <input type="number" formControlName="quantity" min="1" />
                  </div>
                  <button type="button" (click)="removeMenuItem(i)" class="btn-remove">Remove</button>
                </div>
              }
            </div>
            <button type="button" (click)="addMenuItem()" class="btn-secondary">Add Menu Item</button>
          </div>

          <!-- Deliveries -->
          <div class="card">
            <h3>Delivery Schedule</h3>
            <div formArrayName="deliveries">
              @for (delivery of deliveries.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="delivery-row">
                  <div class="form-group">
                    <label>Delivery Date *</label>
                    <input type="date" formControlName="deliveryDate" />
                  </div>
                  <div class="form-group">
                    <label>Time Window</label>
                    <input formControlName="timeWindow" placeholder="e.g., 10:00 AM - 12:00 PM" />
                  </div>
                  <div class="form-group flex-2">
                    <label>Address *</label>
                    <input formControlName="address" />
                  </div>
                  <div class="form-group">
                    <label>Shipping Cost *</label>
                    <input type="number" formControlName="shippingCost" min="0" step="0.01" />
                  </div>
                  <button type="button" (click)="removeDelivery(i)" class="btn-remove">Remove</button>
                </div>
              }
            </div>
            <button type="button" (click)="addDelivery()" class="btn-secondary">Add Delivery</button>
          </div>

          <!-- Payment Information -->
          <div class="card">
            <h3>Payment Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="paymentMethod">Payment Method</label>
                <select id="paymentMethod" formControlName="paymentMethod">
                  <option value="">Select payment method</option>
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
              <div class="form-group">
                <label for="paymentStatus">Payment Status</label>
                <select id="paymentStatus" formControlName="paymentStatus">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <a routerLink="/orders" class="btn-secondary">Cancel</a>
            <button type="submit" [disabled]="orderForm.invalid || isSubmitting()" class="btn-primary">
              {{ isSubmitting() ? 'Creating Order...' : 'Create Order' }}
            </button>
          </div>
        </form>
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h2 { margin: 0; color: #333; }
    .error-alert { background: #ffebee; color: #c62828; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 2rem; }
    .card h3 { margin: 0 0 1.5rem 0; color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; }
    .form-group.flex-2 { grid-column: span 2; }
    .form-group label { margin-bottom: 0.5rem; color: #333; font-weight: 500; }
    .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    .form-group .error { color: #f44336; font-size: 0.875rem; margin-top: 0.25rem; }
    .menu-item-row, .delivery-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: end; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #eee; }
    .menu-item-row:last-child, .delivery-row:last-child { border-bottom: none; }
    .btn-primary, .btn-secondary { padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
    .btn-primary { background: #667eea; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-remove { padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
    @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } .menu-item-row, .delivery-row { grid-template-columns: 1fr; } }
  `]
})
export class OrderCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private cateringService = inject(CateringApiService);
  authService = inject(AuthService);
  private router = inject(Router);

  cateringServices = signal<CateringService[]>([]);
  availableMenuItems = signal<MenuItem[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal('');

  orderForm = this.fb.group({
    customerName: ['', Validators.required],
    customerPhone: ['', Validators.required],
    customerEmail: [''],
    customerAddress: ['', Validators.required],
    cateringServiceId: ['', Validators.required],
    menuItems: this.fb.array([]),
    deliveries: this.fb.array([]),
    paymentMethod: [''],
    paymentStatus: ['Pending']
  });

  get menuItems() {
    return this.orderForm.get('menuItems') as FormArray;
  }

  get deliveries() {
    return this.orderForm.get('deliveries') as FormArray;
  }

  ngOnInit(): void {
    this.loadCateringServices();
    this.addMenuItem();
    this.addDelivery();
  }

  loadCateringServices(): void {
    this.cateringService.getCateringServices().subscribe({
      next: (response) => {
        this.cateringServices.set(response.cateringServices.filter(s => s.isActive));
      },
      error: () => {
        this.errorMessage.set('Failed to load catering services');
      }
    });
  }

  onServiceChange(): void {
    const serviceId = this.orderForm.get('cateringServiceId')?.value;
    console.log('🔍 Service changed, ID:', serviceId);

    if (serviceId) {
      console.log('📡 Fetching menu items for service:', serviceId);
      this.cateringService.getMenuItems(serviceId).subscribe({
        next: (response) => {
          console.log('✅ Menu items received:', response);
          const availableItems = response.menuItems.filter(m => m.isAvailable);
          console.log('📋 Available menu items after filter:', availableItems);
          this.availableMenuItems.set(availableItems);
          console.log('🎯 Signal updated, current value:', this.availableMenuItems());
        },
        error: (err) => {
          console.error('❌ Error loading menu items:', err);
          this.errorMessage.set('Failed to load menu items');
        }
      });
    } else {
      console.log('⚠️ No service ID selected');
    }
  }

  addMenuItem(): void {
    this.menuItems.push(this.fb.group({
      menuItemId: ['', Validators.required],
      deliveryDate: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }

  removeMenuItem(index: number): void {
    if (this.menuItems.length > 1) {
      this.menuItems.removeAt(index);
    }
  }

  addDelivery(): void {
    this.deliveries.push(this.fb.group({
      deliveryDate: ['', Validators.required],
      timeWindow: [''],
      address: ['', Validators.required],
      shippingCost: [0, [Validators.required, Validators.min(0)]]
    }));
  }

  removeDelivery(index: number): void {
    if (this.deliveries.length > 1) {
      this.deliveries.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.orderForm.value;
    const order = {
      customerName: formValue.customerName!,
      customerPhone: formValue.customerPhone!,
      customerEmail: formValue.customerEmail || undefined,
      customerAddress: formValue.customerAddress!,
      cateringServiceId: formValue.cateringServiceId!,
      menuItems: formValue.menuItems!,
      deliveries: formValue.deliveries!,
      paymentMethod: formValue.paymentMethod || undefined,
      paymentStatus: formValue.paymentStatus as 'Pending' | 'Paid' | 'Partial'
    };

    this.orderService.createOrder(order as any).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/orders', response.order.id]);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.error || 'Failed to create order');
        this.isSubmitting.set(false);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
