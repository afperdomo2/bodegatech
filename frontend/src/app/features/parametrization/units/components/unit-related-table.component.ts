import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { MeasurementUnitRelatedDto } from '../../../../core/models/responses/unit.responses';

@Component({
  selector: 'bt-unit-related-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-outline-variant bg-surface-container overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 flex items-center gap-2 border-b border-outline-variant bg-surface">
        <span class="material-symbols-outlined text-on-surface-variant">conversion_path</span>
        <h3 class="text-sm font-semibold text-on-surface">Unidades derivadas</h3>
      </div>

      <!-- Content -->
      <div class="p-4">
        @if (isLoading()) {
          <!-- Loading Spinner -->
          <div class="flex items-center justify-center py-8">
            <div class="flex flex-col items-center gap-3">
              <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-on-surface-variant">Cargando unidades derivadas...</p>
            </div>
          </div>
        } @else if (relatedUnits().length > 0) {
          <!-- Table -->
          <div class="space-y-2">
            @for (unit of relatedUnits(); track unit.id; let isEven = $even) {
              <div
                [class]="'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ' +
                         (isEven ? 'bg-surface-container-high' : 'bg-surface-container')">
                <!-- Base Unit (readonly, grayed) -->
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-on-surface-variant truncate">{{ baseName() }}</p>
                </div>

                <!-- Arrow -->
                <span class="material-symbols-outlined text-on-surface-variant flex-shrink-0">
                  trending_flat
                </span>

                <!-- Derived Unit -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-on-surface truncate">{{ unit.name }}</p>
                  <p class="text-xs text-on-surface-variant">{{ unit.abbreviation }}</p>
                </div>

                <!-- Conversion Factor (monospace) -->
                <div class="flex-shrink-0 text-right">
                  <p class="font-mono text-sm text-primary font-semibold">
                    {{ formatFactor(unit.conversionFactor) }}
                  </p>
                </div>
              </div>
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center py-8 gap-2">
            <span class="material-symbols-outlined text-on-surface-variant text-2xl">device_hub</span>
            <p class="text-sm text-on-surface-variant">No hay unidades derivadas registradas</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class UnitRelatedTableComponent {
  relatedUnits = input<MeasurementUnitRelatedDto[]>([]);
  isLoading = input<boolean>(false);
  baseName = input<string>('');

  formatFactor(factor: number): string {
    // Remove trailing zeros and unnecessary decimal point
    return factor.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    }).replace(/,?0+$/, '');
  }
}
