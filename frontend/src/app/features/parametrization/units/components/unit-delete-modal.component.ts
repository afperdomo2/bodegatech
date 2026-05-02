import { Component, input, ViewChild, type TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bt-unit-delete-modal',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-template #deleteModalTemplate>
      <div class="space-y-4">
        <!-- General Error -->
        @if (generalError()) {
          <div class="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-sm text-error">
            {{ generalError() }}
          </div>
        }

        <!-- Confirmation Message -->
        <p class="text-sm text-on-surface">
          ¿Está seguro de que desea eliminar la unidad <strong>{{ unitName() }}</strong>?
        </p>

        <!-- Warning -->
        <p class="text-xs text-on-surface-variant italic">
          Esta acción no se puede deshacer.
        </p>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: none;
    }
  `]
})
export class UnitDeleteModalComponent {
  @ViewChild('deleteModalTemplate') templateRef!: TemplateRef<unknown>;

  unitName = input<string>('');
  generalError = input<string | null>(null);
}
