import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { SupplierFormComponent } from './supplier-form.component';
import type { CreateSupplierRequest } from '../../../../core/models/requests/supplier.requests';

@Component({
  selector: 'bt-supplier-create-modal',
  standalone: true,
  imports: [SupplierFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #createModalTemplate>
      <bt-supplier-form
        [submitTrigger]="submitCount()"
        (formChange)="currentValues.set($event)"
      />
    </ng-template>
  `,
})
export class SupplierCreateModalComponent {
  @ViewChild('createModalTemplate') templateRef!: TemplateRef<unknown>;

  // Reactive state
  submitCount = signal(0);
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

  triggerSubmit(): false | CreateSupplierRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    return {
      name: this.currentValues().name,
      nit: this.currentValues().nit,
      contactName: this.currentValues().contactName,
      email: this.currentValues().email,
      phone: this.currentValues().phone,
      address: this.currentValues().address,
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
