import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/new',
    loadComponent: () => import('./pages/orders/order-create/order-create.component').then(m => m.OrderCreateComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];
