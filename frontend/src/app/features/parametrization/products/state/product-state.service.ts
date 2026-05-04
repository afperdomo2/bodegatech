import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import type {
  ProductSummaryDto,
} from '../../../../core/models/responses/product.responses';
import type { AppError } from '../../../../core/models/api.models';
import { catchError, of } from 'rxjs';

/**
 * Servicio de estado reactivo para productos.
 *
 * Mantiene el estado global (signals) del módulo de productos y orquesta
 * las llamadas al ProductService (HTTP). Los componentes inyectan este servicio
 * para leer y manipular el estado de forma reactiva.
 *
 * Fase 1: Solo listado + delete
 * TODO: Agregar create, update, loadById cuando se implemente en UI
 */
@Injectable({
  providedIn: 'root',
})
export class ProductStateService {
  private productService = inject(ProductService);

  private _products = signal<ProductSummaryDto[]>([]);
  private _isLoading = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0);

  private _isActiveFilter = signal<boolean | null>(null);

  readonly products = this._products.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isDeleting = this._isDeleting.asReadonly();
  readonly currentPage = this._currentPage.asReadonly();
  readonly pageSize = this._pageSize.asReadonly();
  readonly totalElements = this._totalElements.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();

  readonly generalError = this._generalError.asReadonly();
  readonly operationSuccess = this._operationSuccess.asReadonly();

  readonly isActiveFilter = this._isActiveFilter.asReadonly();

  readonly isEmpty = computed(() => this._products().length === 0 && !this._isLoading());
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  /**
   * Cargar productos con paginación y filtro opcional de estado.
   * Se puede llamar al cambiar de página o al cambiar el filtro de isActive.
   * 
   * @param page número de página (default 0)
   * @param pageSize tamaño de página (default 10)
   * @param isActive filtro opcional: true=activos, false=inactivos, null=todos (default null)
   */
  loadProducts(page: number = 0, pageSize: number = 10, isActive: boolean | null = null): void {
    this._isLoading.set(true);
    this._generalError.set(null);
    this._isActiveFilter.set(isActive);

    this.productService.getAll(page, pageSize, isActive).pipe(
      catchError((error: AppError) => {
        this._generalError.set(error.message);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this._products.set(response.data.items);
        this._currentPage.set(response.data.currentPage);
        this._pageSize.set(response.data.pageSize);
        this._totalElements.set(response.data.totalElements);
        this._totalPages.set(response.data.totalPages);
        this._generalError.set(null);
      }
      this._isLoading.set(false);
    });
  }

  /**
   * Eliminar (soft-delete) un producto.
   * Implementado correctamente con subscribe({ next, error }) para evitar bug de categories
   * donde el error se ejecutaba como éxito.
   */
  deleteProduct(id: string): void {
    this._isDeleting.set(true);
    this._generalError.set(null);

    this.productService.delete(id).subscribe({
      next: () => {
        // Éxito (204): remover producto de la lista
        this._products.update(products => products.filter(p => p.id !== id));
        this._totalElements.update(t => Math.max(0, t - 1));
        this._generalError.set(null);
        this._isDeleting.set(false);
        // Incrementar contador de éxito para activar effects del componente
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        // Error: mostrar mensaje
        this._generalError.set(error.message);
        this._isDeleting.set(false);
      },
    });
  }

  clearErrors(): void {
    this._generalError.set(null);
  }
}
