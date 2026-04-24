import type { ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { Component, signal, ViewChild } from '@angular/core';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Chart } from 'chart.js/auto';

interface Activity {
  id: string;
  type: 'entrada' | 'salida' | 'alerta';
  description: string;
  timestamp: string;
  icon: string;
}

@Component({
  selector: 'bt-dashboard',
  standalone: true,
  imports: [StatCard, PageHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('barChartCanvas') barChartCanvas?: ElementRef<HTMLCanvasElement>;

  private barChart: Chart | null = null;

  stats = signal([
    {
      title: 'Valor Total de Inventario',
      value: '$1,245,000',
      trendValue: '+2.4%',
      trendIcon: 'trending_up' as const,
      icon: 'shopping_cart',
      variant: 'primary' as const,
    },
    {
      title: 'Alertas de Stock Bajo',
      value: '14 items',
      trendValue: '2 críticos',
      trendIcon: 'trending_down' as const,
      icon: 'warning',
      variant: 'error' as const,
    },
    {
      title: 'Órdenes Pendientes',
      value: '42 órdenes',
      trendValue: '+12%',
      trendIcon: 'trending_up' as const,
      icon: 'pending_actions',
      variant: 'secondary' as const,
    },
    {
      title: 'Movimientos Hoy',
      value: '128 transacciones',
      trendValue: '+12%',
      trendIcon: 'trending_up' as const,
      icon: 'exchange_notes',
      variant: 'primary' as const,
    },
  ]);

  activities = signal<Activity[]>([
    {
      id: '1',
      type: 'entrada',
      description: 'Entrada: 50 unidades de Panel Solar 400W',
      timestamp: 'hace 2 horas',
      icon: 'call_received',
    },
    {
      id: '2',
      type: 'salida',
      description: 'Salida: 25 unidades de Cable Tipo MC4',
      timestamp: 'hace 4 horas',
      icon: 'call_made',
    },
    {
      id: '3',
      type: 'alerta',
      description: 'Alerta: Batería LiFePO4 bajo mínimo',
      timestamp: 'hace 1 día',
      icon: 'warning',
    },
    {
      id: '4',
      type: 'entrada',
      description: 'Entrada: 100 unidades de Inversor Híbrido',
      timestamp: 'hace 2 días',
      icon: 'call_received',
    },
  ]);

  ngAfterViewInit() {
    this.initializeCharts();
  }

  ngOnDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private initializeCharts() {
    const ctx = this.barChartCanvas?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [
          {
            label: 'Movimientos',
            data: [120, 150, 180, 165, 195, 140, 130],
            backgroundColor: '#003527',
            borderColor: '#003527',
            borderRadius: 8,
            barPercentage: 0.7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#e8ebf0',
              
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  getActivityIconColor(type: string) {
    switch (type) {
      case 'entrada':
        return 'text-success';
      case 'salida':
        return 'text-secondary';
      case 'alerta':
        return 'text-error';
      default:
        return 'text-surface-500';
    }
  }

  getActivityBgColor(type: string) {
    switch (type) {
      case 'entrada':
        return 'bg-success/10';
      case 'salida':
        return 'bg-secondary/10';
      case 'alerta':
        return 'bg-error/10';
      default:
        return 'bg-surface-100';
    }
  }
}
