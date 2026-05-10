import { Injectable, inject, signal, computed } from '@angular/core';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import type { CreateWarehouseRequest, UpdateWarehouseRequest } from '../../../../core/models/requests/warehouse.requests';
import type { WarehouseDto, WarehouseDetail } from '../../../../core/models/responses/warehouse.responses';
import type { AppError } from '../../../../core/models/api.models';

@Injectable({
  providedIn: 'root',
})
export class WarehouseStateService {
  private warehouseService = inject(WarehouseService);

  private _warehouses = signal<WarehouseDto[]>([]);
  private _isLoading = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0);

  private _selectedDetail = signal<WarehouseDetail | null>(null);
  private _isLoadingDetail = signal(false);

  private _isActiveFilter = signal<boolean | null>(null);

  readonly warehouses = this._warehouses.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDeleting = this._isDeleting.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();

  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly generalError = this._generalError.asReadonly();
  readonly operationSuccess = this._operationSuccess.asReadonly();

  readonly selectedDetail = this._selectedDetail.asReadonly();
  readonly isLoadingDetail = this._isLoadingDetail.asReadonly();

  readonly isActiveFilter = this._isActiveFilter.asReadonly();

  readonly hasError = computed(
    () => this._generalError() !== null || Object.keys(this._fieldErrors()).length > 0
  );
  readonly isEmpty = computed(() => this._warehouses().length === 0 && !this._isLoading());
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  loadWarehouses(page = 0, pageSize = 10, isActive: boolean | null = null): void {
    this._isLoading.set(true);
    this._generalError.set(null);
    this._isActiveFilter.set(isActive);

    this.warehouseService.getAll(page, pageSize, isActive).subscribe({
      next: (response) => {
        this._warehouses.set(response.data.items);
        this._currentPage.set(response.data.currentPage);
        this._pageSize.set(response.data.pageSize);
        this._totalElements.set(response.data.totalElements);
        this._totalPages.set(response.data.totalPages);
        this._generalError.set(null);
        this._isLoading.set(false);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isLoading.set(false);
      },
    });
  }

  createWarehouse(request: CreateWarehouseRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.warehouseService.create(request).subscribe({
      next: (response) => {
        this._warehouses.update(list => [response.data as WarehouseDto, ...list]);
        this._totalElements.update(t => t + 1);
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        if ((error.status === 400 || error.status === 422) && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
      },
    });
  }

  updateWarehouse(id: string, request: UpdateWarehouseRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.warehouseService.update(id, request).subscribe({
      next: (response) => {
        this._warehouses.update(list =>
          list.map(s => s.id === id ? (response.data as WarehouseDto) : s)
        );
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        if ((error.status === 400 || error.status === 422) && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
      },
    });
  }

  deleteWarehouse(id: string): void {
    this._isDeleting.set(true);
    this._generalError.set(null);

    this.warehouseService.delete(id).subscribe({
      next: () => {
        this._warehouses.update(list => list.filter(s => s.id !== id));
        this._totalElements.update(t => Math.max(0, t - 1));
        this._generalError.set(null);
        this._isDeleting.set(false);
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isDeleting.set(false);
      },
    });
  }

  loadWarehouseById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);

    this.warehouseService.getById(id).subscribe({
      next: (response) => {
        this._selectedDetail.set(response.data);
        this._generalError.set(null);
        this._isLoadingDetail.set(false);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isLoadingDetail.set(false);
      },
    });
  }

  clearErrors(): void {
    this._fieldErrors.set({});
    this._generalError.set(null);
    this._selectedDetail.set(null);
  }
}
