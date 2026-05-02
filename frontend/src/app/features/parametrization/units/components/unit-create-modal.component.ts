import { Component, input, output, ViewChild, type TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UnitFormComponent } from './unit-form.component';
import { type UnitType } from '../../../../core/constants/unit-type.constants';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';

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
          (typeChange)="typeChange.emit($event)"
          (isBaseUnitChange)="isBaseUnitChange.emit($event)" />
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
  @ViewChild('formComponent') form!: UnitFormComponent;

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
}
