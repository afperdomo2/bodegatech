import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import type { MeasurementUnitDto } from '../../../../../core/models/responses/unit.responses';
import type { CreateMeasurementUnitRequest, UpdateMeasurementUnitRequest } from '../../../../../core/models/requests/unit.requests';
import { getUnitTypeLabel, type UnitType } from '../../../../../core/constants/unit-type.constants';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { UnitStateService } from '../../state/unit-state.service';
import { UnitCreateModalComponent } from '../../components/unit-create-modal.component';
import { UnitEditModalComponent } from '../../components/unit-edit-modal.component';
import { UnitDeleteModalComponent } from '../../components/unit-delete-modal.component';

@Component({
  selector: 'bt-units',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    UnitCreateModalComponent,
    UnitEditModalComponent,
    UnitDeleteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units.html',
  styleUrl: './units.scss',
})
export class UnitsComponent implements OnInit {
  protected state = inject(UnitStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild(UnitCreateModalComponent) createModalComponent!: UnitCreateModalComponent;
  @ViewChild(UnitEditModalComponent) editModalComponent!: UnitEditModalComponent;
  @ViewChild(UnitDeleteModalComponent) deleteModalComponent!: UnitDeleteModalComponent;

  protected getUnitTypeLabel = getUnitTypeLabel;

  formName = signal('');
  formAbbreviation = signal('');
  formType = signal<UnitType | null>(null);
  formIsBaseUnit = signal(true);
  formBaseUnitId = signal<string | null>(null);
  formConversionFactor = signal('');

  selectedUnit = signal<MeasurementUnitDto | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');

  tableColumns: DataTableColumn[] = [
    { key: 'isBaseUnit', label: 'Base', type: 'checkbox-disabled', align: 'center' },
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'abbreviation', label: 'Abreviación', type: 'text', align: 'center' },
    {
      key: 'type',
      label: 'Tipo',
      type: 'text',
      align: 'center',
      formatter: (value: unknown) => getUnitTypeLabel(value as UnitType),
    },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];

