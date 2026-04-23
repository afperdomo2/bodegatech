import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bt-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  isOpen = input<boolean>(false);
  title = input<string>('');
  closeModal = output<void>();
  confirmModal = output<void>();

  onBackdropClick() {
    this.closeModal.emit();
  }

  onConfirm() {
    this.confirmModal.emit();
  }

  onCancel() {
    this.closeModal.emit();
  }
}
