import { Component, input, output, ViewChild, type TemplateRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitFormComponent } from './unit-form.component';
import { type UnitType } from '../../../../core/constants/unit-type.constants';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type { CreateMeasurementUnitRequest } from '../../../../core/models/requests/unit.requests';

@Component({
  selector: 'bt-unit-create-modal',
  standalone: true,
  imports: [CommonModule, UnitFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #createModalTemplate>
      <div class="space-y-4">
        <!-- General Error -->
        @if (generalError()) {
          <div class="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
            {{ generalError() }}
          </div>
        }

        <!-- Form -->
        <bt-unit-form
          #formComponent
          [formName]="formName()"
          [formAbbreviation]="formAbbreviation()"
          [formType]="formType()"
          [formIsBaseUnit]="formIsBaseUnit()"
          [formBaseUnitId]="formBaseUnitId()"
          [formConversionFactor]="formConversionFactor()"
          [isEditMode]="false"
          [baseUnitsForType]="baseUnitsForType()"
          [isLoadingBaseUnits]="isLoadingBaseUnits()"
          [fieldErrors]="fieldErrors()"
          [submitTrigger]="submitCount()"
          (typeChange)="typeChange.emit($event)"
          (isBaseUnitChange)="isBaseUnitChange.emit($event)"
          (formChange)="currentValues.set($event)" />
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: none;
    }
  `]
})
export class UnitCreateModalComponent {
  @ViewChild('createModalTemplate') templateRef!: TemplateRef<unknown>;

  // Inputs
  formName = input<string>('');
  formAbbreviation = input<string>('');
  formType = input<UnitType | null>(null);
  formIsBaseUnit = input<boolean>(true);
  formBaseUnitId = input<string | null>(null);
  formConversionFactor = input<string>('');
  baseUnitsForType = input<MeasurementUnitSummaryDto[]>([]);
  isLoadingBaseUnits = input<boolean>(false);
  fieldErrors = input<Record<string, string>>({});
  generalError = input<string | null>(null);

  // Outputs
  typeChange = output<UnitType | null>();
  isBaseUnitChange = output<boolean>();

  // Reactive state
  submitCount = signal(0);
  currentValues = signal({
    name: '',
    abbreviation: '',
    type: null as UnitType | null,
    isBaseUnit: true,
    baseUnitId: null as string | null,
    conversionFactor: '',
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

    // Check type (only in create mode)
    if (fieldErrors['type']) return true;
    if (!vals.type) return true;

    // Check baseUnitId (only if not base unit)
    if (fieldErrors['baseUnitId']) return true;
    if (!vals.isBaseUnit && !vals.baseUnitId) return true;

    // Check conversionFactor (only if not base unit)
    if (fieldErrors['conversionFactor']) return true;
    if (!vals.isBaseUnit) {
      if (!vals.conversionFactor) return true;
      const factor = parseFloat(vals.conversionFactor);
      if (isNaN(factor) || factor <= 0) return true;
    }

    return false;
  });

  triggerSubmit(): false | CreateMeasurementUnitRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    return {
      name: this.currentValues().name,
      abbreviation: this.currentValues().abbreviation,
      type: this.currentValues().type!,
      isBaseUnit: this.currentValues().isBaseUnit,
      baseUnitId: this.currentValues().baseUnitId || undefined,
      conversionFactor: this.currentValues().isBaseUnit
        ? undefined
        : parseFloat(this.currentValues().conversionFactor),
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
}
