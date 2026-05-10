import {
  ChangeDetectionStrategy,
  Component,
  input,
  type TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bt-warehouse-delete-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #deleteModalTemplate>
      @if (generalError()) {
        <div class="mb-4 px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm">
          {{ generalError() }}
        </div>
      }
      <p class="text-sm text-on-surface">
        ¿Está seguro que desea eliminar la bodega
        <strong>{{ warehouseName() }}</strong>?
      </p>
      <p class="text-xs text-on-surface-variant mt-2">
        Esta acción no se puede deshacer.
      </p>
    </ng-template>
  `,
})
export class WarehouseDeleteModalComponent {
  @ViewChild('deleteModalTemplate') templateRef!: TemplateRef<unknown>;

  warehouseName = input('');
  generalError = input<string | null>(null);
}
