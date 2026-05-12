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
import { ImageThumbnail } from '../../../../shared/components/image-thumbnail/image-thumbnail';

@Component({
  selector: 'bt-movement-detail-modal',
  standalone: true,
  imports: [CommonModule, MovementTypeBadge, ImageThumbnail],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #detailTemplate>
      @if (isLoading()) {
        <div class="space-y-5 animate-pulse">
          <div class="h-20 bg-gray-50 rounded-lg"></div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-32 bg-gray-50 rounded-lg"></div>
            <div class="h-32 bg-gray-50 rounded-lg"></div>
          </div>
          <div class="h-40 bg-gray-50 rounded-lg"></div>
        </div>
      } @else if (detail()) {
        <div class="space-y-5">

          <!-- Header: Tipo + Referencia + Fecha -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200  bg-gray-50 rounded-lg">
            <div class="flex items-center gap-4">
              <bt-movement-type-badge [type]="detail()!.type" size="md" />
              <div>
                <p class="text-xs text-on-surface-variant uppercase tracking-wider">Referencia</p>
                <p class="text-base font-semibold text-on-surface">{{ detail()!.referenceDocument || '—' }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-on-surface-variant uppercase tracking-wider">Fecha</p>
              <p class="text-base font-medium text-on-surface">{{ formatDate(detail()!.createdAt) }}</p>
            </div>
          </div>

          <!-- Grid: Bodega + Proveedor -->
          <div class="grid grid-cols-2 gap-4">

            <!-- Bodega -->
            <div class="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="p-1.5 bg-secondary/10 rounded-lg">
                  <span class="material-symbols-outlined text-base text-secondary">warehouse</span>
                </div>
                <span class="text-sm font-semibold text-on-surface">Bodega 333</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-on-surface-variant">Nombre</span>
                <span class="text-sm font-medium text-on-surface">{{ detail()!.warehouse.name }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-on-surface-variant">Código</span>
                <span class="text-sm text-on-surface font-mono">{{ detail()!.warehouse.code }}</span>
              </div>
            </div>

            <!-- Proveedor -->
            <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
              <div class="flex items-center gap-2 mb-3">
                <div class="p-1.5 bg-tertiary/10 rounded-lg">
                  <span class="material-symbols-outlined text-base text-tertiary">local_shipping</span>
                </div>
                <span class="text-sm font-semibold text-on-surface">Proveedor</span>
              </div>
              @if (detail()!.supplier) {
                <div class="flex justify-between items-center">
                  <span class="text-sm text-on-surface-variant">Nombre</span>
                  <span class="text-sm font-medium text-on-surface">{{ detail()!.supplier!.name }}</span>
                </div>
              } @else {
                <p class="text-sm text-on-surface-variant italic py-2">Sin proveedor asociado</p>
              }
            </div>

          </div>

          <!-- Observaciones -->
          @if (detail()!.observations) {
            <div class="flex gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <div class="flex-shrink-0">
                <span class="material-symbols-outlined text-lg text-secondary">notes</span>
              </div>
              <div>
                <p class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Observaciones</p>
                <p class="text-sm text-on-surface leading-relaxed">{{ detail()!.observations }}</p>
              </div>
            </div>
          }

          <!-- Detalle de productos -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-1.5 bg-gray-100 border border-gray-200 rounded-lg">
                  <span class="material-symbols-outlined text-base text-on-surface-variant">list</span>
                </div>
                <span class="text-sm font-semibold text-on-surface">Productos</span>
                <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-on-surface-variant rounded-full">
                  {{ detail()!.detailCount }}
                </span>
              </div>
            </div>

            <div class="overflow-hidden rounded-xl border border-gray-200">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50">
                    <th class="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Producto</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Cantidad</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Stock Anterior</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Stock Actual</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-outline-variant">
                  @for (item of detail()!.details; track item.id) {
                    <tr class="hover:bg-gray-100 transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <bt-image-thumbnail [src]="item.mainImageUrl" alt="producto" [size]="32" />
                          <div>
                            <p class="text-sm font-medium text-on-surface leading-tight">{{ item.productName }}</p>
                            <p class="text-xs text-on-surface-variant mt-0.5 font-mono">{{ item.productSku }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-right font-semibold text-on-surface">{{ formatQuantity(item.quantity) }}</td>
                      <td class="px-4 py-3 text-right text-on-surface">{{ formatQuantity(item.previousStock) }}</td>
                      <td class="px-4 py-3 text-right font-semibold text-on-surface">{{ formatQuantity(item.currentStock) }}</td>
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

  formatQuantity(value: number | null): string {
    if (value == null) return '—';
    return value.toLocaleString('es-CO');
  }
}
