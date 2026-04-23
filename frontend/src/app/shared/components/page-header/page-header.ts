import { Component, input } from '@angular/core';

@Component({
  selector: 'bt-page-header',
  standalone: true,
  imports: [],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {
  title = input<string>('');
  subtitle = input<string>('');
}
