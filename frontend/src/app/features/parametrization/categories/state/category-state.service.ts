import { Injectable, inject, signal, computed } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../../core/models/requests/category.requests';
import type { CategorySummaryDto, CategoryDetail } from '../../../../core/models/responses/category.responses';
import type { AppError } from '../../../../core/models/api.models';

/**
 * Servicio de estado reactivo para categorías.
 * 
 * Mantiene el estado global (signals) del módulo de categorías y orquesta
 * las llamadas al CategoryService (HTTP). Los componentes inyectan este servicio
 * para leer y manipular el estado de forma reactiva.
 * 
 * Patrón: 
 * - Estado privado (_categories, _isLoading, etc.) escrito vía signals
 * - Lectura pública vía .asReadonly() para que los componentes no puedan mutarlo
 * - Métodos públicos (loadCategories, createCategory, etc.) que manejan lógica de negocio
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryStateService {
  private categoryService = inject(CategoryService);

  // ========== ESTADO PRIVADO (WRITABLE SIGNALS) ==========

  private _categories = signal<CategorySummaryDto[]>([]);
  private _isLoading = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0); // Contador que incrementa en cada operación exitosa

  private _selectedDetail = signal<CategoryDetail | null>(null);
  private _isLoadingDetail = signal(false);
  
  private _isActiveFilter = signal<boolean | null>(null); // null = Todos, true = Activos, false = Inactivos

  // ========== ESTADO PÚBLICO (READ-ONLY SIGNALS) ==========

  readonly categories = this._categories.asReadonly();
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

  // ========== COMPUTED STATE ==========

  /**
   * Indica si hay algún error activo
   */
  readonly hasError = computed(() => this._generalError() !== null || Object.keys(this._fieldErrors()).length > 0);

  /**
   * Indica si hay resultados sin paginar
   */
  readonly isEmpty = computed(() => this._categories().length === 0 && !this._isLoading());

  /**
   * Indica si estamos en la última página
   */
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  // ========== MÉTODOS PÚBLICOS ==========

  /**
   * Cargar categorías con paginación y filtro opcional de estado.
   * Se puede llamar al cambiar de página o al cambiar el filtro de isActive.
   * 
   * @param page número de página (default 0)
   * @param pageSize tamaño de página (default 10)
   * @param isActive filtro opcional: true=activos, false=inactivos, null=todos (default null)
   */
  loadCategories(page: number = 0, pageSize: number = 10, isActive: boolean | null = null): void {
    this._isLoading.set(true);
    this._generalError.set(null);
    this._isActiveFilter.set(isActive);

    this.categoryService.getAll(page, pageSize, isActive).subscribe({
      next: (response) => {
        this._categories.set(response.data.items);
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

  /**
   * Crear una nueva categoría.
   * Limpia errores previos y maneja errores de validación (400) y conflicto (409).
   */
  createCategory(request: CreateCategoryRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.categoryService.create(request).subscribe({
      next: (response) => {
        this._categories.update(cats => [(response.data as CategorySummaryDto), ...cats]);
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._totalElements.update(t => t + 1);
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        if (error.status === 400 && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
      },
    });
  }

  /**
   * Actualizar una categoría existente.
   */
  updateCategory(id: string, request: UpdateCategoryRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.categoryService.update(id, request).subscribe({
      next: (response) => {
        this._categories.update(cats =>
          cats.map(cat => cat.id === id ? (response.data as CategorySummaryDto) : cat)
        );
        this._generalError.set(null);
        this._fieldErrors.set({});
        this._operationSuccess.update(val => val + 1);
      },
      error: (error: AppError) => {
        if (error.status === 400 && error.fieldErrors) {
          this._fieldErrors.set(error.fieldErrors);
        } else {
          this._generalError.set(error.message);
        }
      },
    });
  }

  /**
   * Eliminar (soft-delete) una categoría.
   * Maneja el error 409 si la categoría tiene productos asignados.
   */
  deleteCategory(id: string): void {
    this._isDeleting.set(true);
    this._generalError.set(null);

    this.categoryService.delete(id).subscribe({
      next: () => {
        this._categories.update(cats => cats.filter(cat => cat.id !== id));
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
   * Limpiar errores manualmente (ej: al cerrar un modal).
   */
  clearErrors(): void {
    this._fieldErrors.set({});
    this._generalError.set(null);
    this._selectedDetail.set(null);
  }

  /**
   * Cargar detalle de una categoría por ID (datos frescos para edición).
   * Consulta el endpoint GET /api/categories/{id} para obtener datos actualizados.
   */
  loadCategoryById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);

    this.categoryService.getById(id).subscribe({
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
}
