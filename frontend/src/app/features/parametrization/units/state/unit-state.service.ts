import { Injectable, inject, signal, computed } from '@angular/core';
import { UnitService } from '../../../../core/services/unit.service';
import type {
  CreateMeasurementUnitRequest,
  UpdateMeasurementUnitRequest,
} from '../../../../core/models/requests/unit.requests';
import type {
  MeasurementUnitSummaryDto,
  MeasurementUnitDetail,
  MeasurementUnitRelatedDto,
} from '../../../../core/models/responses/unit.responses';
import type { AppError } from '../../../../core/models/api.models';
import type { UnitType } from '../../../../core/constants/unit-type.constants';

/**
 * Servicio de estado reactivo para unidades de medida.
 *
 * Mantiene el estado global (signals) del módulo de unidades y orquesta
 * las llamadas al UnitService (HTTP). Los componentes inyectan este servicio
 * para leer y manipular el estado de forma reactiva.
 *
 * Patrón:
 * - Estado privado (_units, _isLoading, etc.) escrito vía signals
 * - Lectura pública vía .asReadonly() para que los componentes no puedan mutarlo
 * - Métodos públicos (loadUnits, createUnit, etc.) que manejan lógica de negocio
 */
@Injectable({
  providedIn: 'root',
})
export class UnitStateService {
  private unitService = inject(UnitService);

  private _units = signal<MeasurementUnitSummaryDto[]>([]);
  private _baseUnitsForType = signal<MeasurementUnitSummaryDto[]>([]);
  private _isLoading = signal(false);
  private _isLoadingBaseUnits = signal(false);
  private _isDeleting = signal(false);
  private _currentPage = signal(0);
  private _pageSize = signal(10);
  private _totalElements = signal(0);
  private _totalPages = signal(0);

  private _fieldErrors = signal<Record<string, string>>({});
  private _generalError = signal<string | null>(null);
  private _operationSuccess = signal(0); // Contador que incrementa en cada operación exitosa

  private _selectedDetail = signal<MeasurementUnitDetail | null>(null);
  private _isLoadingDetail = signal(false);
  
  private _isActiveFilter = signal<boolean | null>(null); // null = Todos, true = Activos, false = Inactivos

  private _relatedUnits = signal<MeasurementUnitRelatedDto[]>([]);
  private _isLoadingRelated = signal(false);

  readonly units = this._units.asReadonly();
  readonly baseUnitsForType = this._baseUnitsForType.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoadingBaseUnits = this._isLoadingBaseUnits.asReadonly();
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

  readonly relatedUnits = this._relatedUnits.asReadonly();
  readonly isLoadingRelated = this._isLoadingRelated.asReadonly();

  readonly hasError = computed(
    () => this._generalError() !== null || Object.keys(this._fieldErrors()).length > 0
  );
  readonly isEmpty = computed(() => this._units().length === 0 && !this._isLoading());
  readonly isLast = computed(() => this._currentPage() >= this._totalPages() - 1);

  /**
   * Cargar unidades con paginación y filtro opcional de estado.
   * Se puede llamar al cambiar de página o al cambiar el filtro de isActive.
   * 
   * @param page número de página (default 0)
   * @param pageSize tamaño de página (default 10)
   * @param isActive filtro opcional: true=activos, false=inactivos, null=todos (default null)
   */
  loadUnits(page: number = 0, pageSize: number = 10, isActive: boolean | null = null): void {
    this._isLoading.set(true);
    this._generalError.set(null);
    this._isActiveFilter.set(isActive);

    this.unitService.getAll(page, pageSize, isActive).subscribe({
      next: (response) => {
        this._units.set(response.data.items);
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

  loadBaseUnitsOfType(type: UnitType): void {
    this._isLoadingBaseUnits.set(true);
    this._generalError.set(null);

    this.unitService.getBaseUnitsOfType(type).subscribe({
      next: (response) => {
        this._baseUnitsForType.set(response.data.items);
        this._isLoadingBaseUnits.set(false);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isLoadingBaseUnits.set(false);
      },
    });
  }

  createUnit(request: CreateMeasurementUnitRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.unitService.create(request).subscribe({
      next: (response) => {
        this._units.update(units => [response.data as MeasurementUnitSummaryDto, ...units]);
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

  updateUnit(id: string, request: UpdateMeasurementUnitRequest): void {
    this._fieldErrors.set({});
    this._generalError.set(null);

    this.unitService.update(id, request).subscribe({
      next: (response) => {
        this._units.update(units =>
          units.map(unit => unit.id === id ? (response.data as MeasurementUnitSummaryDto) : unit)
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

  deleteUnit(id: string): void {
    this._isDeleting.set(true);
    this._generalError.set(null);

    this.unitService.delete(id).subscribe({
      next: () => {
        this._units.update(units => units.filter(unit => unit.id !== id));
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

  loadUnitById(id: string): void {
    this._isLoadingDetail.set(true);
    this._generalError.set(null);

    this.unitService.getById(id).subscribe({
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
    this._relatedUnits.set([]);
  }

  loadRelatedUnits(baseUnitId: string): void {
    this._isLoadingRelated.set(true);
    this._generalError.set(null);

    this.unitService.getRelated(baseUnitId).subscribe({
      next: (response) => {
        this._relatedUnits.set(response.data);
        this._generalError.set(null);
        this._isLoadingRelated.set(false);
      },
      error: (error: AppError) => {
        this._generalError.set(error.message);
        this._isLoadingRelated.set(false);
      },
    });
  }
}
