import {
  Component,
  input,
  output,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RichSelectOption {
  value: string;
  label: string;
  sublabels?: string[];
  badge?: string;
  badgeColor?: string;
}

@Component({
  selector: 'bt-rich-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative" [class.opacity-50]="disabled()">
      @if (label()) {
        <label class="block text-sm font-medium text-on-surface mb-1.5">
          {{ label() }} @if (required()) {
            <span class="text-error font-semibold">*</span>
          }
        </label>
      }

      <!-- Trigger Button -->
      <button
        type="button"
        [disabled]="disabled()"
        (click)="toggleDropdown()"
        (blur)="blurEvent.emit()"
        [class.border-error]="fieldError()"
        class="
          w-full flex items-center justify-between gap-2 px-3 py-2.5
          border rounded-lg bg-surface text-on-surface text-sm
          transition-all duration-200
          hover:border-outline-focus
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:cursor-not-allowed disabled:bg-surface-container
        "
        [class.border-outline-variant]="!fieldError()"
        [attr.aria-haspopup]="true"
        [attr.aria-expanded]="isOpen()">
        @if (loading()) {
          <span class="flex items-center gap-2 text-on-surface-variant">
            <span class="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            Cargando...
          </span>
        } @else if (selectedOption(); as opt) {
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <span class="truncate">{{ opt.label }}</span>
            @if (opt.sublabels && opt.sublabels.length > 0) {
              <span class="text-xs text-on-surface-variant truncate hidden sm:inline">
                — {{ opt.sublabels.join(' | ') }}
              </span>
            }
            @if (opt.badge) {
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                [class.bg-success/20]="opt.badgeColor === 'success'"
                [class.text-success]="opt.badgeColor === 'success'"
                [class.bg-primary/20]="opt.badgeColor === 'primary'"
                [class.text-primary]="opt.badgeColor === 'primary'"
                [class.bg-warning/20]="opt.badgeColor === 'warning'"
                [class.text-warning]="opt.badgeColor === 'warning'"
                [class.bg-error/20]="opt.badgeColor === 'error'"
                [class.text-error]="opt.badgeColor === 'error'"
                [class.bg-info/20]="opt.badgeColor === 'info'"
                [class.text-info]="opt.badgeColor === 'info'">
                {{ opt.badge }}
              </span>
            }
          </div>
        } @else {
          <span class="text-on-surface-variant">{{ placeholder() }}</span>
        }

        <!-- Clear button -->
        @if (clearable() && selectedOption()) {
          <button
            type="button"
            (click)="clearSelection(); $event.stopPropagation()"
            class="p-1 rounded-full hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            title="Limpiar selección">
            <span class="material-symbols-outlined text-lg">close</span>
          </button>
        }

        <!-- Arrow icon -->
        <span
          class="material-symbols-outlined text-lg transition-transform duration-200 flex-shrink-0"
          [class.rotate-180]="isOpen()">
          expand_more
        </span>
      </button>

      <!-- Error message -->
      @if (fieldError()) {
        <p class="flex items-center gap-1.5 text-xs text-error animate-fade-in font-medium mt-1">
          <span class="material-symbols-outlined text-sm flex-shrink-0">error</span>
          {{ fieldError() }}
        </p>
      }

      <!-- Dropdown Panel -->
      @if (isOpen() && !disabled()) {
        <div
          class="absolute z-50 w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg overflow-hidden">
          <!-- Search input for filtering -->
          @if (showSearch()) {
            <div class="p-2 border-b border-outline-variant bg-surface-container">
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  (mousedown)="$event.stopPropagation()"
                  placeholder="Buscar..."
                  class="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          }

          <!-- Options list -->
          <div class="max-h-[280px] overflow-y-auto">
            @if (filteredOptions().length === 0) {
              <div class="px-4 py-8 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-3xl mb-2">search_off</span>
                <p class="text-sm">No se encontraron resultados</p>
              </div>
            } @else {
              @for (option of filteredOptions(); track option.value) {
                <button
                  type="button"
                  (click)="selectOption(option)"
                  (mousedown)="$event.preventDefault()"
                  class="w-full flex items-center gap-2 px-4 py-3 text-left transition-colors duration-150 hover:bg-surface-container focus:outline-none focus:bg-surface-container"
                  [class.bg-primary/10]="option.value === selectedValue()"
                  [class.border-l-4]="option.value === selectedValue()"
                  [class.border-primary]="option.value === selectedValue()">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-on-surface truncate">{{ option.label }}</span>
                      @if (option.badge) {
                        <span
                          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                          [class.bg-success/20]="option.badgeColor === 'success'"
                          [class.text-success]="option.badgeColor === 'success'"
                          [class.bg-primary/20]="option.badgeColor === 'primary'"
                          [class.text-primary]="option.badgeColor === 'primary'"
                          [class.bg-warning/20]="option.badgeColor === 'warning'"
                          [class.text-warning]="option.badgeColor === 'warning'"
                          [class.bg-error/20]="option.badgeColor === 'error'"
                          [class.text-error]="option.badgeColor === 'error'"
                          [class.bg-info/20]="option.badgeColor === 'info'"
                          [class.text-info]="option.badgeColor === 'info'">
                          {{ option.badge }}
                        </span>
                      }
                    </div>
                    @if (option.sublabels && option.sublabels.length > 0) {
                      <p class="text-xs text-on-surface-variant mt-0.5 truncate">
                        {{ option.sublabels.join(' | ') }}
                      </p>
                    }
                  </div>
                  @if (option.value === selectedValue()) {
                    <span class="material-symbols-outlined text-primary flex-shrink-0">check</span>
                  }
                </button>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `],
})
export class RichSelectComponent {
  private elementRef = inject(ElementRef);

  options = input.required<RichSelectOption[]>();
  label = input<string>('');
  placeholder = input('Seleccionar...');
  required = input(false);
  disabled = input(false);
  loading = input(false);
  fieldError = input<string | null>(null);
  selectedValue = input<string | null>(null);
  showSearch = input(true);
  clearable = input(false);

  blurEvent = output<void>();
  selectedValueChange = output<string | null>();

  isOpen = signal(false);
  searchQuery = '';

  selectedOption = computed(() => {
    const value = this.selectedValue();
    if (!value) return null;
    return this.options().find((opt) => opt.value === value) || null;
  });

  filteredOptions = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.sublabels?.some((sub) => sub.toLowerCase().includes(query))
    );
  });

  toggleDropdown(): void {
    if (this.disabled()) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.isOpen.set(true);
      this.searchQuery = '';
    }
  }

  selectOption(option: RichSelectOption): void {
    this.selectedValueChange.emit(option.value);
    this.close();
  }

  clearSelection(): void {
    this.selectedValueChange.emit(null);
    this.close();
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery = '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}