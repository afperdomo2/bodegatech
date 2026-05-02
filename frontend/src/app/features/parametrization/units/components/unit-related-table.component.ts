import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { MeasurementUnitRelatedDto } from '../../../../core/models/responses/unit.responses';

@Component({
  selector: 'bt-unit-related-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-outline-variant overflow-hidden">
      <!-- Header -->
      <div class="px-4 py-3 flex items-center gap-2 border-b border-outline-variant bg-surface">
        <span class="material-symbols-outlined text-on-surface-variant text-sm">conversion_path</span>
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
          <!-- Datagrid with fixed columns and borders -->
          <div class="grid gap-0" style="grid-template-columns: 1fr auto 1fr auto;">
            <!-- Header Row -->
            <div class="text-xs font-semibold text-on-surface-variant py-2 px-2 border-b border-outline-variant/50">Unidad Base</div>
            <div class="border-b border-outline-variant/50"></div>
            <div class="text-xs font-semibold text-on-surface-variant py-2 px-2 border-b border-outline-variant/50">Unidad Derivada</div>
            <div class="text-xs font-semibold text-on-surface-variant py-2 px-2 text-right border-b border-outline-variant/50">Factor</div>

            <!-- Data Rows -->
            @for (unit of relatedUnits(); track unit.id; let isLast = $last) {
              <!-- Base Unit Name -->
              <div [class]="'text-xs text-on-surface-variant py-2 px-2 truncate' + (!isLast ? ' border-b border-outline-variant/50' : '')">
                {{ baseName() }}
              </div>

              <!-- Arrow -->
              <div [class]="'flex items-center justify-center py-2 px-1' + (!isLast ? ' border-b border-outline-variant/50' : '')">
                <span class="material-symbols-outlined text-on-surface-variant text-sm">
                  trending_flat
                </span>
              </div>

              <!-- Derived Unit (Name + Abbreviation) -->
              <div [class]="'py-2 px-2 min-w-0' + (!isLast ? ' border-b border-outline-variant/50' : '')">
                <p class="text-sm font-medium text-on-surface truncate">{{ unit.name }}</p>
                <p class="text-xs text-on-surface-variant truncate">{{ unit.abbreviation }}</p>
              </div>

              <!-- Conversion Factor -->
              <div [class]="'text-right py-2 px-2' + (!isLast ? ' border-b border-outline-variant/50' : '')">
                <p class="font-mono text-sm text-primary font-semibold whitespace-nowrap">
                  {{ formatFactor(unit.conversionFactor) }}
                </p>
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
