import { Injectable, signal, TemplateRef } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ModalConfig {
  title?: string;
  template: TemplateRef<unknown>;
  size?: ModalSize;
  hideFooter?: boolean;
  onConfirm?: () => void | false;
  onCancel?: () => void;
  isLoading?: () => boolean; // Optional callback to check loading state
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  isOpen = signal(false);
  title = signal('');
  template = signal<TemplateRef<unknown> | null>(null);
  size = signal<ModalSize>('lg');
  hideFooter = signal(false);
  private onConfirmCallback?: () => void | false;
  private onCancelCallback?: () => void;
  private isLoadingCallback?: () => boolean;

  open(config: ModalConfig | TemplateRef<unknown>): void {
    // Handle both ModalConfig object and direct TemplateRef
    if (config instanceof TemplateRef) {
      this.template.set(config);
      this.title.set('');
      this.size.set('lg'); // default size
      this.hideFooter.set(false);
    } else {
      this.title.set(config.title || '');
      this.template.set(config.template);
      this.size.set(config.size || 'lg');
      this.hideFooter.set(config.hideFooter ?? false);
      this.onConfirmCallback = config.onConfirm;
      this.onCancelCallback = config.onCancel;
      this.isLoadingCallback = config.isLoading;
    }
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.template.set(null);
    this.title.set('');
    this.hideFooter.set(false);
    this.onConfirmCallback = undefined;
    this.onCancelCallback = undefined;
    this.isLoadingCallback = undefined;
  }

  isLoading(): boolean {
    return this.isLoadingCallback?.() ?? false;
  }

  confirm(): void {
    const result = this.onConfirmCallback?.();
    if (result !== false) {
      this.close();
    }
  }

  cancel(): void {
    this.onCancelCallback?.();
    this.close();
  }
}
