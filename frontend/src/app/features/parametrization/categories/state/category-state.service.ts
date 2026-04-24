import { Injectable, inject, signal, computed } from '@angular/core';
import { CategoryService } from '../../../../core/services/category.service';
import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from '../../../../core/models/category.models';
import type { AppError } from '../../../../core/models/api.models';
import { catchError, of } from 'rxjs';

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

  private _categories = signal<CategoryDto[]>([]);
  private _isLoading = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);

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
   * Cargar categorías con paginación.
   * Se puede llamar al cambiar de página.
   */
  loadCategories(page: number = 0, pageSize: number = 10): void {
    this._isLoading.set(true);
    this._generalError.set(null);

    this.categoryService.getAll(page, pageSize).pipe(
      catchError((error: AppError) => {
        this._generalError.set(error.message);
        return of(null);
      })
    ).subscribe(response => {
      if (response) {
        this._categories.set(response.data.items);
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
   * Crear una nueva categoría.
   * Limpia errores previos y maneja errores de validación (400) y conflicto (409).
   */
  createCategory(request: CreateCategoryRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.categoryService.create(request).pipe(
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
        // Éxito: agregar nueva categoría al inicio de la lista
        this._categories.update(cats => [response.data, ...cats]);
        this._generalError.set(null);
        this._fieldErrors.set({});
        // Recalcular total elementos
        this._totalElements.update(t => t + 1);
      }
    });
  }

  /**
   * Actualizar una categoría existente.
   */
  updateCategory(id: string, request: UpdateCategoryRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.categoryService.update(id, request).pipe(
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
        // Éxito: actualizar la categoría en la lista
        this._categories.update(cats =>
          cats.map(cat => cat.id === id ? response.data : cat)
        );
        this._generalError.set(null);
        this._fieldErrors.set({});
      }
    });
  }

  /**
   * Eliminar (soft-delete) una categoría.
   * Maneja el error 409 si la categoría tiene productos asignados.
   */
  deleteCategory(id: string): void {
    this._isDeleting.set(true);
    this._generalError.set(null);

    this.categoryService.delete(id).pipe(
      catchError((error: AppError) => {
        this._generalError.set(error.message);
        return of(null);
      })
    ).subscribe(() => {
      // Éxito (204): remover categoría de la lista
      this._categories.update(cats => cats.filter(cat => cat.id !== id));
      this._totalElements.update(t => Math.max(0, t - 1));
      this._generalError.set(null);
      this._isDeleting.set(false);
    });
  }

  /**
   * Limpiar errores manualmente (ej: al cerrar un modal).
   */
  clearErrors(): void {
    this._fieldErrors.set({});
    this._generalError.set(null);
  }
}
