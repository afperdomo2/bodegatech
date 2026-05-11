import type { OnInit } from '@angular/core';
import { Component, inject, signal, computed, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { RichSelectComponent } from '../../../../../shared/components/rich-select/rich-select.component';
import { MovementItemsFormComponent } from '../../components/movement-items-form.component';
import { MovementRegisterStateService } from '../../state/movement-register-state.service';
import type { MovementType } from '../../../../../core/constants/movement-type.constants';
import { MOVEMENT_TYPE_OPTIONS } from '../../../../../core/constants/movement-type.constants';
import type { CreateMovementRequest } from '../../../../../core/models/requests/movement.requests';
import { ToastService } from '../../../../../shared/services/toast.service';

@Component({
  selector: 'bt-movement-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeader,
    RichSelectComponent,
    MovementItemsFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movement-register.html',
  styleUrl: './movement-register.scss',
})
export class MovementRegisterComponent implements OnInit {
  state = inject(MovementRegisterStateService);
  private toast = inject(ToastService);

  submitTrigger = signal(0);
  resetTrigger = signal(0);
  isSubmitting = signal(false);
  itemsHasErrors = signal(false);

  formType = signal<MovementType | null>(null);
  formWarehouseId = signal<string | null>(null);
  formSupplierId = signal<string | null>(null);
  formReferenceDocument = signal('');
  formObservations = signal('');
  formItems = signal<{ productId: string; quantity: number }[]>([]);

  typeTouched = signal(false);
  warehouseTouched = signal(false);
  itemsTouched = signal(false);

  movementTypeOptions = MOVEMENT_TYPE_OPTIONS;

  warehouseOptions = computed(() => this.state.warehouses());
  productOptions = computed(() => this.state.products());
  supplierOptions = computed(() => this.state.suppliers());
  isLoadingOptions = computed(() => this.state.isLoadingOptions());

  isLoading = computed(() => this.state.isSubmitting() || this.isSubmitting());

  fieldErrors = computed(() => this.state.fieldErrors());
  generalError = computed(() => this.state.generalError());

  typeError = computed(() => {
    const error = this.fieldErrors()['type'];
    if (error) return error;
    if (!this.typeTouched()) return null;
    if (!this.formType()) return 'El tipo de movimiento es requerido';
    return null;
  });

  warehouseError = computed(() => {
    const error = this.fieldErrors()['warehouseId'];
    if (error) return error;
    if (!this.warehouseTouched()) return null;
    if (!this.formWarehouseId()) return 'La bodega es requerida';
    return null;
  });

  itemsError = computed(() => {
    const error = this.fieldErrors()['details'];
    if (error) return error;
    if (!this.itemsTouched()) return null;
    if (this.formItems().length === 0) return 'Debe agregar al menos un producto';
    return null;
  });

  hasErrors = computed(() => !!(
    this.typeError() ||
    this.warehouseError() ||
    this.itemsError() ||
    this.itemsHasErrors() ||
    this.generalError()
  ));

  isFormEmpty = computed(() => {
    return (
      !this.formType() &&
      !this.formWarehouseId() &&
      !this.formSupplierId() &&
      !this.formReferenceDocument() &&
      !this.formObservations() &&
      this.formItems().length === 0
    );
  });

  selectedTypeOption = computed(() => {
    const type = this.formType();
    if (!type) return null;
    return MOVEMENT_TYPE_OPTIONS.find(opt => opt.value === type);
  });

  constructor() {
    this.state.loadFormOptions();

    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.toast.success('Movimiento registrado exitosamente');
        this.resetForm();
        this.state.clearOperationSuccess();
      }
    });

    effect(() => {
      const error = this.generalError();
      if (error) {
        this.toast.error(error);
      }
    });
  }

  ngOnInit(): void {
    this.state.loadFormOptions();
  }

  onTypeChange(type: MovementType | null): void {
    this.formType.set(type);
  }

  onWarehouseChange(warehouseId: string | null): void {
    this.formWarehouseId.set(warehouseId);
  }

  onSupplierChange(supplierId: string | null): void {
    this.formSupplierId.set(supplierId);
  }

  onItemsChange(items: { productId: string; quantity: number }[]): void {
    this.formItems.set(items);
  }

  onItemsHasErrors(hasErrors: boolean): void {
    this.itemsHasErrors.set(hasErrors);
  }

  markTypeTouched(): void {
    this.typeTouched.set(true);
  }

  markWarehouseTouched(): void {
    this.warehouseTouched.set(true);
  }

  onItemsTouched(): void {
    this.itemsTouched.set(true);
  }

  submitForm(): void {
    this.typeTouched.set(true);
    this.warehouseTouched.set(true);
    this.itemsTouched.set(true);
    this.submitTrigger.update(v => v + 1);

    if (this.hasErrors()) {
      return;
    }

    const request: CreateMovementRequest = {
      type: this.formType()!,
      warehouseId: this.formWarehouseId()!,
      supplierId: this.formSupplierId() || undefined,
      referenceDocument: this.formReferenceDocument() || undefined,
      observations: this.formObservations() || undefined,
      details: this.formItems(),
    };

    this.state.createMovement(request);
  }

  resetForm(): void {
    this.formType.set(null);
    this.formWarehouseId.set(null);
    this.formSupplierId.set(null);
    this.formReferenceDocument.set('');
    this.formObservations.set('');
    this.formItems.set([]);

    this.typeTouched.set(false);
    this.warehouseTouched.set(false);
    this.itemsTouched.set(false);
    this.submitTrigger.set(0);
    this.resetTrigger.update(v => v + 1);

    this.state.clearErrors();
  }
}