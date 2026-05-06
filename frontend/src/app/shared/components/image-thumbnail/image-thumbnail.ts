import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'bt-image-thumbnail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './image-thumbnail.html',
})
export class ImageThumbnail {
  src = input<string | null | undefined>(null);
  alt = input<string>('imagen');
  size = input<number>(36);
  previewSize = input<number>(120);
  placeholder = input<string>('image');
}
