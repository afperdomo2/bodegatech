import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { WarehouseFormComponent } from './warehouse-form.component';
import type { WarehouseDetail } from '../../../../core/models/responses/warehouse.responses';
import type { UpdateWarehouseRequest } from '../../../../core/models/requests/warehouse.requests';

@Component({
  selector: 'bt-warehouse-edit-modal',
  standalone: true,
  imports: [WarehouseFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #editModalTemplate>
      <bt-warehouse-form
        [isEditMode]="true"
        [detailedWarehouse]="warehouseDetail()"
        [submitTrigger]="submitCount()"
        (formChange)="currentValues.set($event)"
      />
    </ng-template>
  `,
})
export class WarehouseEditModalComponent {
  @ViewChild('editModalTemplate') templateRef!: TemplateRef<unknown>;

  warehouseDetail = signal<WarehouseDetail | null>(null);
  submitCount = signal(0);
  isActive = signal(true);
  currentValues = signal({
    name: '',
    code: '',
    location: '',
    description: '',
  });

  hasErrors = computed(() => {
    const vals = this.currentValues();
    if (!vals.name || !vals.name.trim()) return true;
    if (!vals.code || !vals.code.trim()) return true;
    if (!vals.description || !vals.description.trim()) return true;
    return false;
  });

  loadWarehouseData(warehouse: WarehouseDetail): void {
    this.warehouseDetail.set(warehouse);
    this.isActive.set(warehouse.isActive);
  }

  triggerSubmit(): false | UpdateWarehouseRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    const vals = this.currentValues();
    return {
      name: vals.name,
      code: vals.code,
      description: vals.description,
      ...(vals.location && vals.location.trim() && { location: vals.location }),
      isActive: this.isActive(),
    };
  }

  reset(): void {
    this.submitCount.set(0);
    this.currentValues.set({
      name: '',
      code: '',
      location: '',
      description: '',
    });
  }
}
