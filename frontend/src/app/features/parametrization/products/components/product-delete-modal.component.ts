import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { TemplateRef } from '@angular/core';

/**
 * Componente dumb del modal de eliminar producto.
 *
 * Funcionalidades:
 * - Expone @ViewChild('deleteModalTemplate') para que el padre lo abra
 * - Muestra confirmación: nombre del producto y botón de confirmar/cancelar
 * - No maneja estado, solo expone templates
 * - Errores mostrados en el modal (ej: "No se puede eliminar si tiene movimientos")
 *
 * Inputs:
 * - productName: nombre del producto a eliminar (mostrado en el mensaje)
 * - generalError: mensaje de error general del backend
 *
 * El padre maneja:
 * - onConfirm() → StateService.deleteProduct(id)
 * - onCancel() → cerrar modal
 */
@Component({
  selector: 'bt-product-delete-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #deleteModalTemplate>
      <div class="space-y-4">
        <!-- Error Alert -->
        @if (generalError()) {
          <div class="rounded bg-error/20 p-3 text-sm text-error">
            {{ generalError() }}
          </div>
        }

        <!-- Confirmation Message -->
        <p class="text-sm text-text-primary">
          ¿Está seguro de que desea eliminar el producto
          <strong>{{ productName() }}</strong
          >? Esta acción no se puede deshacer.
        </p>
      </div>
    </ng-template>
  `,
})
export class ProductDeleteModalComponent {
  @ViewChild('deleteModalTemplate') deleteModalTemplate!: TemplateRef<unknown>;

  // Inputs
  productName = input('');
  generalError = input<string | null>(null);
}
