import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, type TemplateRef, ViewChild } from '@angular/core';
import type { MeasurementUnitDto, CreateUnitRequest, UpdateUnitRequest } from '../../../../../core/models/unit.models';
import { UNIT_TYPE_OPTIONS, getUnitTypeLabel, type UnitType } from '../../../../../core/constants/unit-type.constants';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { UnitStateService } from '../../state/unit-state.service';

@Component({
  selector: 'bt-units',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './units.html',
  styleUrl: './units.scss',
})
export class UnitsComponent implements OnInit {
  protected state = inject(UnitStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild('createModalTemplate') createModalTemplate!: TemplateRef<Record<string, never>>;
  @ViewChild('editModalTemplate') editModalTemplate!: TemplateRef<Record<string, never>>;
  @ViewChild('deleteModalTemplate') deleteModalTemplate!: TemplateRef<Record<string, never>>;

  protected unitTypeOptions = UNIT_TYPE_OPTIONS;

  formName = signal('');
  formAbbreviation = signal('');
  formType = signal<UnitType | null>(null);
  formIsBaseUnit = signal(false);
  formBaseUnitId = signal<string | null>(null);
  formConversionFactor = signal('');

  nameTouched = signal(false);
  abbreviationTouched = signal(false);
  typeTouched = signal(false);
  baseUnitIdTouched = signal(false);
  conversionFactorTouched = signal(false);

  selectedUnit = signal<MeasurementUnitDto | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);

  nameError = computed((): string | null => {
    if (!this.nameTouched()) return null;
    const val = this.formName().trim();
    if (!val) return 'El nombre es obligatorio';
    if (val.length < 1) return 'Mínimo 1 carácter';
    if (val.length > 100) return 'Máximo 100 caracteres';
    return null;
  });

  abbreviationError = computed((): string | null => {
    if (!this.abbreviationTouched()) return null;
    const val = this.formAbbreviation().trim();
    if (!val) return 'La abreviación es obligatoria';
    if (val.length < 1) return 'Mínimo 1 carácter';
    if (val.length > 20) return 'Máximo 20 caracteres';
    return null;
  });

  typeError = computed((): string | null => {
    if (!this.typeTouched()) return null;
    if (!this.formType()) return 'El tipo es obligatorio';
    return null;
  });

  baseUnitIdError = computed((): string | null => {
    if (!this.baseUnitIdTouched() || this.formIsBaseUnit()) return null;
    if (!this.formBaseUnitId()) return 'Debe seleccionar una unidad base';
    return null;
  });

  conversionFactorError = computed((): string | null => {
    if (!this.conversionFactorTouched() || this.formIsBaseUnit()) return null;
    const val = this.formConversionFactor().trim();
    if (!val) return 'El factor de conversión es obligatorio';
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return 'Debe ser un número positivo';
    return null;
  });

  hasClientErrors = computed(() => {
    const name = this.formName().trim();
    if (!name || name.length < 1 || name.length > 100) return true;
    const abbr = this.formAbbreviation().trim();
    if (!abbr || abbr.length < 1 || abbr.length > 20) return true;
    if (!this.formType()) return true;
    if (!this.formIsBaseUnit()) {
      if (!this.formBaseUnitId()) return true;
      const convFactor = this.formConversionFactor().trim();
      if (!convFactor || parseFloat(convFactor) <= 0) return true;
    }
    return false;
  });

