import {
  ChangeDetectionStrategy,
  Component,
  type TemplateRef,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { WarehouseFormComponent } from './warehouse-form.component';
import type { CreateWarehouseRequest } from '../../../../core/models/requests/warehouse.requests';

@Component({
  selector: 'bt-warehouse-create-modal',
  standalone: true,
  imports: [WarehouseFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: none' },
  template: `
    <ng-template #createModalTemplate>
      <bt-warehouse-form
        [submitTrigger]="submitCount()"
        (formChange)="currentValues.set($event)"
      />
    </ng-template>
  `,
})
export class WarehouseCreateModalComponent {
  @ViewChild('createModalTemplate') templateRef!: TemplateRef<unknown>;

  submitCount = signal(0);
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

  triggerSubmit(): false | CreateWarehouseRequest {
    this.submitCount.update(c => c + 1);
    if (this.hasErrors()) return false;
    const vals = this.currentValues();
    return {
      name: vals.name,
      code: vals.code,
      description: vals.description,
      ...(vals.location && vals.location.trim() && { location: vals.location }),
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
