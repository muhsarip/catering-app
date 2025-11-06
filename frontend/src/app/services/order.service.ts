import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Order,
  OrderDetails,
  OrderListResponse,
  CreateOrderRequest,
  UpdateStatusRequest
} from '../models/order.model';
import { environment } from '../../environments/environment';

export interface OrderFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);

  getOrders(filters?: OrderFilters): Observable<OrderListResponse> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<{success: boolean, data: OrderListResponse}>(`${environment.apiUrl}/orders`, { params })
      .pipe(map(response => response.data));
  }

  getOrderById(id: string): Observable<OrderDetails> {
    return this.http.get<{success: boolean, data: OrderDetails}>(`${environment.apiUrl}/orders/${id}`)
      .pipe(map(response => response.data));
  }

  createOrder(order: CreateOrderRequest): Observable<{ order: Order }> {
    return this.http.post<{success: boolean, data: { order: Order }}>(`${environment.apiUrl}/orders`, order)
      .pipe(map(response => response.data));
  }

  updateOrderStatus(id: string, statusUpdate: UpdateStatusRequest): Observable<{ order: Order }> {
    return this.http.patch<{success: boolean, data: { order: Order }}>(`${environment.apiUrl}/orders/${id}/status`, statusUpdate)
      .pipe(map(response => response.data));
  }
}
