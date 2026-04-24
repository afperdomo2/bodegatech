import { Injectable, signal, TemplateRef } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalConfig {
  title?: string;
  template: TemplateRef<unknown>;
  size?: ModalSize;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  isOpen = signal(false);
  title = signal('');
  template = signal<TemplateRef<unknown> | null>(null);
  size = signal<ModalSize>('lg');
  private onConfirmCallback?: () => void;
  private onCancelCallback?: () => void;

  open(config: ModalConfig | TemplateRef<unknown>): void {
    // Handle both ModalConfig object and direct TemplateRef
    if (config instanceof TemplateRef) {
      this.template.set(config);
      this.title.set('');
      this.size.set('lg'); // default size
    } else {
      this.title.set(config.title || '');
      this.template.set(config.template);
      this.size.set(config.size || 'lg');
      this.onConfirmCallback = config.onConfirm;
      this.onCancelCallback = config.onCancel;
    }
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.template.set(null);
    this.title.set('');
    this.onConfirmCallback = undefined;
    this.onCancelCallback = undefined;
  }

  confirm(): void {
    this.onConfirmCallback?.();
    this.close();
  }

  cancel(): void {
    this.onCancelCallback?.();
    this.close();
  }
}
