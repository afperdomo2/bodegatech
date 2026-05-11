import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  type TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { InventoryDto } from '../../../../core/models/responses/inventory.responses';

@Component({
  selector: 'bt-inventory-detail-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #detailTemplate>
      @if (isLoading()) {
        <div class="space-y-6 animate-pulse">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 bg-surface-200 rounded-lg"></div>
            <div class="flex-1 space-y-2">
              <div class="h-5 bg-surface-200 rounded w-3/4"></div>
              <div class="h-4 bg-surface-200 rounded w-1/4"></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="h-20 bg-surface-200 rounded-lg"></div>
            <div class="h-20 bg-surface-200 rounded-lg"></div>
            <div class="h-20 bg-surface-200 rounded-lg col-span-2"></div>
          </div>
        </div>
      } @else if (detail()) {
        <div class="space-y-6">

          <!-- Producto Header -->
          <div class="flex items-start gap-4 p-4 bg-surface-container rounded-lg">
            <div class="flex-shrink-0 w-16 h-16 bg-surface-100 rounded-lg flex items-center justify-center border border-dashed border-surface-200">
              <span class="material-symbols-outlined text-2xl text-surface-300">inventory_2</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-on-surface truncate">{{ detail()!.product.name }}</h3>
              <p class="text-sm text-on-surface-variant">SKU: {{ detail()!.product.sku }}</p>
              @if (detail()!.quantity <= detail()!.product.minStock) {
                <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-warning/10 text-warning text-xs font-medium rounded-full">
                  <span class="material-symbols-outlined text-xs">warning</span>
                  Stock bajo
                </span>
              }
            </div>
          </div>

          <!-- Grid: Producto + Bodega + Stock metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <!-- Sección: Producto -->
            <div class="p-4 bg-surface-container rounded-lg space-y-3">
              <div class="flex items-center gap-2 text-on-surface font-medium">
                <span class="material-symbols-outlined text-lg text-primary">category</span>
                Producto
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Precio venta</span>
                  <span class="text-on-surface font-medium">{{ formatCurrency(detail()!.product.salePrice) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Precio costo</span>
                  <span class="text-on-surface">{{ formatCurrency(detail()!.product.costPrice) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Stock mínimo</span>
                  <span class="text-on-surface">{{ detail()!.product.minStock }}</span>
                </div>
                @if (detail()!.product.maxStock !== null) {
                  <div class="flex justify-between">
                    <span class="text-on-surface-variant">Stock máximo</span>
                    <span class="text-on-surface">{{ detail()!.product.maxStock }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Sección: Bodega -->
            <div class="p-4 bg-surface-container rounded-lg space-y-3">
              <div class="flex items-center gap-2 text-on-surface font-medium">
                <span class="material-symbols-outlined text-lg text-primary">warehouse</span>
                Bodega
              </div>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Nombre</span>
                  <span class="text-on-surface font-medium">{{ detail()!.warehouse.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-on-surface-variant">Código</span>
                  <span class="text-on-surface">{{ detail()!.warehouse.code }}</span>
                </div>
                @if (detail()!.warehouse.location) {
                  <div class="flex justify-between">
                    <span class="text-on-surface-variant">Ubicación</span>
                    <span class="text-on-surface text-right max-w-[160px] truncate">{{ detail()!.warehouse.location }}</span>
                  </div>
                }
                @if (detail()!.warehouse.description) {
                  <div>
                    <span class="text-on-surface-variant text-sm">Descripción</span>
                    <p class="text-on-surface text-sm mt-0.5">{{ detail()!.warehouse.description }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Stock Metrics (ocupa las 2 columnas) -->
            <div class="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="p-3 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <p class="text-xs text-on-surface-variant mb-1">Total</p>
                <p class="text-xl font-bold text-primary">{{ detail()!.quantity }}</p>
              </div>
              <div class="p-3 bg-warning/5 border border-warning/20 rounded-lg text-center">
                <p class="text-xs text-on-surface-variant mb-1">Reservado</p>
                <p class="text-xl font-bold text-warning">{{ detail()!.reservedQuantity }}</p>
              </div>
              <div class="p-3 bg-success/5 border border-success/20 rounded-lg text-center">
                <p class="text-xs text-on-surface-variant mb-1">Disponible</p>
                <p class="text-xl font-bold text-success">{{ detail()!.availableQuantity }}</p>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="col-span-2 p-3 bg-surface-container rounded-lg">
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface-variant">
                <div>
                  <span class="font-medium text-on-surface">Último movimiento</span>
                  <p class="mt-0.5">{{ lastMovementAt() }}</p>
                </div>
                <div>
                  <span class="font-medium text-on-surface">Creado</span>
                  <p class="mt-0.5">{{ formatDate(detail()!.createdAt) }}</p>
                </div>
                <div>
                  <span class="font-medium text-on-surface">Actualizado</span>
                  <p class="mt-0.5">{{ formatDate(detail()!.updatedAt) }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      }
    </ng-template>
  `,
})
export class InventoryDetailModalComponent {
  @ViewChild('detailTemplate') templateRef!: TemplateRef<unknown>;

  detail = input<InventoryDto | null>(null);
  isLoading = input(false);

  lastMovementAt = computed(() => {
    const d = this.detail();
    if (!d) return '—';
    return d.lastMovementAt ? this.formatDate(d.lastMovementAt!) : 'Sin movimientos';
  });

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  }
}