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
             Nombre <span class="text-error font-semibold">*</span>
           </label>
           <input
             type="text"
             [(ngModel)]="name"
             (blur)="nameTouched.set(true)"
             placeholder="Ej: Distribuidora del Valle S.A.S"
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
             NIT <span class="text-error font-semibold">*</span>
           </label>
           <input
             type="text"
             [(ngModel)]="nit"
             (blur)="nitTouched.set(true)"
             placeholder="Ej: 900123456-7"
             maxlength="50"
             required
             [class.border-error]="nitError()"
             [class.focus:ring-error/20]="nitError()"
             class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                    placeholder:text-on-surface-variant text-sm
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
           />
           @if (nitError()) {
             <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
               <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
               {{ nitError() }}
             </p>
           }
         </div>
       </div>

       <!-- Nombre de contacto -->
       <div>
         <label class="block text-sm font-medium text-on-surface mb-1">
           Nombre de Contacto <span class="text-error font-semibold">*</span>
         </label>
         <input
           type="text"
           [(ngModel)]="contactName"
           (blur)="contactNameTouched.set(true)"
           placeholder="Ej: Carlos Andrés Morales"
           maxlength="255"
           required
           [class.border-error]="contactNameError()"
           [class.focus:ring-error/20]="contactNameError()"
           class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                  placeholder:text-on-surface-variant text-sm
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
         />
         @if (contactNameError()) {
           <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
             <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
             {{ contactNameError() }}
           </p>
         }
       </div>

       <!-- Email & Teléfono -->
       <div class="grid grid-cols-2 gap-4">
         <div>
           <label class="block text-sm font-medium text-on-surface mb-1">
             Email <span class="text-error font-semibold">*</span>
           </label>
           <input
             type="email"
             [(ngModel)]="email"
             (blur)="emailTouched.set(true)"
             placeholder="Ej: contacto@proveedor.com"
             maxlength="255"
             required
             [class.border-error]="emailError()"
             [class.focus:ring-error/20]="emailError()"
             class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                    placeholder:text-on-surface-variant text-sm
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
           />
           @if (emailError()) {
             <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
               <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
               {{ emailError() }}
             </p>
           }
         </div>

         <div>
           <label class="block text-sm font-medium text-on-surface mb-1">
             Teléfono <span class="text-error font-semibold">*</span>
           </label>
           <input
             type="text"
             [(ngModel)]="phone"
             (blur)="phoneTouched.set(true)"
             placeholder="Ej: +57 312 456 7890"
             maxlength="30"
             required
             [class.border-error]="phoneError()"
             [class.focus:ring-error/20]="phoneError()"
             class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                    placeholder:text-on-surface-variant text-sm
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
           />
           @if (phoneError()) {
             <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
               <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
               {{ phoneError() }}
             </p>
           }
         </div>
       </div>

       <!-- Dirección -->
       <div>
         <label class="block text-sm font-medium text-on-surface mb-1">
           Dirección <span class="text-error font-semibold">*</span>
         </label>
         <textarea
           [(ngModel)]="address"
           (blur)="addressTouched.set(true)"
           placeholder="Ej: Cra 15 #80-45, Bogotá, Colombia"
           rows="2"
           [class.border-error]="addressError()"
           [class.focus:ring-error/20]="addressError()"
           class="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface text-on-surface
                  placeholder:text-on-surface-variant text-sm
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
         ></textarea>
         @if (addressError()) {
           <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
             <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
             {{ addressError() }}
           </p>
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
  submitTrigger = input<number>(0);

  formChange = output<{
    name: string;
    nit: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
  }>();

  protected name = signal('');
  protected nit = signal('');
  protected contactName = signal('');
  protected email = signal('');
  protected phone = signal('');
  protected address = signal('');
  isActive = signal(true);

  protected nameTouched = signal(false);
  protected nitTouched = signal(false);
  protected contactNameTouched = signal(false);
  protected emailTouched = signal(false);
  protected phoneTouched = signal(false);
  protected addressTouched = signal(false);

  protected nameError = computed(() => {
    const fieldError = this.fieldErrors()['name'];
    if (fieldError) return fieldError;
    if (!this.nameTouched()) return null;
    const n = this.name().trim();
    if (!n) return 'El nombre es requerido';
    return null;
  });

  protected nitError = computed(() => {
    const fieldError = this.fieldErrors()['nit'];
    if (fieldError) return fieldError;
    if (!this.nitTouched()) return null;
    const n = this.nit().trim();
    if (!n) return 'El NIT es requerido';
    return null;
  });

  protected contactNameError = computed(() => {
    const fieldError = this.fieldErrors()['contactName'];
    if (fieldError) return fieldError;
    if (!this.contactNameTouched()) return null;
    const cn = this.contactName().trim();
    if (!cn) return 'El nombre de contacto es requerido';
    return null;
  });

  protected emailError = computed(() => {
    const fieldError = this.fieldErrors()['email'];
    if (fieldError) return fieldError;
    if (!this.emailTouched()) return null;
    const e = this.email().trim();
    if (!e) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(e)) return 'El email no es válido';
    return null;
  });

  protected phoneError = computed(() => {
    const fieldError = this.fieldErrors()['phone'];
    if (fieldError) return fieldError;
    if (!this.phoneTouched()) return null;
    const p = this.phone().trim();
    if (!p) return 'El teléfono es requerido';
    return null;
  });

  protected addressError = computed(() => {
    const fieldError = this.fieldErrors()['address'];
    if (fieldError) return fieldError;
    if (!this.addressTouched()) return null;
    const a = this.address().trim();
    if (!a) return 'La dirección es requerida';
    return null;
  });

  hasErrors = computed(() => !!(
    this.nameError() ||
    this.nitError() ||
    this.contactNameError() ||
    this.emailError() ||
    this.phoneError() ||
    this.addressError()
  ));

  constructor() {
    effect(() => {
      const supplier = this.detailedSupplier();
      if (supplier && this.isEditMode()) {
        untracked(() => {
          this.name.set(supplier.name);
          this.nit.set(supplier.nit);
          this.contactName.set(supplier.contactName);
          this.email.set(supplier.email);
          this.phone.set(supplier.phone);
          this.address.set(supplier.address);
          this.isActive.set(supplier.isActive);
        });
      }
    });

    // Emit formChange on every local signal change
    effect(() => {
      this.name();
      this.nit();
      this.contactName();
      this.email();
      this.phone();
      this.address();
      this.formChange.emit(this.getFormValues());
    });

    // Handle submitTrigger: call markAllTouched only on explicit submit (skip initial)
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
      nit: this.nit(),
      contactName: this.contactName(),
      email: this.email(),
      phone: this.phone(),
      address: this.address(),
      ...(this.isEditMode() && { isActive: this.isActive() }),
    };
  }

  markAllTouched(): void {
    this.nameTouched.set(true);
    this.nitTouched.set(true);
    this.contactNameTouched.set(true);
    this.emailTouched.set(true);
    this.phoneTouched.set(true);
    this.addressTouched.set(true);
  }

  reset(): void {
    this.name.set('');
    this.nit.set('');
    this.contactName.set('');
    this.email.set('');
    this.phone.set('');
    this.address.set('');
    this.isActive.set(true);
    this.nameTouched.set(false);
    this.nitTouched.set(false);
    this.contactNameTouched.set(false);
    this.emailTouched.set(false);
    this.phoneTouched.set(false);
    this.addressTouched.set(false);
  }
}
