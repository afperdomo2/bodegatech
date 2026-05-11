import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RichSelectComponent, type RichSelectOption } from '../../../../shared/components/rich-select/rich-select.component';
import type { MovementDetailRequest } from '../../../../core/models/requests/movement.requests';

interface MovementItem {
  id: string;
  productId: string | null;
  quantity: string;
  touched: boolean;
  errors: {
    productId?: string;
    quantity?: string;
  };
}

@Component({
  selector: 'bt-movement-items-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RichSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <!-- Section header -->
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-on-surface flex items-center gap-2">
          <span class="material-symbols-outlined text-lg">inventory_2</span>
          Productos del Movimiento
        </h3>
        <span class="text-xs text-on-surface-variant">
          {{ items().length }} item(s)
        </span>
      </div>

      <!-- Items list -->
      <div class="space-y-2">
        @for (item of items(); track item.id; let i = $index) {
          <div
            class="flex flex-col sm:flex-row sm:items-start gap-3 p-3 bg-surface-container rounded-lg border border-outline-variant
                   transition-all duration-200 hover:border-outline-focus"
            [class.border-error]="item.touched && hasItemErrors(item)">
            <!-- Product select -->
            <div class="flex-1 min-w-0 order-1 sm:order-none">
              <bt-rich-select
                [options]="products()"
                [label]="i === 0 ? 'Producto' : ''"
                [placeholder]="'Seleccionar producto'"
                [required]="true"
                [fieldError]="getItemError(item, 'productId')"
                [selectedValue]="item.productId"
                (selectedValueChange)="updateItemProduct(item.id, $event)" />
            </div>

            <!-- Quantity input -->
            <div class="sm:w-28 order-2 sm:order-none">
              @if (i === 0) {
                <label class="block text-sm font-medium text-on-surface mb-1.5">
                  Cantidad <span class="text-error">*</span>
                </label>
              }
              <input
                type="number"
                step="0.01"
                min="0.01"
                [(ngModel)]="item.quantity"
                (blur)="touchItem(item.id)"
                [class.border-error]="item.touched && getItemError(item, 'quantity')"
                class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                       placeholder:text-on-surface-variant
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                       transition-colors"
                placeholder="0" />
              @if (item.touched && getItemError(item, 'quantity')) {
                <p class="flex items-center gap-1 text-xs text-error mt-1">
                  <span class="material-symbols-outlined text-sm">error</span>
                  {{ getItemError(item, 'quantity') }}
                </p>
              }
            </div>

            <!-- Delete button -->
            <div class="sm:pt-5 flex sm:justify-end order-3 sm:order-none">
              <button
                type="button"
                (click)="removeItem(item.id)"
                [disabled]="items().length === 1"
                [class.opacity-50]="items().length === 1"
                [class.cursor-not-allowed]="items().length === 1"
                class="p-2 rounded-lg text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                title="Eliminar">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        }

        <!-- Duplicate product warning -->
        @if (duplicateProducts().length > 0) {
          <div class="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <span class="material-symbols-outlined text-warning">warning</span>
            <p class="text-sm text-warning">
              Los siguientes productos están repetidos:
              <span class="font-medium">{{ duplicateProducts().join(', ') }}</span>
            </p>
          </div>
        }
      </div>

      <!-- Add button -->
      <button
        type="button"
        (click)="addItem()"
        class="flex items-center gap-2 px-4 py-2.5 border border-dashed border-outline-variant rounded-lg
               text-on-surface-variant hover:border-primary hover:text-primary
               transition-colors duration-200 w-full justify-center">
        <span class="material-symbols-outlined">add</span>
        Agregar Producto
      </button>

      <!-- Summary -->
      <div class="flex items-center justify-between py-2 px-3 bg-surface-container rounded-lg">
        <span class="text-sm text-on-surface-variant">Total de ítems:</span>
        <span class="text-sm font-semibold text-on-surface">{{ items().length }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class MovementItemsFormComponent {
  products = input.required<RichSelectOption[]>();
  fieldErrors = input<Record<string, string>>({});
  submitTrigger = input(0);
  resetTrigger = input(0);

  itemsChange = output<MovementDetailRequest[]>();
  hasErrors = output<boolean>();

  protected items = signal<MovementItem[]>([
    this.createEmptyItem(),
  ]);

  private usedProductLabels = computed(() => {
    const items = this.items();
    return items
      .filter((item) => item.productId)
      .map((item) => {
        const product = this.products().find((p) => p.value === item.productId);
        return product?.label || '';
      })
      .filter(Boolean);
  });

  duplicateProducts = computed(() => {
    const labels = this.usedProductLabels();
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const label of labels) {
      if (seen.has(label)) {
        duplicates.push(label);
      }
      seen.add(label);
    }
    return duplicates;
  });

  constructor() {
    effect(() => {
      this.items();
      this.emitItems();
    });

    effect(() => {
      const trigger = this.submitTrigger();
      if (trigger > 0) {
        this.markAllTouched();
      }
    });

    effect(() => {
      const trigger = this.resetTrigger();
      if (trigger > 0) {
        this.items.set([this.createEmptyItem()]);
      }
    });
  }

  private createEmptyItem(): MovementItem {
    return {
      id: crypto.randomUUID(),
      productId: null,
      quantity: '',
      touched: false,
      errors: {},
    };
  }

  addItem(): void {
    this.items.update((items) => [...items, this.createEmptyItem()]);
  }

  removeItem(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  updateItemProduct(id: string, productId: string | null): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, productId } : item))
    );
  }

  touchItem(id: string): void {
    this.items.update((items) =>
      items.map((item) => (item.id === id ? { ...item, touched: true } : item))
    );
  }

  markAllTouched(): void {
    this.items.update((items) =>
      items.map((item) => ({ ...item, touched: true }))
    );
  }

  private validateItems(): MovementItem[] {
    return this.items().map((item) => {
      const errors: MovementItem['errors'] = {};

      if (!item.productId) {
        errors.productId = 'El producto es requerido';
      }

      const qty = parseFloat(item.quantity);
      if (!item.quantity || isNaN(qty) || qty <= 0) {
        errors.quantity = 'La cantidad debe ser mayor a 0';
      }

      return { ...item, errors };
    });
  }

  protected hasItemErrors(item: MovementItem): boolean {
    return !!(item.errors.productId || item.errors.quantity);
  }

  getItemError(item: MovementItem, field: 'productId' | 'quantity'): string | null {
    const fieldError = this.fieldErrors()[field];
    if (fieldError) return fieldError;
    return item.errors[field] || null;
  }

  private emitItems(): void {
    const validatedItems = this.validateItems();
    const hasErrors = validatedItems.some((item) => this.hasItemErrors(item));
    this.hasErrors.emit(hasErrors);

    const validItems: MovementDetailRequest[] = validatedItems
      .filter((item) => item.productId && item.quantity)
      .map((item) => ({
        productId: item.productId!,
        quantity: parseFloat(item.quantity),
      }));

    this.itemsChange.emit(validItems);
  }

  getItems(): MovementDetailRequest[] {
    const validatedItems = this.validateItems();
    return validatedItems
      .filter((item) => item.productId && item.quantity)
      .map((item) => ({
        productId: item.productId!,
        quantity: parseFloat(item.quantity),
      }));
  }

  hasAnyErrors(): boolean {
    const validatedItems = this.validateItems();
    return validatedItems.some((item) => this.hasItemErrors(item));
  }
}