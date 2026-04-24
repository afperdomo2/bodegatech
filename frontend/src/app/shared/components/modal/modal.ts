import { Component, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, type ModalSize } from '../../services/modal.service';

@Component({
  selector: 'bt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  protected modalService = inject(ModalService);

  protected sizeClass = computed(() => {
    const sizeMap: Record<ModalSize, string> = {
      sm: 'max-w-[24rem]',   // 384px
      md: 'max-w-[28rem]',   // 448px
      lg: 'max-w-[32rem]',   // 512px
      xl: 'max-w-[36rem]',   // 576px
      '2xl': 'max-w-[42rem]', // 672px
    };
    return sizeMap[this.modalService.size()];
  });

  onCancel(): void {
    this.modalService.cancel();
  }

  onConfirm(): void {
    this.modalService.confirm();
  }
}
