import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { TemplateRef } from '@angular/core';
import { ProductFormComponent } from './product-form.component';
import type { CategorySummaryDto } from '../../../../core/models/responses/category.responses';
import type { MeasurementUnitSummaryDto } from '../../../../core/models/responses/unit.responses';
import type { ProductDetail } from '../../../../core/models/responses/product.responses';
import type { UpdateProductRequest } from '../../../../core/models/requests/product.requests';

/**
 * Componente dumb del modal de editar producto.
 *
 * Funcionalidades:
 * - Expone @ViewChild('editModalTemplate') para que el padre lo abra
 * - Contiene ProductFormComponent interna (modo edit)
 * - Modo edición: SKU y stock como read-only
 * - No maneja estado, solo expone métodos y templates
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
 * - getFormValues() → UpdateProductRequest
 * - markAllTouched()
 * - hasErrors()
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
            <div class="rounded bg-error/20 p-3 text-sm text-error">
              {{ generalError() }}
            </div>
          }

          <!-- Product Form (dumb component) -->
          <bt-product-form
            #formComponent
            [formValues]="formValues()"
            [categories]="categories()"
            [units]="units()"
            [fieldErrors]="fieldErrors()"
            [isLoadingDeps]="isLoadingDeps()"
            [detailedProduct]="detailedProduct()"
            [isEditMode]="true"
          />
        }
      </div>
    </ng-template>
  `,
})
export class ProductEditModalComponent {
  @ViewChild('editModalTemplate') editModalTemplate!: TemplateRef<unknown>;
  @ViewChild('formComponent') formComponent?: ProductFormComponent;

  // Inputs
  name = input('');
  description = input<string | null>(null);
  salePrice = input(0);
  costPrice = input<number | null>(null);
  categoryId = input('');
  unitId = input('');
  minStock = input(0);
  maxStock = input<number | null>(null);
  sku = input('');
  barcode = input<string | null>(null);

  categories = input<CategorySummaryDto[]>([]);
  units = input<MeasurementUnitSummaryDto[]>([]);
  fieldErrors = input<Record<string, string>>({});
  generalError = input<string | null>(null);
  isLoadingDeps = input(false);
  isLoadingDetail = input(false);
  detailedProduct = input<ProductDetail | null>(null);

  // Computed form values para pasar al ProductFormComponent
  formValues = signal({
    name: '',
    description: null as string | null,
    salePrice: 0,
    costPrice: null as number | null,
    categoryId: '',
    unitId: '',
    minStock: 0,
    maxStock: null as number | null,
    sku: '',
    barcode: null as string | null,
  });

  /**
   * Obtener valores del formulario como UpdateProductRequest.
   * Solo incluye campos que difieren de los valores iniciales.
   * Llamado por el padre al confirmar actualizar.
   */
  getFormValues(): UpdateProductRequest {
    if (!this.formComponent) {
      throw new Error('FormComponent no está disponible');
    }
    // En una implementación más sofisticada, podrías comparar con valores iniciales
    // y solo retornar campos que cambiaron. Por ahora, retornar todos.
    return this.formComponent.getFormValues() as UpdateProductRequest;
  }

  /**
   * Marcar todos los campos como "touched" en el formulario.
   */
  markAllTouched(): void {
    if (!this.formComponent) return;
    this.formComponent.markAllTouched();
  }

  /**
   * Revisar si el formulario tiene errores.
   */
  hasErrors(): boolean {
    if (!this.formComponent) return false;
    return this.formComponent.hasErrors();
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
      minStock: product.minStock,
      maxStock: product.maxStock,
      sku: product.sku,
      barcode: product.barcode,
    });
  }
}
