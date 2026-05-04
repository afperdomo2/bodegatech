import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'bt-toggle-switch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <label class="flex items-center gap-3 cursor-pointer">
      <div class="relative">
        <input
          type="checkbox"
          class="sr-only peer"
          [ngModel]="checked()"
          (ngModelChange)="checkedChange.emit($event)"
          [disabled]="disabled()"
        />
        <div
          class="w-11 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors"
          [class.opacity-50]="disabled()"
        ></div>
        <div
          class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"
          [class.opacity-50]="disabled()"
        ></div>
      </div>
      <span class="text-sm text-on-surface" [class.opacity-75]="disabled()">
        {{ label() }}
      </span>
    </label>
  `,
  styles: [],
})
export class ToggleSwitchComponent {
  checked = input<boolean>(false);
  label = input<string>('Activo');
  disabled = input<boolean>(false);

  checkedChange = output<boolean>();
}
