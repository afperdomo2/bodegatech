import { Injectable, inject, signal, computed } from '@angular/core';
import { InventoryService } from '../../../../core/services/inventory.service';
import type { InventoryDto, InventorySummaryDto } from '../../../../core/models/responses/inventory.responses';
import type { AppError } from '../../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class InventoryStateService {
  private inventoryService = inject(InventoryService);

  private _items = signal<InventorySummaryDto[]>([]);
  private _isLoading = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  private _generalError = signal<string | null>(null);
  private _selectedDetail = signal<InventoryDto | null>(null);
  private _isLoadingDetail = signal(false);
  private _warehouseFilter = signal<string>('');
  private _lowStockFilter = signal(false);

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly generalError = this._generalError.asReadonly();
  readonly selectedDetail = this._selectedDetail.asReadonly();
  readonly isLoadingDetail = this._isLoadingDetail.asReadonly();
  readonly warehouseFilter = this._warehouseFilter.asReadonly();
  readonly lowStockFilter = this._lowStockFilter.asReadonly();

  readonly isEmpty = computed(() => this._items().length === 0 && !this._isLoading());
  readonly hasError = computed(() => this._generalError() !== null);
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  loadInventories(page = 0, pageSize = 10, warehouseId?: string, lowStock?: boolean): void {
    this._isLoading.set(true);
    this._generalError.set(null);
    this._warehouseFilter.set(warehouseId ?? '');
    this._lowStockFilter.set(lowStock ?? false);

    this.inventoryService.getAll(page, pageSize, warehouseId, undefined, lowStock).subscribe({
      next: (response: { data: { items: InventorySummaryDto[]; currentPage: number; pageSize: number; totalElements: number; totalPages: number } }) => {
        this._items.set(response.data.items);
        this._currentPage.set(response.data.currentPage);
        this._pageSize.set(response.data.pageSize);
        this._totalElements.set(response.data.totalElements);
        this._totalPages.set(response.data.totalPages);
        this._isLoading.set(false);
      },
      error: (err: AppError) => {
        this._generalError.set(err.message);
        this._isLoading.set(false);
      },
    });
  }

  loadInventoryById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);
    this.inventoryService.getById(id).subscribe({
      next: (response: { data: InventoryDto }) => {
        this._selectedDetail.set(response.data);
        this._isLoadingDetail.set(false);
      },
      error: (err: AppError) => {
        this._generalError.set(err.message);
        this._isLoadingDetail.set(false);
      },
    });
  }

  clearErrors(): void {
    this._generalError.set(null);
    this._selectedDetail.set(null);
  }
}