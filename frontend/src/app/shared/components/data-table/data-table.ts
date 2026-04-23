import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'status' | 'actions';
}

@Component({
  selector: 'bt-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  columns = input<DataTableColumn[]>([]);
  data = input<any[]>([]);
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  totalItems = input<number>(0);

  get paginatedData() {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.data().slice(start, start + this.pageSize());
  }

  get totalPagesValue() {
    return Math.ceil(this.totalItems() / this.pageSize());
  }

  get pageArray() {
    return Array.from({ length: this.totalPagesValue }, (_, i) => i + 1);
  }

  getValue(item: any, key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getAlignClass(align?: string) {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  }

  minValue(a: number, b: number) {
    return Math.min(a, b);
  }
}
