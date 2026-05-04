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
import { ToggleSwitchComponent } from '../../../../core/components/toggle-switch.component';
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
  imports: [CommonModule, FormsModule, ToggleSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Nombre -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">
          Nombre <span class="text-error">*</span>
        </label>
        <input
          type="text"
          [(ngModel)]="name"
          (change)="onFieldChange('name')"
          placeholder="Ej: Arroz Integral"
          maxlength="100"
          required
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          [class.border-error]="hasFieldError('name')"
          [class.focus:ring-error/20]="hasFieldError('name')"
        />
        @if (hasFieldError('name')) {
          <p class="text-xs text-error mt-1">{{ fieldErrors()['name'] }}</p>
        }
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">Descripción</label>
        <textarea
          [(ngModel)]="description"
          (change)="onFieldChange('description')"
          placeholder="Descripción adicional (opcional)"
          rows="3"
          maxlength="500"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
          [class.border-error]="hasFieldError('description')"
          [class.focus:ring-error/20]="hasFieldError('description')"
        ></textarea>
      </div>

      <!-- Precio de Venta & Precio de Costo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Precio de Venta <span class="text-error">*</span>
          </label>
          <input
            type="number"
            [(ngModel)]="salePrice"
            (change)="onFieldChange('salePrice')"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('salePrice')"
            [class.focus:ring-error/20]="hasFieldError('salePrice')"
          />
          @if (hasFieldError('salePrice')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['salePrice'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Precio de Costo</label>
          <input
            type="number"
            [(ngModel)]="costPrice"
            (change)="onFieldChange('costPrice')"
            placeholder="0.00"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('costPrice')"
            [class.focus:ring-error/20]="hasFieldError('costPrice')"
          />
          @if (hasFieldError('costPrice')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['costPrice'] }}</p>
          }
        </div>
      </div>

      <!-- Categoría & Unidad -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Categoría <span class="text-error">*</span>
          </label>
          @if (isLoadingDeps()) {
            <div class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant text-sm">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="categoryId"
              (change)="onFieldChange('categoryId')"
              required
              class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              [class.border-error]="hasFieldError('categoryId')"
              [class.focus:ring-error/20]="hasFieldError('categoryId')"
            >
              <option value="">-- Seleccionar --</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          }
          @if (hasFieldError('categoryId')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['categoryId'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Unidad de Medida <span class="text-error">*</span>
          </label>
          @if (isLoadingDeps()) {
            <div class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant text-sm">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="unitId"
              (change)="onFieldChange('unitId')"
              required
              class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              [class.border-error]="hasFieldError('unitId')"
              [class.focus:ring-error/20]="hasFieldError('unitId')"
            >
              <option value="">-- Seleccionar --</option>
              @for (unit of units(); track unit.id) {
                <option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</option>
              }
            </select>
          }
          @if (hasFieldError('unitId')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['unitId'] }}</p>
          }
        </div>
      </div>

      <!-- Stock Mínimo & Stock Máximo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Stock Mínimo</label>
          <input
            type="number"
            [(ngModel)]="minStock"
            (change)="onFieldChange('minStock')"
            placeholder="0"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('minStock')"
            [class.focus:ring-error/20]="hasFieldError('minStock')"
          />
          @if (hasFieldError('minStock')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['minStock'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Stock Máximo</label>
          <input
            type="number"
            [(ngModel)]="maxStock"
            (change)="onFieldChange('maxStock')"
            placeholder="0"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('maxStock')"
            [class.focus:ring-error/20]="hasFieldError('maxStock')"
          />
          @if (hasFieldError('maxStock')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['maxStock'] }}</p>
          }
        </div>
      </div>

       <!-- SKU & Barcode -->
       <div class="grid grid-cols-2 gap-4">
         <!-- SKU (solo en edición) -->
         @if (isEditMode()) {
           <div>
             <label class="block text-sm font-medium text-on-surface mb-1">
               SKU <span class="text-on-surface-variant">(lectura)</span>
             </label>
             <input
               type="text"
               [(ngModel)]="sku"
               (change)="onFieldChange('sku')"
               readonly
               placeholder="Ej: ARZ-INT-001"
               maxlength="50"
               class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface
                      placeholder:text-on-surface-variant text-sm
                      focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors
                      cursor-not-allowed opacity-75"
             />
             @if (hasFieldError('sku')) {
               <p class="text-xs text-error mt-1">{{ fieldErrors()['sku'] }}</p>
             }
           </div>
         }

         <!-- Código de Barras -->
         <div>
           <label class="block text-sm font-medium text-on-surface mb-1">Código de Barras</label>
           <input
             type="text"
             [(ngModel)]="barcode"
             (change)="onFieldChange('barcode')"
             placeholder="Ej: 7896014250014"
             maxlength="50"
             class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                    placeholder:text-on-surface-variant text-sm
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
             [class.border-error]="hasFieldError('barcode')"
             [class.focus:ring-error/20]="hasFieldError('barcode')"
           />
           @if (hasFieldError('barcode')) {
             <p class="text-xs text-error mt-1">{{ fieldErrors()['barcode'] }}</p>
           }
         </div>
       </div>

      <!-- Stock actual (solo lectura en edición) -->
      @if (isEditMode()) {
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Stock Actual (lectura)</label>
          <input
            type="number"
            [value]="currentStock()"
            readonly
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface text-sm
                   cursor-not-allowed opacity-75"
          />
          <p class="text-xs text-on-surface-variant mt-1">
            El stock se gestiona a través de movimientos de inventario
          </p>
        </div>

        <!-- Toggle isActive (solo en edición) -->
        <div class="pt-2">
          <bt-toggle-switch
            [checked]="isActive()"
            (checkedChange)="isActive.set($event)"
            label="Producto activo"
          />
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
  isActive = signal(true);

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

    // Sincronizar isActive desde detailedProduct (edición)
    effect(() => {
      const product = this.detailedProduct();
      if (product && this.isEditMode()) {
        this.isActive.set(product.isActive);
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
      barcode: this.barcode() || undefined,
      ...(this.isEditMode() && { sku: this.sku(), isActive: this.isActive() }),
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
