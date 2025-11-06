import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">
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
        <h2>Dashboard</h2>
        <div class="card-grid">
          <div class="card">
            <h3>Orders</h3>
            <p class="stat">View and manage all catering orders</p>
            <a routerLink="/orders" class="btn-primary">View Orders</a>
          </div>

          <div class="card">
            <h3>Create Order</h3>
            <p class="stat">Create a new catering order</p>
            <a routerLink="/orders/new" class="btn-primary">Create Order</a>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .card h3 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .stat {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .btn-primary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      transition: background 0.3s;
    }

    .btn-primary:hover {
      background: #5568d3;
    }
  `]
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
  }
}
