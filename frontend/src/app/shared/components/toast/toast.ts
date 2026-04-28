import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, type Toast } from '../../services/toast.service';

@Component({
  selector: 'bt-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class ToastComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  getIconForType(type: Toast['type']): string {
    const icons = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type];
  }

  getColorClasses(type: Toast['type']): string {
    const base =
      'flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in pointer-events-auto w-[22rem]';
    const colors = {
      success: 'bg-[#1a6b3f] text-white',
      error: 'bg-error text-white',
      warning: 'bg-[#b45309] text-white',
      info: 'bg-primary text-white',
    };
    return `${base} ${colors[type]}`;
  }

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
