import { Injectable, inject, signal, computed } from '@angular/core';
import { MovementService } from '../../../../core/services/movement.service';
import type { InventoryMovementDto, InventoryMovementSummaryDto } from '../../../../core/models/responses/movement.responses';
import type { AppError } from '../../../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class MovementStateService {
  private movementService = inject(MovementService);

  private _items = signal<InventoryMovementSummaryDto[]>([]);
  private _isLoading = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);
  private _generalError = signal<string | null>(null);
  private _selectedDetail = signal<InventoryMovementDto | null>(null);
  private _isLoadingDetail = signal(false);

  readonly items = this._items.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();
  readonly generalError = this._generalError.asReadonly();
  readonly selectedDetail = this._selectedDetail.asReadonly();
  readonly isLoadingDetail = this._isLoadingDetail.asReadonly();

  readonly isEmpty = computed(() => this._items().length === 0 && !this._isLoading());
  readonly hasError = computed(() => this._generalError() !== null);

  loadMovements(page = 0, pageSize = 10): void {
    this._isLoading.set(true);
    this._generalError.set(null);

    this.movementService.getAll(page, pageSize).subscribe({
      next: (response: { data: { items: InventoryMovementSummaryDto[]; currentPage: number; pageSize: number; totalElements: number; totalPages: number } }) => {
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

  loadMovementById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);
    this.movementService.getById(id).subscribe({
      next: (response: { data: InventoryMovementDto }) => {
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
