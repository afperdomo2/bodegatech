import { Injectable, inject, signal, computed } from '@angular/core';
import { MovementService } from '../../../../core/services/movement.service';
import { WarehouseService } from '../../../../core/services/warehouse.service';
import { ProductService } from '../../../../core/services/product.service';
import { SupplierService } from '../../../../core/services/supplier.service';
import type { CreateMovementRequest } from '../../../../core/models/requests/movement.requests';
import type { WarehouseDto } from '../../../../core/models/responses/warehouse.responses';
import type { ProductSummaryDto } from '../../../../core/models/responses/product.responses';
import type { SupplierSummaryDto } from '../../../../core/models/responses/supplier.responses';
import type { AppError } from '../../../../core/models/api.models';

export interface RichSelectOption {
  value: string;
  label: string;
  sublabels?: string[];
  badge?: string;
  badgeColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MovementRegisterStateService {
  private movementService = inject(MovementService);
  private warehouseService = inject(WarehouseService);
  private productService = inject(ProductService);
  private supplierService = inject(SupplierService);

  private _isSubmitting = signal(false);
  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0);

  private _warehouses = signal<RichSelectOption[]>([]);
  private _products = signal<RichSelectOption[]>([]);
  private _suppliers = signal<RichSelectOption[]>([]);
  private _isLoadingOptions = signal(false);

  readonly isSubmitting = this._isSubmitting.asReadonly();
  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly generalError = this._generalError.asReadonly();
  readonly operationSuccess = this._operationSuccess.asReadonly();

  readonly warehouses = this._warehouses.asReadonly();
  readonly products = this._products.asReadonly();
  readonly suppliers = this._suppliers.asReadonly();
  readonly isLoadingOptions = this._isLoadingOptions.asReadonly();

  readonly hasError = computed(
    () => this._generalError() !== null || Object.keys(this._fieldErrors()).length > 0
  );

  loadFormOptions(): void {
    this._isLoadingOptions.set(true);
    this._generalError.set(null);

    this.warehouseService.getAll(0, 200, true).subscribe({
      next: (response) => {
        const warehouses: RichSelectOption[] = response.data.items.map((w: WarehouseDto) => ({
          value: w.id,
          label: w.name,
          sublabels: [w.code, w.location || 'Sin ubicación'].filter(Boolean),
        }));
        this._warehouses.set(warehouses);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
      },
    });

    this.productService.getAll(0, 200, true).subscribe({
      next: (response) => {
        const products: RichSelectOption[] = response.data.items.map((p: ProductSummaryDto) => ({
          value: p.id,
          label: p.name,
          sublabels: [p.sku, p.categoryName],
          badge: p.isActive ? 'Activo' : 'Inactivo',
          badgeColor: p.isActive ? 'success' : 'warning',
        }));
        this._products.set(products);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
      },
    });

    this.supplierService.getAll(0, 200, true).subscribe({
      next: (response) => {
        const suppliers: RichSelectOption[] = response.data.items.map((s: SupplierSummaryDto) => ({
          value: s.id,
          label: s.name,
          sublabels: [s.nit],
        }));
        this._suppliers.set(suppliers);
        this._isLoadingOptions.set(false);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isLoadingOptions.set(false);
      },
    });
  }

  createMovement(request: CreateMovementRequest): void {
    this._isSubmitting.set(true);
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.movementService.create(request).subscribe({
      next: () => {
        this._isSubmitting.set(false);
        this._fieldErrors.set({});
        this._generalError.set(null);
        this._operationSuccess.update((v) => v + 1);
      },
      error: (error: AppError) => {
        this._isSubmitting.set(false);
        if (error.status === 400 && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
      },
    });
  }

  clearErrors(): void {
    this._fieldErrors.set({});
    this._generalError.set(null);
  }

  clearOperationSuccess(): void {
    this._operationSuccess.set(0);
  }
}