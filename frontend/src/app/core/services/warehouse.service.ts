import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '../models/requests/warehouse.requests';
import type { WarehouseDto, WarehouseDetail } from '../models/responses/warehouse.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class WarehouseService {
  private api = inject(ApiService);

  getAll(page = 0, size = 10, isActive?: boolean | null) {
    let url = `/warehouses?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (isActive !== null && isActive !== undefined) url += `&isActive=${isActive}`;
    return this.api.get<ApiResponse<PagedResponse<WarehouseDto>>>(url);
  }

  getById(id: string) {
    return this.api.get<ApiResponse<WarehouseDetail>>(`/warehouses/${id}`);
  }

  create(request: CreateWarehouseRequest) {
    return this.api.post<ApiResponse<WarehouseDto>>(`/warehouses`, request);
  }

  update(id: string, request: UpdateWarehouseRequest) {
    return this.api.patch<ApiResponse<WarehouseDto>>(`/warehouses/${id}`, request);
  }

  delete(id: string) {
    return this.api.delete<void>(`/warehouses/${id}`);
  }
}
