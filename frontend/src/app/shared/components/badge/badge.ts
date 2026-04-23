import { Component, input } from '@angular/core';

@Component({
  selector: 'bt-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  variant = input<'success' | 'warning' | 'error' | 'info'>('info');
  label = input<string>('');
}