  constructor() {
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();

        const messages = {
          create: 'Unidad de medida creada correctamente',
          edit: 'Unidad de medida actualizada correctamente',
          delete: 'Unidad de medida eliminada correctamente',
        };

        const action = this.pendingAction();
        if (action) {
          this.toastService.success(messages[action]);
          this.pendingAction.set(null);
        }
      }
    });

    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.resetFormSignals();
        this.selectedUnit.set(null);
      }
    });

    effect(() => {
      if (this.state.selectedDetail()) {
        const detail = this.state.selectedDetail();
        if (detail) {
          this.formName.set(detail.name);
          this.formAbbreviation.set(detail.abbreviation);
          this.formType.set(detail.type);
          this.formIsBaseUnit.set(detail.isBaseUnit);
          this.formBaseUnitId.set(detail.baseUnitId);
          this.formConversionFactor.set(detail.conversionFactor ? detail.conversionFactor.toString() : '');
        }
      }
    });

    effect(() => {
      if (this.state.generalError()) {
        this.toastService.error(this.state.generalError() || 'Error desconocido');
      }
    });
  }

  private resetFormSignals(): void {
    this.formName.set('');
    this.formAbbreviation.set('');
    this.formType.set(null);
    this.formIsBaseUnit.set(true);
    this.formBaseUnitId.set(null);
    this.formConversionFactor.set('');
  }

  ngOnInit(): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadUnits(0, this.state.pageSize(), filterValue);
  }

  onTypeChange(type: UnitType | null): void {
    this.formType.set(type);
    if (type && !this.formIsBaseUnit()) {
      this.state.loadBaseUnitsOfType(type);
      this.formBaseUnitId.set(null);
    }
  }

  onIsBaseUnitChange(isBase: boolean): void {
    this.formIsBaseUnit.set(isBase);
    if (isBase) {
      this.formBaseUnitId.set(null);
      this.formConversionFactor.set('');
    } else if (this.formType()) {
      this.state.loadBaseUnitsOfType(this.formType()!);
    }
  }

  openCreateModal(): void {
    this.resetFormSignals();
    this.state.clearErrors();
    this.modalService.open({
      title: 'Nueva Unidad de Medida',
      template: this.createModalComponent.templateRef,
      size: 'lg',
      onConfirm: () => this.confirmCreateUnit(),
      onCancel: () => {},
    });
  }

  confirmCreateUnit(): false | void {
    this.createModalComponent.form.markAllTouched();

    if (this.createModalComponent.form.hasErrors()) {
      return false;
    }

    this.pendingAction.set('create');
    const formValues = this.createModalComponent.form.getFormValues();
    const request: CreateMeasurementUnitRequest = {
      name: formValues.name,
      abbreviation: formValues.abbreviation,
      type: formValues.type!,
      isBaseUnit: formValues.isBaseUnit,
      baseUnitId: formValues.isBaseUnit ? undefined : formValues.baseUnitId || undefined,
      conversionFactor: formValues.isBaseUnit
        ? undefined
        : formValues.conversionFactor
          ? parseFloat(formValues.conversionFactor)
          : undefined,
    };

    this.state.createUnit(request);
  }

  openEditModal(unit: MeasurementUnitDto): void {
    this.selectedUnit.set(unit);
    this.state.loadUnitById(unit.id);
    this.state.clearErrors();

    // Si es unidad base, cargar sus unidades derivadas
    if (unit.isBaseUnit) {
      this.state.loadRelatedUnits(unit.id);
    }

    this.modalService.open({
      title: 'Editar Unidad de Medida',
      template: this.editModalComponent.templateRef,
      size: unit.isBaseUnit ? 'xl' : 'lg',
      onConfirm: () => this.confirmEditUnit(),
      onCancel: () => {},
      isLoading: () => this.state.isLoadingDetail(),
    });
  }

  confirmEditUnit(): false | void {
    this.editModalComponent.form.markAllTouched();

    if (this.editModalComponent.form.hasErrors() || !this.selectedUnit()) {
      return false;
    }

    this.pendingAction.set('edit');
    const formValues = this.editModalComponent.form.getFormValues();
    const request: UpdateMeasurementUnitRequest = {
      name: formValues.name,
      abbreviation: formValues.abbreviation,
      conversionFactor: formValues.isBaseUnit
        ? undefined
        : formValues.conversionFactor
          ? parseFloat(formValues.conversionFactor)
          : undefined,
      isActive: this.editModalComponent.getIsActive(),
    };

    this.state.updateUnit(this.selectedUnit()!.id, request);
  }

  openDeleteModal(unit: MeasurementUnitDto): void {
    this.selectedUnit.set(unit);
    this.modalService.open({
      title: 'Eliminar Unidad de Medida',
      template: this.deleteModalComponent.templateRef,
      size: 'md',
      onConfirm: () => this.confirmDeleteUnit(),
      onCancel: () => {},
    });
  }

  confirmDeleteUnit(): void {
    if (!this.selectedUnit()) return;
    this.pendingAction.set('delete');
    this.state.deleteUnit(this.selectedUnit()!.id);
  }

  onIsActiveFilterChange(value: string): void {
    let isActive: boolean | null = null;
    if (value === 'active') {
      isActive = true;
    } else if (value === 'inactive') {
      isActive = false;
    }
    this.state.loadUnits(0, this.state.pageSize(), isActive);
  }

  onPageChange(newPage: number): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadUnits(newPage - 1, this.state.pageSize(), filterValue);
  }

  onEditClick(unit: unknown): void {
    this.openEditModal(unit as MeasurementUnitDto);
  }

  onDeleteClick(unit: unknown): void {
    this.openDeleteModal(unit as MeasurementUnitDto);
  }

  refreshUnits(): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadUnits(this.state.currentPage(), this.state.pageSize(), filterValue);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }
}
