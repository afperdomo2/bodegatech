import {
  ChangeDetectionStrategy,
  Component,
  input,
  type TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { InventoryMovementDto } from '../../../../core/models/responses/movement.responses';
import { MovementTypeBadge } from '../../../../shared/components/movement-type-badge/movement-type-badge';

@Component({
  selector: 'bt-movement-detail-modal',
  standalone: true,
  imports: [CommonModule, MovementTypeBadge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #detailTemplate>
      @if (isLoading()) {
        <div class="space-y-6 animate-pulse">
          <div class="flex items-center justify-between p-4 bg-[#f0f2f8] rounded-lg h-20"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-28 bg-[#f0f2f8] rounded-lg"></div>
            <div class="h-28 bg-[#f0f2f8] rounded-lg"></div>
            <div class="h-28 bg-[#f0f2f8] rounded-lg col-span-2"></div>
          </div>
        </div>
      } @else if (detail()) {
        <div class="space-y-6">

          <!-- Header: Tipo + Fecha -->
          <div class="flex items-center justify-between p-4 bg-[#e5eeff] rounded-lg">
            <div class="flex items-center gap-3">
              <bt-movement-type-badge [type]="detail()!.type" size="md" />
              <div>
                <p class="text-sm text-[#404944]">Referencia</p>
                <p class="text-sm font-medium text-[#0b1c30]">{{ detail()!.referenceDocument || '—' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-[#404944]">Fecha</p>
              <p class="text-sm font-medium text-[#0b1c30]">{{ formatDate(detail()!.createdAt) }}</p>
            </div>
          </div>

          <!-- Grid: Bodega + Proveedor + Info adicional -->
          <div class="grid grid-cols-2 gap-4">

            <!-- Bodega -->
            <div class="p-4 bg-[#e5eeff] rounded-lg space-y-3">
              <div class="flex items-center gap-2 text-[#0b1c30] font-medium">
                <span class="material-symbols-outlined text-lg text-[#003527]">warehouse</span>
                Bodega
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-[#404944]">Nombre</span>
                  <span class="text-[#0b1c30] font-medium">{{ detail()!.warehouse.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#404944]">Código</span>
                  <span class="text-[#0b1c30]">{{ detail()!.warehouse.code }}</span>
                </div>
              </div>
            </div>

            <!-- Proveedor -->
            <div class="p-4 bg-[#e5eeff] rounded-lg space-y-3">
              <div class="flex items-center gap-2 text-[#0b1c30] font-medium">
                <span class="material-symbols-outlined text-lg text-[#003527]">local_shipping</span>
                Proveedor
              </div>
              <div class="space-y-2 text-sm">
                @if (detail()!.supplier) {
                  <div class="flex justify-between">
                    <span class="text-[#404944]">Nombre</span>
                    <span class="text-[#0b1c30] font-medium">{{ detail()!.supplier!.name }}</span>
                  </div>
                } @else {
                  <p class="text-[#404944] text-sm">Sin proveedor asociado</p>
                }
              </div>
            </div>

            <!-- Observaciones (ocupa las 2 columnas) -->
            @if (detail()!.observations) {
              <div class="col-span-2 p-4 bg-[#e5eeff] rounded-lg">
                <div class="flex items-center gap-2 text-[#0b1c30] font-medium mb-2">
                  <span class="material-symbols-outlined text-lg text-[#003527]">notes</span>
                  Observaciones
                </div>
                <p class="text-sm text-[#0b1c30]">{{ detail()!.observations }}</p>
              </div>
            }

          </div>

          <!-- Detalle de productos -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-[#0b1c30] font-medium">
              <span class="material-symbols-outlined text-lg text-[#003527]">list</span>
              Productos ({{ detail()!.detailCount }})
            </div>

            <div class="overflow-hidden rounded-lg border border-[#bfc9c3]">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-[#e5eeff]">
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-[#404944]">Producto</th>
                    <th class="px-4 py-2.5 text-left text-xs font-medium text-[#404944]">SKU</th>
                    <th class="px-4 py-2.5 text-right text-xs font-medium text-[#404944]">Cantidad</th>
                    <th class="px-4 py-2.5 text-right text-xs font-medium text-[#404944]">Stock Anterior</th>
                    <th class="px-4 py-2.5 text-right text-xs font-medium text-[#404944]">Stock Actual</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#bfc9c3]">
                  @for (item of detail()!.details; track item.id) {
                    <tr class="bg-[#f8f9ff] hover:bg-[#e5eeff] transition-colors">
                      <td class="px-4 py-2.5 font-medium text-[#0b1c30]">{{ item.productName }}</td>
                      <td class="px-4 py-2.5 text-[#404944]">{{ item.productSku }}</td>
                      <td class="px-4 py-2.5 text-right font-semibold text-[#003527]">{{ item.quantity }}</td>
                      <td class="px-4 py-2.5 text-right text-[#0b1c30]">{{ item.previousStock }}</td>
                      <td class="px-4 py-2.5 text-right font-semibold text-[#0b1c30]">{{ item.currentStock }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }
    </ng-template>
  `,
})
export class MovementDetailModalComponent {
  @ViewChild('detailTemplate') templateRef!: TemplateRef<unknown>;

  detail = input<InventoryMovementDto | null>(null);
  isLoading = input(false);

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  }
}