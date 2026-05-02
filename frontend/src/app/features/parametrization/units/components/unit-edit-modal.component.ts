import { Component, input, output, ViewChild, type TemplateRef, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitFormComponent } from './unit-form.component';
import { UnitRelatedTableComponent } from './unit-related-table.component';
import { type UnitType } from '../../../../core/constants/unit-type.constants';
import type { MeasurementUnitSummaryDto, MeasurementUnitDetail, MeasurementUnitRelatedDto } from '../../../../core/models/responses/unit.responses';

@Component({
  selector: 'bt-unit-edit-modal',
  standalone: true,
  imports: [CommonModule, UnitFormComponent, UnitRelatedTableComponent],
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
            (typeChange)="typeChange.emit($event)"
            (isBaseUnitChange)="isBaseUnitChange.emit($event)" />

          <!-- Read-only fields: Tipo and Es unidad base -->
          <div class="p-4 rounded-lg bg-surface-container border border-outline-variant space-y-3">
            <div>
              <p class="text-xs text-on-surface-variant mb-1">Tipo</p>
              <p class="text-sm font-medium text-on-surface">{{ getTypeLabel() }}</p>
              <p class="text-xs text-on-surface-variant italic mt-1">Este campo no se puede modificar</p>
            </div>
            <div class="border-t border-outline-variant pt-3">
              <p class="text-xs text-on-surface-variant mb-1">Es unidad base</p>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [checked]="formIsBaseUnit()"
                  disabled
                  class="w-4 h-4 rounded border border-outline-variant bg-surface-container" />
                <span class="text-sm text-on-surface">{{ formIsBaseUnit() ? 'Sí' : 'No' }}</span>
              </div>
              <p class="text-xs text-on-surface-variant italic mt-1">Este campo no se puede modificar</p>
            </div>
          </div>

          <!-- Conditional: Unidad derivadas table (when IS base unit) -->
          @if (formIsBaseUnit()) {
            <div class="max-h-[30rem] overflow-y-auto">
              <bt-unit-related-table
                [relatedUnits]="relatedUnits()"
                [isLoading]="isLoadingRelated()"
                [baseName]="selectedDetail()?.name || ''" />
            </div>
          }

          <!-- Conditional: Read-only Unidad base + editable Factor (when NOT base unit) -->
          @if (!formIsBaseUnit() && selectedDetail()) {
            <div class="p-4 rounded-lg bg-surface-container border border-outline-variant space-y-3">
              <div>
                <p class="text-xs text-on-surface-variant mb-1">Unidad Base</p>
                <p class="text-sm font-medium text-on-surface">
                  {{ selectedDetail()?.baseUnit?.name }}
                </p>
              </div>
            </div>
          }
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
  @ViewChild('formComponent') form!: UnitFormComponent;

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

  getTypeLabel(): string {
    return this.unitTypeMap();
  }
}
