import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type { CreateSupplierRequest, UpdateSupplierRequest } from '../models/requests/supplier.requests';
import type { SupplierDto, SupplierDetail } from '../models/responses/supplier.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private api = inject(ApiService);

  getAll(page = 0, size = 10, isActive?: boolean | null) {
    let url = `/suppliers?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (isActive !== null && isActive !== undefined) url += `&isActive=${isActive}`;
    return this.api.get<ApiResponse<PagedResponse<SupplierDto>>>(url);
  }

  getById(id: string) {
    return this.api.get<ApiResponse<SupplierDetail>>(`/suppliers/${id}`);
  }

  create(request: CreateSupplierRequest) {
    return this.api.post<ApiResponse<SupplierDto>>(`/suppliers`, request);
  }

  update(id: string, request: UpdateSupplierRequest) {
    return this.api.patch<ApiResponse<SupplierDto>>(`/suppliers/${id}`, request);
  }

  delete(id: string) {
    return this.api.delete<void>(`/suppliers/${id}`);
  }
}
