import { Component } from '@angular/core';

interface StatCard {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}

@Component({
  selector: 'bt-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  stats: StatCard[] = [
    { label: 'Total de Productos', value: 1250, icon: '📦', color: 'blue' },
    { label: 'Stock Bajo', value: 45, icon: '⚠️', color: 'yellow' },
    { label: 'Movimientos Hoy', value: 128, icon: '↔️', color: 'green' },
    { label: 'Valor Total', value: '$45,320', icon: '💰', color: 'purple' },
  ];
}
