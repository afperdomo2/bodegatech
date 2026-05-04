import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import type { CategorySummaryDto } from '../../../../core/models/responses/category.responses';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type { ProductDetail } from '../../../../core/models/responses/product.responses';

/**
 * Componente dumb de formulario de producto (create + edit).
 *
 * Funcionalidades:
 * - Modo crear: todos los campos editables
 * - Modo editar: SKU y stock como read-only
 * - Signals locales sincronizadas desde inputs via effect()
 * - API pública: getFormValues(), markAllTouched(), hasErrors (computed), formatters
 * - No maneja la lógica de estado, solo expone validaciones y valores
 *
 * Inputs:
 * - formValues: valores iniciales del formulario (name, description, salePrice, etc.)
 * - categories: lista de categorías para select
 * - units: lista de unidades de medida para select
 * - fieldErrors: errores por campo desde el backend (ej: { 'name': 'Ya existe', 'sku': 'Formato inválido' })
 * - isLoadingDeps: spinner mientras se cargan dependencias (categorías, unidades)
 * - detailedProduct: producto completo con costPrice, stock (para modo edición)
 * - isEditMode: boolean que determina si están read-only los campos SKU y stock
 *
 * Outputs:
 * - (ninguno actualmente, pero podría agregar)
 *
 * Validaciones:
 * - Individuales en inputs (min, max, required)
 * - Cruzadas en el padre (StateService) — no aquí
 */
