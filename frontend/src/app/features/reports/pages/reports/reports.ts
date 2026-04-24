import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Component, signal, ViewChild } from '@angular/core';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

interface TopProduct {
  sku: string;
  name: string;
  volume: number;
  trend: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'bt-reports',
  standalone: true,
  imports: [StatCard, PageHeader, CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class ReportsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('lineChartCanvas') lineChartCanvas?: ElementRef<HTMLCanvasElement>;

  private lineChart: Chart | null = null;

  stats = signal([
    {
      title: 'Volumen de Salidas',
      value: '24,592 unidades',
      trendValue: '+12.5%',
      trendIcon: 'trending_up' as const,
      icon: 'shopping_cart_checkout',
      variant: 'primary' as const,
    },
    {
      title: 'Tasa de Rotación',
      value: '4.8x',
      trendValue: '+0.3x',
      trendIcon: 'trending_up' as const,
      icon: 'loop',
      variant: 'primary' as const,
    },
    {
      title: 'Rupturas de Stock',
      value: '12 incidencias',
      trendValue: '-2',
      trendIcon: 'trending_down' as const,
      icon: 'warning',
      variant: 'error' as const,
    },
  ]);

  topProducts = signal<TopProduct[]>([
    { sku: 'PS-400-001', name: 'Panel Solar 400W', volume: 1250, trend: 'up' },
    { sku: 'BAT-LFP-048', name: 'Batería LiFePO4 48V', volume: 892, trend: 'up' },
    { sku: 'INV-HYB-006', name: 'Inversor Híbrido 6kW', volume: 456, trend: 'flat' },
    { sku: 'CABLE-MC4-50', name: 'Cable Tipo MC4 50M', volume: 3245, trend: 'up' },
    { sku: 'STRUCT-RAIL-10', name: 'Estructura Montaje', volume: 890, trend: 'down' },
  ]);

  dateRange = signal('30');

  ngAfterViewInit() {
    this.initializeCharts();
  }

  ngOnDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }

  private initializeCharts() {
    const ctx = this.lineChartCanvas?.nativeElement.getContext('2d');
    if (!ctx) return;

    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'],
        datasets: [
          {
            label: 'Salidas',
            data: [3000, 3500, 3200, 4100, 4500, 4200, 4800, 5200],
            borderColor: '#003527',
            backgroundColor: 'rgba(0, 53, 39, 0.05)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#003527',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: 'Entradas',
            data: [2800, 2900, 3100, 3200, 3100, 3300, 3500, 3600],
            borderColor: '#416656',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#416656',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 500,
              },
            },
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

  getTrendIcon(trend: string) {
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      default:
        return 'trending_flat';
    }
  }

  getTrendColor(trend: string) {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-error';
      default:
        return 'text-surface-500';
    }
  }
}
