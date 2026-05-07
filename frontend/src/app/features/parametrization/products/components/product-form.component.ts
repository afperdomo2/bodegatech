import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchComponent } from '../../../../core/components/toggle-switch.component';
import type { CategorySummaryDto } from '../../../../core/models/responses/category.responses';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type { SupplierSummaryDto } from '../../../../core/models/responses/supplier.responses';
import type { ProductDetail } from '../../../../core/models/responses/product.responses';

/**
 * Componente dumb de formulario de producto (create + edit).
 *
 * Funcionalidades:
 * - Modo crear: todos los campos editables
 * - Modo editar: SKU como read-only
 * - Signals locales sincronizadas desde inputs via effect()
 * - Validación reactiva con touched fields y errores locales
 * - submitTrigger: input que activa validación sin mostrar errores al render inicial
 * - formChange: output que emite cambios del formulario al padre
 * - API pública: getFormValues(), triggerSubmit(), hasErrors (computed)
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
 * - submitTrigger: contador que se incrementa cuando el padre llama triggerSubmit()
 *
 * Outputs:
 * - formChange: emite cambios del formulario { name, description, salePrice, ... }
 *
 * Validaciones:
 * - Locales por campo: required, length, número > 0
 * - Backend: errores específicos del servidor (duplicados, etc.)
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
          Nombre <span class="text-error font-semibold">*</span>
        </label>
        <input
          type="text"
          [(ngModel)]="nameLocal"
          (blur)="nameTouched.set(true)"
          placeholder="Ej: Arroz Integral"
          maxlength="100"
          required
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          [class.border-error]="nameError()"
          [class.focus:ring-error/20]="nameError()"
        />
        @if (nameError()) {
          <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
            <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
            {{ nameError() }}
          </p>
        }
      </div>

      <!-- Descripción -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">Descripción</label>
        <textarea
          [(ngModel)]="descriptionLocal"
          placeholder="Descripción adicional (opcional)"
          rows="3"
          maxlength="500"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
          [class.border-error]="descriptionError()"
          [class.focus:ring-error/20]="descriptionError()"
        ></textarea>
        @if (descriptionError()) {
          <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
            <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
            {{ descriptionError() }}
          </p>
        }
      </div>

      <!-- Precio de Venta & Precio de Costo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Precio de Venta <span class="text-error font-semibold">*</span>
          </label>
          <input
            type="number"
            [(ngModel)]="salePriceLocal"
            (blur)="salePriceTouched.set(true)"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="salePriceError()"
            [class.focus:ring-error/20]="salePriceError()"
          />
          @if (salePriceError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ salePriceError() }}
            </p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Precio de Costo <span class="text-error font-semibold">*</span>
          </label>
          <input
            type="number"
            [(ngModel)]="costPriceLocal"
            (blur)="costPriceTouched.set(true)"
            placeholder="0.00"
            min="0"
            step="0.01"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="costPriceError()"
            [class.focus:ring-error/20]="costPriceError()"
          />
          @if (costPriceError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ costPriceError() }}
            </p>
          }
        </div>
      </div>

      <!-- Categoría & Unidad -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Categoría <span class="text-error font-semibold">*</span>
          </label>
          @if (isLoadingDeps()) {
            <div class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant text-sm">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="categoryIdLocal"
              (blur)="categoryIdTouched.set(true)"
              required
              class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              [class.border-error]="categoryIdError()"
              [class.focus:ring-error/20]="categoryIdError()"
            >
              <option value="">-- Seleccionar --</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.id">{{ cat.name }}</option>
              }
            </select>
          }
          @if (categoryIdError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ categoryIdError() }}
            </p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Unidad de Medida <span class="text-error font-semibold">*</span>
          </label>
          @if (isLoadingDeps()) {
            <div class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant text-sm">
              Cargando...
            </div>
          } @else {
            <select
              [(ngModel)]="unitIdLocal"
              (blur)="unitIdTouched.set(true)"
              required
              class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                     focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              [class.border-error]="unitIdError()"
              [class.focus:ring-error/20]="unitIdError()"
            >
              <option value="">-- Seleccionar --</option>
              @for (unit of units(); track unit.id) {
                <option [value]="unit.id">{{ unit.name }} ({{ unit.abbreviation }})</option>
              }
            </select>
          }
          @if (unitIdError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ unitIdError() }}
            </p>
          }
        </div>
      </div>

      <!-- Stock Mínimo & Stock Máximo -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Stock Mínimo</label>
          <input
            type="number"
            [(ngModel)]="minStockLocal"
            placeholder="0"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="minStockError()"
            [class.focus:ring-error/20]="minStockError()"
          />
          @if (minStockError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ minStockError() }}
            </p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">Stock Máximo</label>
          <input
            type="number"
            [(ngModel)]="maxStockLocal"
            placeholder="0"
            min="0"
            step="1"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="maxStockError()"
            [class.focus:ring-error/20]="maxStockError()"
          />
          @if (maxStockError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ maxStockError() }}
            </p>
          }
        </div>
      </div>

      <!-- Proveedor Sugerido -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">Proveedor sugerido</label>
        @if (isLoadingDeps()) {
          <div class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface-variant text-sm">
            Cargando...
          </div>
        } @else {
          <select
            [(ngModel)]="supplierIdLocal"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option [value]="null">-- Sin proveedor --</option>
            @for (supplier of suppliers(); track supplier.id) {
              <option [value]="supplier.id">{{ supplier.name }}</option>
            }
          </select>
        }
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
               [(ngModel)]="skuLocal"
               readonly
               placeholder="Ej: ARZ-INT-001"
               maxlength="50"
               class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container text-on-surface
                      placeholder:text-on-surface-variant text-sm
                      focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors
                      cursor-not-allowed opacity-75"
             />
             @if (skuError()) {
               <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
                 <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
                 {{ skuError() }}
               </p>
             }
           </div>
         }

         <!-- Código de Barras -->
         <div>
           <label class="block text-sm font-medium text-on-surface mb-1">Código de Barras</label>
           <input
             type="text"
             [(ngModel)]="barcodeLocal"
             placeholder="Ej: 7896014250014"
             maxlength="50"
             class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                    placeholder:text-on-surface-variant text-sm
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
             [class.border-error]="barcodeError()"
             [class.focus:ring-error/20]="barcodeError()"
           />
           @if (barcodeError()) {
             <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
               <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
               {{ barcodeError() }}
             </p>
           }
         </div>
       </div>

      @if (isEditMode()) {
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
    salePrice: number | null;
    costPrice: number | null;
    categoryId: string;
    unitId: string;
    supplierId: string | null;
    minStock: number | null;
    maxStock: number | null;
    sku: string;
    barcode: string | null;
  } | null>();

  categories = input<CategorySummaryDto[]>([]);
  units = input<MeasurementUnitSummaryDto[]>([]);
  suppliers = input<SupplierSummaryDto[]>([]);
  fieldErrors = input<Record<string, string>>({});
  isLoadingDeps = input(false);
  detailedProduct = input<ProductDetail | null>();
  isEditMode = input(false);
  submitTrigger = input<number>(0);

  // Outputs
  formChange = output<{
    name: string;
    description: string | null;
    salePrice: number | null;
    costPrice: number | null;
    categoryId: string;
    unitId: string;
    minStock: number | null;
    maxStock: number | null;
    supplierId: string | null;
    sku?: string;
    barcode: string | null;
    isActive?: boolean;
  }>();

  // Local writable signals (para ngModel)
  protected nameLocal = signal('');
  protected descriptionLocal = signal<string | null>(null);
  protected salePriceLocal = signal<number | null>(null);
  protected costPriceLocal = signal<number | null>(null);
  protected categoryIdLocal = signal('');
  protected unitIdLocal = signal('');
  protected supplierIdLocal = signal<string | null>(null);
  protected minStockLocal = signal<number | null>(null);
  protected maxStockLocal = signal<number | null>(null);
  protected skuLocal = signal('');
  protected barcodeLocal = signal<string | null>(null);
  protected isActive = signal(true);

  // Touch signals
  protected nameTouched = signal(false);
  protected salePriceTouched = signal(false);
  protected costPriceTouched = signal(false);
  protected categoryIdTouched = signal(false);
  protected unitIdTouched = signal(false);

  // Computed errors locales (solo campos obligatorios)
  protected nameError = computed(() => {
    const fieldError = this.fieldErrors()['name'];
    if (fieldError) return fieldError;
    if (!this.nameTouched() && this.submitTrigger() === 0) return null;
    const name = this.nameLocal().trim();
    if (!name) return 'El nombre es requerido';
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (name.length > 100) return 'El nombre no puede exceder 100 caracteres';
    return null;
  });

  protected descriptionError = computed(() => {
    const fieldError = this.fieldErrors()['description'];
    if (fieldError) return fieldError;
    const desc = this.descriptionLocal();
    if (desc && desc.length > 500) return 'La descripción no puede exceder 500 caracteres';
    return null;
  });

  protected salePriceError = computed(() => {
    const fieldError = this.fieldErrors()['salePrice'];
    if (fieldError) return fieldError;
    if (!this.salePriceTouched() && this.submitTrigger() === 0) return null;
    const price = this.salePriceLocal();
    if (price === null) return 'El precio de venta es requerido';
    if (price <= 0) return 'El precio debe ser mayor a 0';
    return null;
  });

  protected costPriceError = computed(() => {
    const fieldError = this.fieldErrors()['costPrice'];
    if (fieldError) return fieldError;
    if (!this.costPriceTouched() && this.submitTrigger() === 0) return null;
    const price = this.costPriceLocal();
    if (price === null) return 'El precio de costo es requerido';
    if (price <= 0) return 'El precio debe ser mayor a 0';
    return null;
  });

  protected categoryIdError = computed(() => {
    const fieldError = this.fieldErrors()['categoryId'];
    if (fieldError) return fieldError;
    if (!this.categoryIdTouched() && this.submitTrigger() === 0) return null;
    if (!this.categoryIdLocal()) return 'La categoría es requerida';
    return null;
  });

  protected unitIdError = computed(() => {
    const fieldError = this.fieldErrors()['unitId'];
    if (fieldError) return fieldError;
    if (!this.unitIdTouched() && this.submitTrigger() === 0) return null;
    if (!this.unitIdLocal()) return 'La unidad de medida es requerida';
    return null;
  });

  protected minStockError = computed(() => {
    const fieldError = this.fieldErrors()['minStock'];
    if (fieldError) return fieldError;
    return null;
  });

  protected maxStockError = computed(() => {
    const fieldError = this.fieldErrors()['maxStock'];
    if (fieldError) return fieldError;
    return null;
  });

  protected skuError = computed(() => {
    const fieldError = this.fieldErrors()['sku'];
    if (fieldError) return fieldError;
    return null;
  });

  protected barcodeError = computed(() => {
    const fieldError = this.fieldErrors()['barcode'];
    if (fieldError) return fieldError;
    return null;
  });

  // Computed para validar si el formulario tiene errores
  hasErrors = computed(() => {
    return !!(
      this.nameError() ||
      this.salePriceError() ||
      this.costPriceError() ||
      this.categoryIdError() ||
      this.unitIdError()
    );
  });

  constructor() {
    // Sincronizar formValues → signals locales (solo en modo edición para evitar limpiar campos en creación)
    effect(() => {
      if (this.isEditMode()) {
        untracked(() => {
          const values = this.formValues();
          if (values) {
            this.nameLocal.set(values.name);
            this.descriptionLocal.set(values.description);
            this.salePriceLocal.set(values.salePrice);
            this.costPriceLocal.set(values.costPrice);
            this.categoryIdLocal.set(values.categoryId);
            this.unitIdLocal.set(values.unitId);
            this.supplierIdLocal.set(values.supplierId ?? null);
            this.minStockLocal.set(values.minStock);
            this.maxStockLocal.set(values.maxStock);
            this.skuLocal.set(values.sku);
            this.barcodeLocal.set(values.barcode);
          }
        });
      }
    });

    // Sincronizar isActive desde detailedProduct (solo en modo edición)
    effect(() => {
      const product = this.detailedProduct();
      if (product && this.isEditMode()) {
        this.isActive.set(product.isActive);
      }
    });

    // Emitir formChange en cada cambio de signals locales
    effect(() => {
      this.nameLocal();
      this.descriptionLocal();
      this.salePriceLocal();
      this.costPriceLocal();
      this.categoryIdLocal();
      this.unitIdLocal();
      this.supplierIdLocal();
      this.minStockLocal();
      this.maxStockLocal();
      this.skuLocal();
      this.barcodeLocal();
      this.formChange.emit(this.getFormValues());
    });

    // Handle submitTrigger: marcar todos los campos como touched al submit (solo si trigger > 0)
    effect(
      () => {
        const trigger = this.submitTrigger();
        if (trigger > 0) {
          this.markAllTouched();
        }
      },
      { allowSignalWrites: true }
    );
  }

  // Métodos públicos (API)

  /**
   * Obtener valores actuales del formulario.
   * Llamado por el padre al confirmar crear/editar.
   */
  getFormValues() {
    return {
      name: this.nameLocal(),
      description: this.descriptionLocal(),
      salePrice: this.salePriceLocal(),
      costPrice: this.costPriceLocal(),
      categoryId: this.categoryIdLocal(),
      unitId: this.unitIdLocal(),
      supplierId: this.supplierIdLocal(),
      minStock: this.minStockLocal(),
      maxStock: this.maxStockLocal(),
      barcode: this.barcodeLocal(),
      ...(this.isEditMode() && { sku: this.skuLocal(), isActive: this.isActive() }),
    };
  }

  /**
   * Marcar todos los campos como "touched" para mostrar errores de validación.
   */
  private markAllTouched(): void {
    this.nameTouched.set(true);
    this.salePriceTouched.set(true);
    this.costPriceTouched.set(true);
    this.categoryIdTouched.set(true);
    this.unitIdTouched.set(true);
  }
}

