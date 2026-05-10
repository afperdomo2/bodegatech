import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchComponent } from '../../../../core/components/toggle-switch.component';
import type { WarehouseDetail } from '../../../../core/models/responses/warehouse.responses';

@Component({
  selector: 'bt-warehouse-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Nombre & Código -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Nombre <span class="text-error font-semibold">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="name"
            (blur)="nameTouched.set(true)"
            placeholder="Ej: Bodega Principal Centro"
            maxlength="255"
            required
            [class.border-error]="nameError()"
            [class.focus:ring-error/20]="nameError()"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          @if (nameError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ nameError() }}
            </p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Código <span class="text-error font-semibold">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="code"
            (blur)="codeTouched.set(true)"
            placeholder="Ej: BOD-001"
            maxlength="50"
            required
            [class.border-error]="codeError()"
            [class.focus:ring-error/20]="codeError()"
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />
          @if (codeError()) {
            <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
              <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
              {{ codeError() }}
            </p>
          }
        </div>
      </div>

      <!-- Ubicación (textarea 2 rows) -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">
          Ubicación
        </label>
        <textarea
          [(ngModel)]="location"
          (blur)="locationTouched.set(true)"
          placeholder="Ej: Cra 15 #80-45, Bogotá, Colombia (opcional)"
          rows="2"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
        ></textarea>
      </div>

      <!-- Descripción (textarea 3 rows) -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">
          Descripción <span class="text-error font-semibold">*</span>
        </label>
        <textarea
          [(ngModel)]="description"
          (blur)="descriptionTouched.set(true)"
          placeholder="Ej: Bodega principal para almacenamiento de productos secos"
          rows="3"
          [class.border-error]="descriptionError()"
          [class.focus:ring-error/20]="descriptionError()"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
        ></textarea>
        @if (descriptionError()) {
          <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
            <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
            {{ descriptionError() }}
          </p>
        }
      </div>

      <!-- Toggle isActive (solo en edición) -->
      @if (isEditMode()) {
        <div class="pt-2">
          <bt-toggle-switch
            [checked]="isActive()"
            (checkedChange)="isActive.set($event)"
            label="Bodega activa"
          />
        </div>
      }
    </div>
  `,
})
export class WarehouseFormComponent {
  fieldErrors = input<Record<string, string>>({});
  isEditMode = input(false);
  detailedWarehouse = input<WarehouseDetail | null>();
  submitTrigger = input<number>(0);

  formChange = output<{
    name: string;
    code: string;
    location: string;
    description: string;
  }>();

  protected name = signal('');
  protected code = signal('');
  protected location = signal('');
  protected description = signal('');
  protected isActive = signal(true);

  protected nameTouched = signal(false);
  protected codeTouched = signal(false);
  protected locationTouched = signal(false);
  protected descriptionTouched = signal(false);

  protected nameError = computed(() => {
    const fieldError = this.fieldErrors()['name'];
    if (fieldError) return fieldError;
    if (!this.nameTouched()) return null;
    const n = this.name().trim();
    if (!n) return 'El nombre es requerido';
    return null;
  });

  protected codeError = computed(() => {
    const fieldError = this.fieldErrors()['code'];
    if (fieldError) return fieldError;
    if (!this.codeTouched()) return null;
    const c = this.code().trim();
    if (!c) return 'El código es requerido';
    return null;
  });

  protected descriptionError = computed(() => {
    const fieldError = this.fieldErrors()['description'];
    if (fieldError) return fieldError;
    if (!this.descriptionTouched()) return null;
    const d = this.description().trim();
    if (!d) return 'La descripción es requerida';
    return null;
  });

  hasErrors = computed(() => !!(
    this.nameError() ||
    this.codeError() ||
    this.descriptionError()
  ));

  constructor() {
    effect(() => {
      const warehouse = this.detailedWarehouse();
      if (warehouse && this.isEditMode()) {
        untracked(() => {
          this.name.set(warehouse.name);
          this.code.set(warehouse.code);
          this.location.set(warehouse.location ?? '');
          this.description.set(warehouse.description);
          this.isActive.set(warehouse.isActive);
        });
      }
    });

    effect(() => {
      this.name();
      this.code();
      this.location();
      this.description();
      this.formChange.emit(this.getFormValues());
    });

    effect(
      () => {
        const trigger = this.submitTrigger();
        if (trigger > 0) {
          this.markAllTouched();
        }
      },
      { allowSignalWrites: true }
    );
  }

  getFormValues() {
    return {
      name: this.name(),
      code: this.code(),
      location: this.location(),
      description: this.description(),
      ...(this.isEditMode() && { isActive: this.isActive() }),
    };
  }

  markAllTouched(): void {
    this.nameTouched.set(true);
    this.codeTouched.set(true);
    this.locationTouched.set(true);
    this.descriptionTouched.set(true);
  }

  reset(): void {
    this.name.set('');
    this.code.set('');
    this.location.set('');
    this.description.set('');
    this.isActive.set(true);
    this.nameTouched.set(false);
    this.codeTouched.set(false);
    this.locationTouched.set(false);
    this.descriptionTouched.set(false);
  }
}
