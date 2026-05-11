import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type { CreateMovementRequest } from '../models/requests/movement.requests';
import type { InventoryMovementDto, InventoryMovementSummaryDto } from '../models/responses/movement.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private api = inject(ApiService);

  create(request: CreateMovementRequest) {
    return this.api.post<ApiResponse<InventoryMovementDto>>('/movements', request);
  }

  getAll(page = 0, size = 10) {
    return this.api.get<ApiResponse<PagedResponse<InventoryMovementSummaryDto>>>(
      `/movements?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`
    );
  }

  getById(id: string) {
    return this.api.get<ApiResponse<InventoryMovementDto>>(`/movements/${id}`);
  }
}