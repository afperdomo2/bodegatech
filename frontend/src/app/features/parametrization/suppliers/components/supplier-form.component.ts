import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToggleSwitchComponent } from '../../../../core/components/toggle-switch.component';
import type { SupplierDetail } from '../../../../core/models/responses/supplier.responses';

@Component({
  selector: 'bt-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ToggleSwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-4">
      <!-- Nombre & NIT -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Nombre <span class="text-error">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="name"
            (change)="onFieldChange('name')"
            placeholder="Ej: Distribuidora del Valle S.A.S"
            maxlength="255"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('name')"
          />
          @if (hasFieldError('name')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['name'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            NIT <span class="text-error">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="nit"
            (change)="onFieldChange('nit')"
            placeholder="Ej: 900123456-7"
            maxlength="50"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('nit')"
          />
          @if (hasFieldError('nit')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['nit'] }}</p>
          }
        </div>
      </div>

      <!-- Nombre de contacto -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">
          Nombre de Contacto <span class="text-error">*</span>
        </label>
        <input
          type="text"
          [(ngModel)]="contactName"
          (change)="onFieldChange('contactName')"
          placeholder="Ej: Carlos Andrés Morales"
          maxlength="255"
          required
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          [class.border-error]="hasFieldError('contactName')"
        />
        @if (hasFieldError('contactName')) {
          <p class="text-xs text-error mt-1">{{ fieldErrors()['contactName'] }}</p>
        }
      </div>

      <!-- Email & Teléfono -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Email <span class="text-error">*</span>
          </label>
          <input
            type="email"
            [(ngModel)]="email"
            (change)="onFieldChange('email')"
            placeholder="Ej: contacto@proveedor.com"
            maxlength="255"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('email')"
          />
          @if (hasFieldError('email')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['email'] }}</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-on-surface mb-1">
            Teléfono <span class="text-error">*</span>
          </label>
          <input
            type="text"
            [(ngModel)]="phone"
            (change)="onFieldChange('phone')"
            placeholder="Ej: +57 312 456 7890"
            maxlength="30"
            required
            class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                   placeholder:text-on-surface-variant text-sm
                   focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            [class.border-error]="hasFieldError('phone')"
          />
          @if (hasFieldError('phone')) {
            <p class="text-xs text-error mt-1">{{ fieldErrors()['phone'] }}</p>
          }
        </div>
      </div>

      <!-- Dirección -->
      <div>
        <label class="block text-sm font-medium text-on-surface mb-1">
          Dirección <span class="text-error">*</span>
        </label>
        <textarea
          [(ngModel)]="address"
          (change)="onFieldChange('address')"
          placeholder="Ej: Cra 15 #80-45, Bogotá, Colombia"
          rows="2"
          class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                 placeholder:text-on-surface-variant text-sm
                 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
          [class.border-error]="hasFieldError('address')"
        ></textarea>
        @if (hasFieldError('address')) {
          <p class="text-xs text-error mt-1">{{ fieldErrors()['address'] }}</p>
        }
      </div>

      <!-- Toggle isActive (solo en edición) -->
      @if (isEditMode()) {
        <div class="pt-2">
          <bt-toggle-switch
            [checked]="isActive()"
            (checkedChange)="isActive.set($event)"
            label="Proveedor activo"
          />
        </div>
      }
    </div>
  `,
})
export class SupplierFormComponent {
  fieldErrors = input<Record<string, string>>({});
  isEditMode = input(false);
  detailedSupplier = input<SupplierDetail | null>();

  name = signal('');
  nit = signal('');
  contactName = signal('');
  email = signal('');
  phone = signal('');
  address = signal('');
  isActive = signal(true);

  private touchedFields = signal<Set<string>>(new Set());

  constructor() {
    effect(() => {
      const supplier = this.detailedSupplier();
      if (supplier && this.isEditMode()) {
        this.name.set(supplier.name);
        this.nit.set(supplier.nit);
        this.contactName.set(supplier.contactName);
        this.email.set(supplier.email);
        this.phone.set(supplier.phone);
        this.address.set(supplier.address);
        this.isActive.set(supplier.isActive);
      }
    });
  }

  getFormValues() {
    return {
      name: this.name(),
      nit: this.nit(),
      contactName: this.contactName(),
      email: this.email(),
      phone: this.phone(),
      address: this.address(),
      ...(this.isEditMode() && { isActive: this.isActive() }),
    };
  }

  markAllTouched(): void {
    this.touchedFields.set(new Set(['name', 'nit', 'contactName', 'email', 'phone', 'address']));
  }

  hasErrors = computed(() => Object.keys(this.fieldErrors()).length > 0);

  hasFieldError(fieldName: string): boolean {
    return fieldName in this.fieldErrors();
  }

  onFieldChange(fieldName: string): void {
    this.touchedFields.update(set => new Set([...set, fieldName]));
  }

  reset(): void {
    this.name.set('');
    this.nit.set('');
    this.contactName.set('');
    this.email.set('');
    this.phone.set('');
    this.address.set('');
    this.isActive.set(true);
    this.touchedFields.set(new Set());
  }
}
