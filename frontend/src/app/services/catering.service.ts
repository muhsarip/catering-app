import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CateringService, MenuItem } from '../models/catering.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CateringApiService {
  private http = inject(HttpClient);

  getCateringServices(): Observable<{ cateringServices: CateringService[] }> {
    return this.http.get<{success: boolean, data: { cateringServices: CateringService[] }}>(`${environment.apiUrl}/catering-services`)
      .pipe(map(response => response.data));
  }

  getCateringServiceById(id: string): Observable<{ cateringService: CateringService }> {
    return this.http.get<{success: boolean, data: { cateringService: CateringService }}>(`${environment.apiUrl}/catering-services/${id}`)
      .pipe(map(response => response.data));
  }

  getMenuItems(cateringServiceId?: string, category?: string): Observable<{ menuItems: MenuItem[] }> {
    let params = new HttpParams();

    if (cateringServiceId) {
      params = params.set('cateringServiceId', cateringServiceId);
    }

    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<{success: boolean, data: { menuItems: MenuItem[] }}>(`${environment.apiUrl}/menu-items`, { params })
      .pipe(map(response => response.data));
  }

  getMenuItemById(id: string): Observable<{ menuItem: MenuItem }> {
    return this.http.get<{success: boolean, data: { menuItem: MenuItem }}>(`${environment.apiUrl}/menu-items/${id}`)
      .pipe(map(response => response.data));
  }
}
