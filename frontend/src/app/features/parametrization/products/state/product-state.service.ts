import { Injectable, inject, signal, computed } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { UnitService } from '../../../../core/services/unit.service';
import type {
  ProductSummaryDto,
  ProductDetail,
} from '../../../../core/models/responses/product.responses';
import type { CategorySummaryDto } from '../../../../core/models/responses/category.responses';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from '../../../../core/models/requests/product.requests';
import type { AppError } from '../../../../core/models/api.models';
import { catchError, of, forkJoin } from 'rxjs';

/**
 * Servicio de estado reactivo para productos.
 *
 * Mantiene el estado global (signals) del módulo de productos y orquesta
 * las llamadas al ProductService (HTTP). Los componentes inyectan este servicio
 * para leer y manipular el estado de forma reactiva.
 *
 * Fase 2: Completo (listado + delete + create + update + loadById)
 */
@Injectable({
  providedIn: 'root',
})
export class ProductStateService {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private unitService = inject(UnitService);

  // ========== ESTADO PRIVADO (WRITABLE SIGNALS) ==========

  private _products = signal<ProductSummaryDto[]>([]);
  private _isLoading = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0);

  private _selectedDetail = signal<ProductDetail | null>(null);
  private _isLoadingDetail = signal(false);

  private _categories = signal<CategorySummaryDto[]>([]);
  private _units = signal<MeasurementUnitSummaryDto[]>([]);
  private _isLoadingFormDeps = signal(false);

  private _isActiveFilter = signal<boolean | null>(null);

  // ========== ESTADO PÚBLICO (READ-ONLY SIGNALS) ==========

  readonly products = this._products.asReadonly();
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

  readonly categories = this._categories.asReadonly();
  readonly units = this._units.asReadonly();
  readonly isLoadingFormDeps = this._isLoadingFormDeps.asReadonly();

  readonly isActiveFilter = this._isActiveFilter.asReadonly();

  // ========== COMPUTED STATE ==========

  readonly hasError = computed(() => this._generalError() !== null || Object.keys(this._fieldErrors()).length > 0);
  readonly isEmpty = computed(() => this._products().length === 0 && !this._isLoading());
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  // ========== MÉTODOS PÚBLICOS ==========

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
   * Cargar las listas de apoyo (categorías y unidades) para los formularios.
   * Se llama lazy al abrir un modal de crear/editar.
   * Usa forkJoin para cargar ambas en paralelo.
   */
  loadFormDependencies(): void {
    this._isLoadingFormDeps.set(true);
    this._generalError.set(null);

    forkJoin({
      categories: this.categoryService.getAll(0, 1000, true), // Solo categorías activas
      units: this.unitService.getAll(0, 1000, true), // Solo unidades activas
    }).pipe(
      catchError((error: AppError) => {
        this._generalError.set(error.message);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this._categories.set(response.categories.data.items);
        this._units.set(response.units.data.items);
        this._generalError.set(null);
      }
      this._isLoadingFormDeps.set(false);
    });
  }

  /**
   * Crear un nuevo producto.
   * Limpia errores previos y maneja errores de validación (400) y conflicto (409).
   */
  createProduct(request: CreateProductRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.productService.create(request).pipe(
      catchError((error: AppError) => {
        if (error.status === 400 && error.fieldErrors) {
          // Errores de validación por campo
          this._fieldErrors.set(error.fieldErrors);
        } else {
          // Otros errores (409, 500, etc.)
          this._generalError.set(error.message);
        }
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        // Éxito: agregar nuevo producto al inicio de la lista
        this._products.update(products => [(response.data as ProductSummaryDto), ...products]);
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._totalElements.update(t => t + 1);
        this._operationSuccess.update(val => val + 1);
      }
    });
  }

  /**
   * Actualizar un producto existente.
   */
  updateProduct(id: string, request: UpdateProductRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.productService.update(id, request).pipe(
      catchError((error: AppError) => {
        if (error.status === 400 && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        // Éxito: actualizar el producto en la lista
        this._products.update(products =>
          products.map(prod => prod.id === id ? (response.data as ProductSummaryDto) : prod)
        );
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._operationSuccess.update(val => val + 1);
      }
    });
  }

  /**
   * Eliminar (soft-delete) un producto.
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
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isDeleting.set(false);
      },
    });
  }

  /**
   * Cargar detalle de un producto por ID (datos frescos para edición).
   */
  loadProductById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);

    this.productService.getById(id).pipe(
      catchError((error: AppError) => {
        this._generalError.set(error.message);
        this._isLoadingDetail.set(false);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this._selectedDetail.set(response.data);
        this._generalError.set(null);
      }
      this._isLoadingDetail.set(false);
    });
  }

  /**
   * Limpiar errores manualmente (ej: al cerrar un modal).
   */
  clearErrors(): void {
    this._fieldErrors.set({});
    this._generalError.set(null);
    this._selectedDetail.set(null);
  }
}
