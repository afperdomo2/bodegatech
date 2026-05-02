import { Component, input, output, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { type UnitType, UNIT_TYPE_OPTIONS } from '../../../../core/constants/unit-type.constants';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';

@Component({
  selector: 'bt-unit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">Nombre *</label>
        <input
          type="text"
          [(ngModel)]="formNameLocal"
          (blur)="nameTouched.set(true)"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          placeholder="Ej: Kilogramo" />
        @if (nameError()) {
          <p class="text-xs text-error mt-1">{{ nameError() }}</p>
        }
      </div>

      <!-- Abreviación -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">Abreviación *</label>
        <input
          type="text"
          [(ngModel)]="formAbbreviationLocal"
          (blur)="abbreviationTouched.set(true)"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          placeholder="Ej: kg" />
        @if (abbreviationError()) {
          <p class="text-xs text-error mt-1">{{ abbreviationError() }}</p>
        }
      </div>

      <!-- Tipo -->
      @if (!isEditMode()) {
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Tipo *</label>
          <select
            [(ngModel)]="formTypeLocal"
            (change)="handleTypeChange()"
            (blur)="typeTouched.set(true)"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors">
            <option [value]="null">Seleccionar tipo...</option>
            @for (option of unitTypeOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
          @if (typeError()) {
            <p class="text-xs text-error mt-1">{{ typeError() }}</p>
          }
        </div>
      }

      <!-- Es unidad base -->
      @if (!isEditMode()) {
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            id="isBaseUnit"
            [(ngModel)]="formIsBaseUnitLocal"
            (change)="handleIsBaseUnitChange()"
            class="w-4 h-4 rounded border border-outline-variant accent-primary" />
          <label for="isBaseUnit" class="text-sm font-medium text-on-surface cursor-pointer">
            Es unidad base
          </label>
        </div>
      }

      <!-- Conditional: Unidad Base (only in CREATE mode when NOT base unit) -->
      @if (!formIsBaseUnitLocal() && !isEditMode()) {
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Unidad Base *</label>
          <div class="relative">
            <select
              [(ngModel)]="formBaseUnitIdLocal"
              (blur)="baseUnitIdTouched.set(true)"
              class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors">
              <option [value]="null">Seleccionar unidad base...</option>
              @for (unit of baseUnitsForType(); track unit.id) {
                <option [value]="unit.id">{{ unit.name }}</option>
              }
            </select>
            @if (isLoadingBaseUnits()) {
              <span class="absolute right-3 top-1/2 -translate-y-1/2">
                <span class="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              </span>
            }
          </div>
          @if (baseUnitIdError()) {
            <p class="text-xs text-error mt-1">{{ baseUnitIdError() }}</p>
          }
        </div>
      }

      <!-- Factor de Conversión (only when NOT base unit) -->
      @if (!formIsBaseUnitLocal()) {
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Factor de Conversión *</label>
          <input
            type="number"
            step="0.0000000001"
            [(ngModel)]="formConversionFactorLocal"
            (blur)="conversionFactorTouched.set(true)"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface placeholder:text-on-surface-variant text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="Ej: 1000" />
          @if (conversionFactorError()) {
            <p class="text-xs text-error mt-1">{{ conversionFactorError() }}</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UnitFormComponent {
  // Inputs
  formName = input<string>('');
  formAbbreviation = input<string>('');
  formType = input<UnitType | null>(null);
  formIsBaseUnit = input<boolean>(true);
  formBaseUnitId = input<string | null>(null);
  formConversionFactor = input<string>('');
  isEditMode = input<boolean>(false);
  baseUnitsForType = input<MeasurementUnitSummaryDto[]>([]);
  isLoadingBaseUnits = input<boolean>(false);
  fieldErrors = input<Record<string, string>>({});

  // Outputs
  typeChange = output<UnitType | null>();
  isBaseUnitChange = output<boolean>();

  // Protected for template
  unitTypeOptions = UNIT_TYPE_OPTIONS;

  // Local writable signals (for ngModel)
  protected formNameLocal = signal('');
  protected formAbbreviationLocal = signal('');
  protected formTypeLocal = signal<UnitType | null>(null);
  protected formIsBaseUnitLocal = signal(true);
  protected formBaseUnitIdLocal = signal<string | null>(null);
  protected formConversionFactorLocal = signal('');

  // Touch signals
  protected nameTouched = signal(false);
  protected abbreviationTouched = signal(false);
  protected typeTouched = signal(false);
  protected baseUnitIdTouched = signal(false);
  protected conversionFactorTouched = signal(false);

  // Computed errors
  protected nameError = computed(() => {
    const fieldError = this.fieldErrors()['name'];
    if (fieldError) return fieldError;
    if (!this.nameTouched()) return null;
    const name = this.formNameLocal().trim();
    if (!name) return 'El nombre es requerido';
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (name.length > 100) return 'El nombre no puede exceder 100 caracteres';
    return null;
  });

  protected abbreviationError = computed(() => {
    const fieldError = this.fieldErrors()['abbreviation'];
    if (fieldError) return fieldError;
    if (!this.abbreviationTouched()) return null;
    const abbr = this.formAbbreviationLocal().trim();
    if (!abbr) return 'La abreviación es requerida';
    if (abbr.length < 1) return 'La abreviación debe tener al menos 1 carácter';
    if (abbr.length > 20) return 'La abreviación no puede exceder 20 caracteres';
    return null;
  });

  protected typeError = computed(() => {
    const fieldError = this.fieldErrors()['type'];
    if (fieldError) return fieldError;
    if (!this.typeTouched()) return null;
    if (!this.formTypeLocal()) return 'El tipo es requerido';
    return null;
  });

  protected baseUnitIdError = computed(() => {
    const fieldError = this.fieldErrors()['baseUnitId'];
    if (fieldError) return fieldError;
    if (!this.baseUnitIdTouched()) return null;
    if (!this.formIsBaseUnitLocal() && !this.formBaseUnitIdLocal()) return 'La unidad base es requerida';
    return null;
  });

  protected conversionFactorError = computed(() => {
    const fieldError = this.fieldErrors()['conversionFactor'];
    if (fieldError) return fieldError;
    if (!this.conversionFactorTouched()) return null;
    if (!this.formIsBaseUnitLocal() && !this.formConversionFactorLocal()) return 'El factor de conversión es requerido';
    const factor = parseFloat(this.formConversionFactorLocal());
    if (!this.formIsBaseUnitLocal() && isNaN(factor)) return 'El factor debe ser un número válido';
    if (!this.formIsBaseUnitLocal() && factor <= 0) return 'El factor debe ser mayor a 0';
    return null;
  });

  // Public gate
  hasErrors = computed(() => {
    return !!(
      this.nameError() ||
      this.abbreviationError() ||
      this.typeError() ||
      this.baseUnitIdError() ||
      this.conversionFactorError()
    );
  });

  constructor() {
    // Sync inputs to local signals for editing
    effect(() => {
      this.formNameLocal.set(this.formName());
      this.formAbbreviationLocal.set(this.formAbbreviation());
      this.formTypeLocal.set(this.formType());
      this.formIsBaseUnitLocal.set(this.formIsBaseUnit());
      this.formBaseUnitIdLocal.set(this.formBaseUnitId());
      this.formConversionFactorLocal.set(this.formConversionFactor());
    });
  }

  handleTypeChange(): void {
    this.typeTouched.set(true);
    this.typeChange.emit(this.formTypeLocal());
  }

  handleIsBaseUnitChange(): void {
    this.isBaseUnitChange.emit(this.formIsBaseUnitLocal());
  }

  // Called by parent to get form values
  getFormValues() {
    return {
      name: this.formNameLocal(),
      abbreviation: this.formAbbreviationLocal(),
      type: this.formTypeLocal(),
      isBaseUnit: this.formIsBaseUnitLocal(),
      baseUnitId: this.formBaseUnitIdLocal(),
      conversionFactor: this.formConversionFactorLocal(),
    };
  }

  markAllTouched(): void {
    this.nameTouched.set(true);
    this.abbreviationTouched.set(true);
    this.typeTouched.set(true);
    this.baseUnitIdTouched.set(true);
    this.conversionFactorTouched.set(true);
  }
}
