import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
} from '@angular/core';
import { SupplierFormComponent } from './supplier-form.component';

@Component({
  selector: 'bt-supplier-create-modal',
  standalone: true,
  imports: [SupplierFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #createModalTemplate>
      <bt-supplier-form #formComponent />
    </ng-template>
  `,
})
export class SupplierCreateModalComponent {
  @ViewChild('createModalTemplate') templateRef!: TemplateRef<unknown>;
  @ViewChild('formComponent') form!: SupplierFormComponent;

  getFormValues() {
    return this.form.getFormValues();
  }

  hasErrors(): boolean {
    return this.form.hasErrors();
  }

  markAllTouched(): void {
    this.form.markAllTouched();
  }

  resetForm(): void {
    this.form?.reset();
  }
}
