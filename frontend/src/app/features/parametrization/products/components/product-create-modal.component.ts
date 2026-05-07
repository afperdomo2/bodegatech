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
import type { CreateProductRequest } from '../../../../core/models/requests/product.requests';

/**
 * Componente dumb del modal de crear producto.
 *
 * Funcionalidades:
 * - Expone @ViewChild('createModalTemplate') para que el padre lo abra
 * - Contiene ProductFormComponent interna (modo create)
 * - Valida y maneja submitCount con patrón reactivo
 * - No maneja estado de negocio, solo state local de validación
 * - El padre inyecta categoryService.categorias, unitService.unidades, etc.
 *
 * Inputs:
 * - name, description, salePrice, etc.: valores iniciales del formulario (NO se usan en create)
 * - categories, units: listas de apoyo
 * - fieldErrors: errores del backend por campo
 * - generalError: mensaje de error general
 * - isLoadingDeps: mientras se cargan categorías y unidades
 *
 * API Pública:
 * - triggerSubmit() → valida y retorna CreateProductRequest o false
 * - reset() → reinicia submitCount y currentValues
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
          <div class="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
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
          [submitTrigger]="submitCount()"
          (formChange)="currentValues.set($event)"
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

  // Reactive state
  submitCount = signal(0);
  currentValues = signal<{
    name: string;
    description: string | null;
    salePrice: number;
    costPrice: number | null;
    categoryId: string;
    unitId: string;
    minStock: number;
    maxStock: number | null;
    sku?: string;
    barcode: string | null;
    isActive?: boolean;
  }>({
    name: '',
    description: null,
    salePrice: 0,
    costPrice: null,
    categoryId: '',
    unitId: '',
    minStock: 0,
    maxStock: null,
    barcode: null,
  });

  // Form values para pasar al ProductFormComponent (siempre valores por defecto en create)
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

  // Computed: chequear si hay errores
  hasErrors = computed(() => {
    if (!this.formComponent) return false;
    return this.formComponent.hasErrors();
  });

  /**
   * Trigger del submit: incrementa submitCount, valida, y retorna datos o false.
   * Llamado por el padre (ProductsComponent) al hacer clic en confirmar.
   */
  triggerSubmit(): false | CreateProductRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    const values = this.currentValues();
    return {
      name: values.name,
      description: values.description || undefined,
      salePrice: values.salePrice,
      costPrice: values.costPrice ?? undefined,
      categoryId: values.categoryId,
      unitId: values.unitId,
      minStock: values.minStock,
      maxStock: values.maxStock ?? undefined,
      barcode: values.barcode || undefined,
    };
  }

  /**
   * Reiniciar el modal a estado por defecto.
   * Llamado por el padre al abrir la modal (para limpiar antes de abrir nuevamente).
   */
  reset(): void {
    this.submitCount.set(0);
    this.currentValues.set({
      name: '',
      description: null,
      salePrice: 0,
      costPrice: null,
      categoryId: '',
      unitId: '',
      minStock: 0,
      maxStock: null,
      barcode: null,
    });
  }
}
