import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'bt-image-thumbnail',
  standalone: true,
  imports: [NgStyle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-thumbnail.html',
})
export class ImageThumbnail {
  src = input<string | null | undefined>(null);
  alt = input<string>('imagen');
  size = input<number>(36);
  previewSize = input<number>(150);
  placeholder = input<string>('image');

  showPreview = signal(false);
  previewStyle = signal<Record<string, string>>({});

  onMouseEnter(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const size = this.previewSize();
    this.previewStyle.set({
      top: `${rect.top - size - 8}px`,
      left: `${rect.left + rect.width / 2 - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
    });
    this.showPreview.set(true);
  }

  onMouseLeave(): void {
    this.showPreview.set(false);
  }
}
