import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { SupplierFormComponent } from './supplier-form.component';
import type { SupplierDetail } from '../../../../core/models/responses/supplier.responses';
import type { UpdateSupplierRequest } from '../../../../core/models/requests/supplier.requests';

@Component({
  selector: 'bt-supplier-edit-modal',
  standalone: true,
  imports: [SupplierFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #editModalTemplate>
      <bt-supplier-form
        [isEditMode]="true"
        [detailedSupplier]="supplierDetail()"
        [submitTrigger]="submitCount()"
        (formChange)="currentValues.set($event)"
      />
    </ng-template>
  `,
})
export class SupplierEditModalComponent {
  @ViewChild('editModalTemplate') templateRef!: TemplateRef<unknown>;

  supplierDetail = signal<SupplierDetail | null>(null);
  submitCount = signal(0);
  isActive = signal(true);
  currentValues = signal({
    name: '',
    nit: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
  });

  hasErrors = computed(() => {
    const vals = this.currentValues();

    if (!vals.name || !vals.name.trim()) return true;
    if (!vals.nit || !vals.nit.trim()) return true;
    if (!vals.contactName || !vals.contactName.trim()) return true;
    if (!vals.email || !vals.email.trim()) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vals.email.trim())) return true;
    if (!vals.phone || !vals.phone.trim()) return true;
    if (!vals.address || !vals.address.trim()) return true;

    return false;
  });

  loadSupplierData(supplier: SupplierDetail): void {
    this.supplierDetail.set(supplier);
    this.isActive.set(supplier.isActive);
  }

  triggerSubmit(): false | UpdateSupplierRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    return {
      name: this.currentValues().name,
      nit: this.currentValues().nit,
      contactName: this.currentValues().contactName,
      email: this.currentValues().email,
      phone: this.currentValues().phone,
      address: this.currentValues().address,
      isActive: this.isActive(),
    };
  }

  reset(): void {
    this.submitCount.set(0);
    this.currentValues.set({
      name: '',
      nit: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
    });
  }
}