  isFormValid = computed(() => this.formName().trim().length > 0);

  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'abbreviation', label: 'Abreviación', type: 'text', align: 'center' },
    {
      key: 'type',
      label: 'Tipo',
      type: 'text',
      align: 'center',
      formatter: (value: unknown) => getUnitTypeLabel(value as UnitType),
    },
    { key: 'isBaseUnit', label: 'Unidad Base', type: 'badge', align: 'center' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' },
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
        this.formName.set('');
        this.formAbbreviation.set('');
        this.formType.set(null);
        this.formIsBaseUnit.set(false);
        this.formBaseUnitId.set(null);
        this.formConversionFactor.set('');
        this.selectedUnit.set(null);
        this.nameTouched.set(false);
        this.abbreviationTouched.set(false);
        this.typeTouched.set(false);
        this.baseUnitIdTouched.set(false);
        this.conversionFactorTouched.set(false);
      }
    });

    effect(() => {
      if (this.state.generalError()) {
        this.toastService.error(this.state.generalError() || 'Error desconocido');
      }
    });
  }

  ngOnInit(): void {
    this.state.loadUnits(0, this.state.pageSize());
  }

  private markAllTouched(): void {
    this.nameTouched.set(true);
    this.abbreviationTouched.set(true);
    this.typeTouched.set(true);
    if (!this.formIsBaseUnit()) {
      this.baseUnitIdTouched.set(true);
      this.conversionFactorTouched.set(true);
    }
  }

  onTypeChange(): void {
    if (this.formType() && !this.formIsBaseUnit()) {
      this.state.loadBaseUnitsOfType(this.formType()!);
      this.formBaseUnitId.set(null);
    }
  }

  onIsBaseUnitChange(): void {
    if (this.formIsBaseUnit()) {
      this.formBaseUnitId.set(null);
      this.formConversionFactor.set('');
    } else if (this.formType()) {
      this.state.loadBaseUnitsOfType(this.formType()!);
    }
  }

  openCreateModal(): void {
    this.formName.set('');
    this.formAbbreviation.set('');
    this.formType.set(null);
    this.formIsBaseUnit.set(false);
    this.formBaseUnitId.set(null);
    this.formConversionFactor.set('');
    this.state.clearErrors();
    this.modalService.open({
      title: 'Nueva Unidad de Medida',
      template: this.createModalTemplate,
      size: 'lg',
      onConfirm: () => this.confirmCreateUnit(),
      onCancel: () => {},
    });
  }

  confirmCreateUnit(): false | void {
    this.markAllTouched();

    if (this.hasClientErrors()) {
      return false;
    }

    this.pendingAction.set('create');
    const request: CreateUnitRequest = {
      name: this.formName(),
      abbreviation: this.formAbbreviation(),
      type: this.formType()!,
      isBaseUnit: this.formIsBaseUnit(),
      baseUnitId: this.formIsBaseUnit() ? undefined : this.formBaseUnitId() || undefined,
      conversionFactor: this.formIsBaseUnit()
        ? undefined
        : (this.formConversionFactor() ? parseFloat(this.formConversionFactor()) : undefined),
    };

    this.state.createUnit(request);
  }

  openEditModal(unit: MeasurementUnitDto): void {
    this.selectedUnit.set(unit);
    this.formName.set(unit.name);
    this.formAbbreviation.set(unit.abbreviation);
    this.formType.set(unit.type);
    this.formIsBaseUnit.set(unit.isBaseUnit);
    this.formBaseUnitId.set(unit.baseUnitId);
    this.formConversionFactor.set(unit.conversionFactor ? unit.conversionFactor.toString() : '');
    this.state.clearErrors();
    this.modalService.open({
      title: 'Editar Unidad de Medida',
      template: this.editModalTemplate,
      size: 'lg',
      onConfirm: () => this.confirmEditUnit(),
      onCancel: () => {},
    });
  }

  confirmEditUnit(): false | void {
    this.markAllTouched();

    if (this.hasClientErrors() || !this.selectedUnit()) {
      return false;
    }

    this.pendingAction.set('edit');
    const request: UpdateUnitRequest = {
      name: this.formName(),
      abbreviation: this.formAbbreviation(),
      conversionFactor: this.formIsBaseUnit()
        ? undefined
        : (this.formConversionFactor() ? parseFloat(this.formConversionFactor()) : undefined),
    };

    this.state.updateUnit(this.selectedUnit()!.id, request);
  }

  openDeleteModal(unit: MeasurementUnitDto): void {
    this.selectedUnit.set(unit);
    this.modalService.open({
      title: 'Eliminar Unidad de Medida',
      template: this.deleteModalTemplate,
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

  onPageChange(newPage: number): void {
    this.state.loadUnits(newPage - 1, this.state.pageSize());
  }

  onEditClick(unit: unknown): void {
    this.openEditModal(unit as MeasurementUnitDto);
  }

  onDeleteClick(unit: unknown): void {
    this.openDeleteModal(unit as MeasurementUnitDto);
  }

  refreshUnits(): void {
    this.state.loadUnits(this.state.currentPage(), this.state.pageSize());
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }
}
