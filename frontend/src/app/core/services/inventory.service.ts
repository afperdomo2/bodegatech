import { Injectable, inject } from '@angular/core';
import { ApiService } from './api';
import type { InventoryDto, InventorySummaryDto } from '../models/responses/inventory.responses';
import type { ApiResponse, PagedResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private api = inject(ApiService);

  getAll(
    page = 0,
    size = 10,
    warehouseId?: string,
    productId?: string,
    lowStock?: boolean
  ) {
    let url = `/inventories?page=${page}&size=${size}&sortBy=createdAt&direction=DESC`;
    if (warehouseId) url += `&warehouseId=${warehouseId}`;
    if (productId) url += `&productId=${productId}`;
    if (lowStock === true) url += `&lowStock=true`;
    return this.api.get<ApiResponse<PagedResponse<InventorySummaryDto>>>(url);
  }

  getById(id: string) {
    return this.api.get<ApiResponse<InventoryDto>>(`/inventories/${id}`);
  }
}