import { Component, input, output, ViewChild, type TemplateRef, ChangeDetectionStrategy, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitFormComponent } from './unit-form.component';
import { UnitRelatedTableComponent } from './unit-related-table.component';
import { ToggleSwitchComponent } from '../../../../core/components/toggle-switch.component';
import { type UnitType } from '../../../../core/constants/unit-type.constants';
import type { MeasurementUnitSummaryDto, MeasurementUnitDetail, MeasurementUnitRelatedDto } from '../../../../core/models/responses/unit.responses';
import type { UpdateMeasurementUnitRequest } from '../../../../core/models/requests/unit.requests';

@Component({
  selector: 'bt-unit-edit-modal',
  standalone: true,
  imports: [CommonModule, UnitFormComponent, UnitRelatedTableComponent, ToggleSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #editModalTemplate>
      <div class="space-y-4">
        @if (isLoadingDetail()) {
          <!-- Loading Detail Spinner -->
          <div class="flex items-center justify-center py-12">
            <div class="flex flex-col items-center gap-4">
              <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm text-on-surface-variant">Cargando datos...</p>
            </div>
          </div>
        } @else {
          <!-- General Error -->
          @if (generalError()) {
            <div class="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
              {{ generalError() }}
            </div>
          }

           <!-- Form (editable fields only) -->
           <bt-unit-form
             #formComponent
             [formName]="formName()"
             [formAbbreviation]="formAbbreviation()"
             [formType]="formType()"
             [formIsBaseUnit]="formIsBaseUnit()"
             [formBaseUnitId]="formBaseUnitId()"
             [formConversionFactor]="formConversionFactor()"
             [isEditMode]="true"
             [baseUnitsForType]="baseUnitsForType()"
             [isLoadingBaseUnits]="isLoadingBaseUnits()"
             [fieldErrors]="fieldErrors()"
             [submitTrigger]="submitCount()"
             (typeChange)="typeChange.emit($event)"
             (isBaseUnitChange)="isBaseUnitChange.emit($event)"
             (formChange)="currentValues.set($event)" />

           <!-- Read-only: Tipo (not editable) -->
           <div>
             <label class="block text-xs text-on-surface-variant mb-1">Tipo</label>
             <input
               type="text"
               [value]="getTypeLabel()"
               readonly
               class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface text-sm cursor-not-allowed opacity-75" />
           </div>

           <!-- Read-only: Es unidad base (not editable) -->
           <div>
             <label class="block text-xs text-on-surface-variant mb-1">Es unidad base</label>
             <div class="flex items-center gap-2">
               <input
                 type="checkbox"
                 [checked]="formIsBaseUnit()"
                 disabled
                 class="w-4 h-4 rounded border border-outline-variant bg-surface-container cursor-not-allowed" />
               <span class="text-sm text-on-surface">{{ formIsBaseUnit() ? 'Sí' : 'No' }}</span>
             </div>
           </div>

           <!-- Conditional: Unidad Base read-only (when NOT base unit) -->
           @if (!formIsBaseUnit() && selectedDetail()?.baseUnit) {
             <div>
               <label class="block text-xs text-on-surface-variant mb-1">Unidad Base</label>
               <input
                 type="text"
                 [value]="selectedDetail()?.baseUnit?.name"
                 readonly
                 class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface text-sm cursor-not-allowed opacity-75" />
             </div>
           }

            <!-- Conditional: Unidad derivadas table (when IS base unit) -->
            @if (formIsBaseUnit()) {
              <div class="max-h-[30rem] overflow-y-auto">
                <bt-unit-related-table
                  [relatedUnits]="relatedUnits()"
                  [isLoading]="isLoadingRelated()"
                  [baseName]="selectedDetail()?.name || ''" />
              </div>
            }

            <!-- Toggle isActive -->
            <div class="pt-2">
              <bt-toggle-switch
                [checked]="isActive()"
                (checkedChange)="isActive.set($event)"
                label="Unidad activa"
              />
            </div>
         }
       </div>
     </ng-template>
   `,
  styles: [`
    :host {
      display: none;
    }
  `]
})
export class UnitEditModalComponent {
  @ViewChild('editModalTemplate') templateRef!: TemplateRef<unknown>;

  // Inputs
  formName = input<string>('');
  formAbbreviation = input<string>('');
  formType = input<UnitType | null>(null);
  formIsBaseUnit = input<boolean>(true);
  formBaseUnitId = input<string | null>(null);
  formConversionFactor = input<string>('');
  isEditMode = input<boolean>(true);
  baseUnitsForType = input<MeasurementUnitSummaryDto[]>([]);
  isLoadingBaseUnits = input<boolean>(false);
  fieldErrors = input<Record<string, string>>({});
  generalError = input<string | null>(null);
  isLoadingDetail = input<boolean>(false);
  selectedDetail = input<MeasurementUnitDetail | null>(null);
  relatedUnits = input<MeasurementUnitRelatedDto[]>([]);
  isLoadingRelated = input<boolean>(false);

  // Outputs
  typeChange = output<UnitType | null>();
  isBaseUnitChange = output<boolean>();

  // Local signals
  isActive = signal(true);
  submitCount = signal(0);
  currentValues = signal({
    name: '',
    abbreviation: '',
    type: null as UnitType | null,
    isBaseUnit: true,
    baseUnitId: null as string | null,
    conversionFactor: '',
  });

  // Computed
  private unitTypeMap = computed(() => {
    const detail = this.selectedDetail();
    if (!detail) return '';
    const typeLabels: Record<string, string> = {
      'MASS': 'Masa',
      'VOLUME': 'Volumen',
      'LENGTH': 'Longitud',
      'AREA': 'Área',
      'QUANTITY': 'Cantidad',
      'TIME': 'Tiempo',
      'TEMPERATURE': 'Temperatura',
    };
    return typeLabels[detail.type] || detail.type;
  });

  hasErrors = computed(() => {
    const vals = this.currentValues();
    const fieldErrors = this.fieldErrors();

    // Check name
    if (fieldErrors['name']) return true;
    const name = vals.name.trim();
    if (!name || name.length < 2 || name.length > 100) return true;

    // Check abbreviation
    if (fieldErrors['abbreviation']) return true;
    const abbr = vals.abbreviation.trim();
    if (!abbr || abbr.length < 1 || abbr.length > 20) return true;

    // Check conversionFactor (only if not base unit)
    if (fieldErrors['conversionFactor']) return true;
    if (!vals.isBaseUnit) {
      if (!vals.conversionFactor) return true;
      const factor = parseFloat(vals.conversionFactor);
      if (isNaN(factor) || factor <= 0) return true;
    }

    return false;
  });

  getTypeLabel(): string {
    return this.unitTypeMap();
  }

  triggerSubmit(): false | UpdateMeasurementUnitRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    return {
      name: this.currentValues().name,
      abbreviation: this.currentValues().abbreviation,
      conversionFactor: this.currentValues().isBaseUnit
        ? undefined
        : parseFloat(this.currentValues().conversionFactor),
      isActive: this.isActive(),
    };
  }

  reset(): void {
    this.submitCount.set(0);
    this.currentValues.set({
      name: '',
      abbreviation: '',
      type: null,
      isBaseUnit: true,
      baseUnitId: null,
      conversionFactor: '',
    });
  }

  constructor() {
    // Sincronizar isActive desde selectedDetail
    effect(() => {
      const detail = this.selectedDetail();
      if (detail) {
        this.isActive.set(detail.isActive);
      }
    });
  }
}
