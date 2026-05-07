import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
  signal,
} from '@angular/core';
import { SupplierFormComponent } from './supplier-form.component';
import type { SupplierDetail } from '../../../../core/models/responses/supplier.responses';

@Component({
  selector: 'bt-supplier-edit-modal',
  standalone: true,
  imports: [SupplierFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #editModalTemplate>
      <bt-supplier-form
        #formComponent
        [isEditMode]="true"
        [detailedSupplier]="supplierDetail()"
      />
    </ng-template>
  `,
})
export class SupplierEditModalComponent {
  @ViewChild('editModalTemplate') templateRef!: TemplateRef<unknown>;
  @ViewChild('formComponent') form!: SupplierFormComponent;

  supplierDetail = signal<SupplierDetail | null>(null);

  loadSupplierData(supplier: SupplierDetail): void {
    this.supplierDetail.set(supplier);
  }

  getFormValues() {
    return this.form.getFormValues();
  }

  hasErrors(): boolean {
    return this.form.hasErrors();
  }

  markAllTouched(): void {
    this.form.markAllTouched();
  }
}