@Component({
  selector: 'bt-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-text-primary">Nombre *</label>
        <input
          type="text"
          [(ngModel)]="name"
          (change)="onFieldChange('name')"
          placeholder="Ej: Arroz Integral"
          maxlength="100"
          required
          class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
          [class.border-error]="hasFieldError('name')"
        />
        @if (hasFieldError('name')) {
          <p class="mt-1 text-xs text-error">{{ fieldErrors()['name'] }}</p>
        }
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-text-primary">Descripción</label>
        <textarea
          [(ngModel)]="description"
          (change)="onFieldChange('description')"
          placeholder="Descripción adicional (opcional)"
          rows="3"
          maxlength="500"
          class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
          [class.border-error]="hasFieldError('description')"
        ></textarea>
      </div>

      <!-- Precio de Venta & Precio de Costo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-primary">Precio de Venta *</label>
          <input
            type="number"
            [(ngModel)]="salePrice"
            (change)="onFieldChange('salePrice')"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.border-error]="hasFieldError('salePrice')"
          />
          @if (hasFieldError('salePrice')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['salePrice'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary">Precio de Costo</label>
          <input
            type="number"
            [(ngModel)]="costPrice"
            (change)="onFieldChange('costPrice')"
            placeholder="0.00"
            min="0"
            step="0.01"
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.border-error]="hasFieldError('costPrice')"
          />
          @if (hasFieldError('costPrice')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['costPrice'] }}</p>
          }
        </div>
      </div>

      <!-- Categoría & Unidad -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-primary">Categoría *</label>
          @if (isLoadingDeps()) {
            <div class="mt-1 rounded border border-outline bg-surface-container px-3 py-2 text-text-secondary">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="categoryId"
              (change)="onFieldChange('categoryId')"
              required
              class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
              [class.border-error]="hasFieldError('categoryId')"
            >
              <option value="">-- Seleccionar --</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          }
          @if (hasFieldError('categoryId')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['categoryId'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary">Unidad de Medida *</label>
          @if (isLoadingDeps()) {
            <div class="mt-1 rounded border border-outline bg-surface-container px-3 py-2 text-text-secondary">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="unitId"
              (change)="onFieldChange('unitId')"
              required
              class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary focus:border-primary focus:outline-none"
              [class.border-error]="hasFieldError('unitId')"
            >
              <option value="">-- Seleccionar --</option>
              @for (unit of units(); track unit.id) {
                <option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</option>
              }
            </select>
          }
          @if (hasFieldError('unitId')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['unitId'] }}</p>
          }
        </div>
      </div>

      <!-- Stock Mínimo & Stock Máximo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-primary">Stock Mínimo</label>
          <input
            type="number"
            [(ngModel)]="minStock"
            (change)="onFieldChange('minStock')"
            placeholder="0"
            min="0"
            step="1"
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.border-error]="hasFieldError('minStock')"
          />
          @if (hasFieldError('minStock')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['minStock'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary">Stock Máximo</label>
          <input
            type="number"
            [(ngModel)]="maxStock"
            (change)="onFieldChange('maxStock')"
            placeholder="0"
            min="0"
            step="1"
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.border-error]="hasFieldError('maxStock')"
          />
          @if (hasFieldError('maxStock')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['maxStock'] }}</p>
          }
        </div>
      </div>

      <!-- Código & Barcode (SKU read-only en edición) -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-text-primary">
            SKU
            @if (isEditMode()) {
              <span class="text-text-secondary">(lectura)</span>
            } @else {
              <span>*</span>
            }
          </label>
          <input
            type="text"
            [(ngModel)]="sku"
            (change)="onFieldChange('sku')"
            [readonly]="isEditMode()"
            placeholder="Ej: ARZ-INT-001"
            maxlength="50"
            [required]="!isEditMode()"
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.bg-surface-container]="isEditMode()"
            [class.cursor-not-allowed]="isEditMode()"
            [class.opacity-75]="isEditMode()"
            [class.border-error]="hasFieldError('sku')"
          />
          @if (hasFieldError('sku')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['sku'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-text-primary">Código de Barras</label>
          <input
            type="text"
            [(ngModel)]="barcode"
            (change)="onFieldChange('barcode')"
            placeholder="Ej: 7896014250014"
            maxlength="50"
            class="mt-1 w-full rounded border border-outline px-3 py-2 text-text-primary placeholder-text-secondary focus:border-primary focus:outline-none"
            [class.border-error]="hasFieldError('barcode')"
          />
          @if (hasFieldError('barcode')) {
            <p class="mt-1 text-xs text-error">{{ fieldErrors()['barcode'] }}</p>
          }
        </div>
      </div>

      <!-- Stock actual (solo lectura en edición) -->
      @if (isEditMode()) {
        <div>
          <label class="block text-sm font-medium text-text-primary">Stock Actual (lectura)</label>
          <input
            type="number"
            [value]="currentStock()"
            readonly
            class="mt-1 w-full rounded border border-outline bg-surface-container px-3 py-2 text-text-primary cursor-not-allowed opacity-75"
          />
          <p class="mt-1 text-xs text-text-secondary">
            El stock se gestiona a través de movimientos de inventario
          </p>
        </div>
      }
    </div>
  `,
})
export class ProductFormComponent {
  // Inputs
  formValues = input<{
    name: string;
    description: string | null;
    salePrice: number;
    costPrice: number | null;
    categoryId: string;
    unitId: string;
    minStock: number;
    maxStock: number | null;
    sku: string;
    barcode: string | null;
  } | null>();

  categories = input<CategorySummaryDto[]>([]);
  units = input<MeasurementUnitSummaryDto[]>([]);
  fieldErrors = input<Record<string, string>>({});
  isLoadingDeps = input(false);
  detailedProduct = input<ProductDetail | null>();
  isEditMode = input(false);

  // Signals locales
  name = signal('');
  description = signal<string | null>(null);
  salePrice = signal(0);
  costPrice = signal<number | null>(null);
  categoryId = signal('');
  unitId = signal('');
  minStock = signal(0);
  maxStock = signal<number | null>(null);
  sku = signal('');
  barcode = signal<string | null>(null);

  // Computed
  currentStock = computed(() => this.detailedProduct()?.stock ?? 0);

  // Touched fields para validación
  private touchedFields = signal<Set<string>>(new Set());

  constructor() {
    // Sincronizar formValues → signals locales
    effect(() => {
      const values = this.formValues();
      if (values) {
        this.name.set(values.name);
        this.description.set(values.description);
        this.salePrice.set(values.salePrice);
        this.costPrice.set(values.costPrice);
        this.categoryId.set(values.categoryId);
        this.unitId.set(values.unitId);
        this.minStock.set(values.minStock);
        this.maxStock.set(values.maxStock);
        this.sku.set(values.sku);
        this.barcode.set(values.barcode);
      }
    });
  }

  // Métodos públicos (API)

  /**
   * Obtener valores actuales del formulario.
   * Llamado por el padre al confirmar crear/editar.
   */
  getFormValues() {
    return {
      name: this.name(),
      description: this.description() || undefined,
      salePrice: this.salePrice(),
      costPrice: this.costPrice() ?? undefined,
      categoryId: this.categoryId(),
      unitId: this.unitId(),
      minStock: this.minStock(),
      maxStock: this.maxStock() ?? undefined,
      sku: this.sku(),
      barcode: this.barcode() || undefined,
    };
  }

  /**
   * Marcar todos los campos como "touched" para mostrar errores de validación.
   */
  markAllTouched(): void {
    const allFields = [
      'name',
      'description',
      'salePrice',
      'costPrice',
      'categoryId',
      'unitId',
      'minStock',
      'maxStock',
      'sku',
      'barcode',
    ];
    this.touchedFields.set(new Set(allFields));
  }

  /**
   * Computed que retorna true si el formulario tiene errores de validación.
   */
  hasErrors = computed(() => {
    const errors = this.fieldErrors();
    return Object.keys(errors).length > 0;
  });

  /**
   * Revisar si un campo específico tiene error de backend.
   */
  hasFieldError(fieldName: string): boolean {
    return fieldName in this.fieldErrors();
  }

  /**
   * Al cambiar un campo, agregarlo a touched.
   */
  onFieldChange(fieldName: string): void {
    this.touchedFields.update(set => new Set([...set, fieldName]));
  }
}
