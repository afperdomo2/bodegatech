import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  signal,
  type TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductFormComponent } from './product-form.component';
import type { CategorySummaryDto } from '../../../../core/models/responses/category.responses';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type { SupplierSummaryDto } from '../../../../core/models/responses/supplier.responses';
import type { ProductDetail } from '../../../../core/models/responses/product.responses';
import type { UpdateProductRequest } from '../../../../core/models/requests/product.requests';

/**
 * Componente dumb del modal de editar producto.
 *
 * Funcionalidades:
 * - Expone @ViewChild('editModalTemplate') para que el padre lo abra
 * - Contiene ProductFormComponent interna (modo edit)
 * - Modo edición: SKU y stock como read-only
 * - Valida y maneja submitCount con patrón reactivo
 * - No maneja estado de negocio, solo state local de validación
 * - El padre inyecta detalle del producto, categorías, unidades
 *
 * Inputs:
 * - name, description, salePrice, etc.: valores iniciales del formulario
 * - categories, units: listas de apoyo
 * - fieldErrors: errores del backend por campo
 * - generalError: mensaje de error general
 * - isLoadingDeps: mientras se cargan categorías y unidades
 * - isLoadingDetail: mientras se carga el detalle del producto
 * - detailedProduct: ProductDetail con costPrice, stock, version
 *
 * API Pública:
 * - triggerSubmit() → valida y retorna UpdateProductRequest o false
 * - reset() → reinicia submitCount y currentValues
 * - loadProductData() → carga datos del producto en edición
 */
@Component({
  selector: 'bt-product-edit-modal',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #editModalTemplate>
      <div class="space-y-4">
        <!-- Loading Detail Spinner -->
        @if (isLoadingDetail()) {
          <div class="flex justify-center py-6">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-outline border-t-primary"></div>
          </div>
        } @else {
          <!-- General Error Alert -->
          @if (generalError()) {
            <div class="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
              {{ generalError() }}
            </div>
          }

          <!-- Product Form (dumb component) -->
          <bt-product-form
            [formValues]="formValues()"
            [categories]="categories()"
            [units]="units()"
            [suppliers]="suppliers()"
            [fieldErrors]="fieldErrors()"
            [isLoadingDeps]="isLoadingDeps()"
            [detailedProduct]="detailedProduct()"
            [isEditMode]="true"
            [submitTrigger]="submitCount()"
            (formChange)="currentValues.set($event)"
          />
        }
      </div>
    </ng-template>
  `,
})
export class ProductEditModalComponent {
  @ViewChild('editModalTemplate') editModalTemplate!: TemplateRef<unknown>;

  // Inputs
  name = input('');
  description = input<string | null>(null);
  salePrice = input<number | null>(null);
  costPrice = input<number | null>(null);
  categoryId = input('');
  unitId = input('');
  minStock = input<number | null>(null);
  maxStock = input<number | null>(null);
  sku = input('');
  barcode = input<string | null>(null);

  categories = input<CategorySummaryDto[]>([]);
  units = input<MeasurementUnitSummaryDto[]>([]);
  suppliers = input<SupplierSummaryDto[]>([]);
  fieldErrors = input<Record<string, string>>({});
  generalError = input<string | null>(null);
  isLoadingDeps = input(false);
  isLoadingDetail = input(false);
  detailedProduct = input<ProductDetail | null>(null);

  // Reactive state
  submitCount = signal(0);
  currentValues = signal<{
    name: string;
    description: string | null;
    salePrice: number | null;
    costPrice: number | null;
    categoryId: string;
    unitId: string;
    supplierId: string | null;
    minStock: number | null;
    maxStock: number | null;
    sku?: string;
    barcode: string | null;
    isActive?: boolean;
  }>({
    name: '',
    description: null,
    salePrice: null,
    costPrice: null,
    categoryId: '',
    unitId: '',
    supplierId: null,
    minStock: null,
    maxStock: null,
    barcode: null,
  });

  // Form values para pasar al ProductFormComponent
  formValues = signal({
    name: '',
    description: null as string | null,
    salePrice: null as number | null,
    costPrice: null as number | null,
    categoryId: '',
    unitId: '',
    supplierId: null as string | null,
    minStock: null as number | null,
    maxStock: null as number | null,
    sku: '',
    barcode: null as string | null,
  });

  // Computed: chequear si hay errores validando currentValues directamente
  hasErrors = computed(() => {
    const fieldErrors = this.fieldErrors();
    const values = this.currentValues();
    const trigger = this.submitCount();

    // Validar backend errors primero
    if (
      fieldErrors['name'] ||
      fieldErrors['salePrice'] ||
      fieldErrors['costPrice'] ||
      fieldErrors['categoryId'] ||
      fieldErrors['unitId']
    ) {
      return true;
    }

    // Si no ha habido submit aún, no mostrar errores de validación
    if (trigger === 0) return false;

    // Validaciones locales
    const name = values.name.trim();
    if (!name || name.length < 2) return true;

    const salePrice = values.salePrice;
    if (salePrice === null || salePrice <= 0) return true;

    const costPrice = values.costPrice;
    if (costPrice === null || costPrice <= 0) return true;

    if (!values.categoryId) return true;
    if (!values.unitId) return true;

    return false;
  });

  /**
   * Trigger del submit: incrementa submitCount, valida, y retorna datos o false.
   * Llamado por el padre (ProductsComponent) al hacer clic en confirmar.
   */
  triggerSubmit(): false | UpdateProductRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    const values = this.currentValues();
    return {
      name: values.name,
      description: values.description || undefined,
      salePrice: values.salePrice!,
      costPrice: values.costPrice ?? undefined,
      categoryId: values.categoryId,
      unitId: values.unitId,
      supplierId: values.supplierId ?? undefined,
      minStock: values.minStock ?? undefined,
      maxStock: values.maxStock ?? undefined,
      barcode: values.barcode || undefined,
      isActive: this.detailedProduct()?.isActive ?? true,
    };
  }

   /**
    * Cargar el formulario con datos del producto en edición.
    * Llamado por el padre al abrir el modal después de cargar el detalle.
    */
  loadProductData(product: ProductDetail): void {
    this.formValues.set({
      name: product.name,
      description: product.description,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      categoryId: product.categoryId,
      unitId: product.unitId,
      supplierId: product.supplier?.id ?? null,
      minStock: product.minStock,
      maxStock: product.maxStock,
      sku: product.sku,
      barcode: product.barcode,
    });
    this.currentValues.set({
      name: product.name,
      description: product.description,
      salePrice: product.salePrice,
      costPrice: product.costPrice,
      categoryId: product.categoryId,
      unitId: product.unitId,
      supplierId: product.supplier?.id ?? null,
      minStock: product.minStock,
      maxStock: product.maxStock,
      sku: product.sku,
      barcode: product.barcode,
    });
  }

  /**
   * Reiniciar el modal a estado por defecto.
   * Llamado por el padre al cerrar o abrir nueva modal.
   */
  reset(): void {
    this.submitCount.set(0);
    this.currentValues.set({
      name: '',
      description: null,
      salePrice: null,
      costPrice: null,
      categoryId: '',
      unitId: '',
      supplierId: null,
      minStock: null,
      maxStock: null,
      barcode: null,
    });
    this.formValues.set({
      name: '',
      description: null,
      salePrice: null,
      costPrice: null,
      categoryId: '',
      unitId: '',
      supplierId: null,
      minStock: null,
      maxStock: null,
      sku: '',
      barcode: null,
    });
  }
}
