import { Component, input } from '@angular/core';

@Component({
  selector: 'bt-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  title = input<string>('');
  value = input<string>('');
  trendValue = input<string>('');
  trendIcon = input<'trending_up' | 'trending_down' | 'trending_flat'>('trending_up');
  icon = input<string>('info');
  variant = input<'primary' | 'secondary' | 'error' | 'warning'>('primary');
}
