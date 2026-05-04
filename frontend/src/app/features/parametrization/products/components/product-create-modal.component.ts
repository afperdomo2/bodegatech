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
import type { CreateProductRequest } from '../../../../core/models/requests/product.requests';

/**
 * Componente dumb del modal de crear producto.
 *
 * Funcionalidades:
 * - Expone @ViewChild('createModalTemplate') para que el padre lo abra
 * - Contiene ProductFormComponent interna (modo create)
 * - No maneja estado, solo expone métodos y templates
 * - El padre inyecta categoryService.categorias, unitService.unidades, etc.
 *
 * Inputs:
 * - name, description, salePrice, etc.: valores iniciales del formulario
 * - categories, units: listas de apoyo
 * - fieldErrors: errores del backend por campo
 * - generalError: mensaje de error general
 * - isLoadingDeps: mientras se cargan categorías y unidades
 *
 * API Pública:
 * - getFormValues() → CreateProductRequest sin transformar
 * - markAllTouched() → validar todos los campos
 * - Acceso a templateRef via @ViewChild
 */
@Component({
  selector: 'bt-product-create-modal',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #createModalTemplate>
      <div class="space-y-4">
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
          [isEditMode]="false"
        />
      </div>
    </ng-template>
  `,
})
export class ProductCreateModalComponent {
  @ViewChild('createModalTemplate') createModalTemplate!: TemplateRef<unknown>;
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
   * Obtener valores del formulario como CreateProductRequest.
   * Llamado por el padre (ProductsComponent) al confirmar crear.
   */
  getFormValues(): CreateProductRequest {
    if (!this.formComponent) {
      throw new Error('FormComponent no está disponible');
    }
    return this.formComponent.getFormValues() as CreateProductRequest;
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
   * Reiniciar el formulario a valores por defecto.
   * Llamado al cerrar el modal (para limpiar antes de abrir nuevamente).
   */
  resetForm(): void {
    this.formValues.set({
      name: '',
      description: null,
      salePrice: 0,
      costPrice: null,
      categoryId: '',
      unitId: '',
      minStock: 0,
      maxStock: null,
      sku: '',
      barcode: null,
    });
  }
}
