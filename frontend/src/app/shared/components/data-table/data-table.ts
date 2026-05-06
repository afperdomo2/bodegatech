import type { QueryList, TemplateRef } from '@angular/core';
import { Component, ContentChildren, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BtCellDirective } from './data-table-cell.directive';

export interface DataTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'status' | 'badge' | 'date' | 'actions' | 'name-with-badge' | 'checkbox-disabled';
  formatter?: (value: unknown) => string;
  badgeKey?: string;
  badgeLabel?: string;
}

@Component({
  selector: 'bt-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  @ContentChildren(BtCellDirective) cellTemplates!: QueryList<BtCellDirective>;

  columns = input<DataTableColumn[]>([]);
  data = input<unknown[]>([]);
  currentPage = input<number>(1);
  pageSize = input<number>(10);
  totalItems = input<number>(0);
  loading = input<boolean>(false);

  pageChange = output<number>();
  editClick = output<unknown>();
  deleteClick = output<unknown>();
  imagesClick = output<unknown>();

  get paginatedData() {
    // Server-side pagination: data() already contains only the current page
    return this.data();
  }

  get totalPagesValue() {
    return Math.ceil(this.totalItems() / this.pageSize());
  }

  get pageArray() {
    return Array.from({ length: this.totalPagesValue }, (_, i) => i + 1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPagesValue) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPagesValue) {
      this.pageChange.emit(page);
    }
  }

  onEdit(item: unknown): void {
    this.editClick.emit(item);
  }

  onDelete(item: unknown): void {
    this.deleteClick.emit(item);
  }

  onImages(item: unknown): void {
    this.imagesClick.emit(item);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValue(item: unknown, key: string): any {
    return key.split('.').reduce((obj: unknown, k: string) => (obj as Record<string, unknown>)?.[k], item);
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

  getBadgeClass(value: boolean): string {
    return value ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning';
  }

  getBadgeLabel(value: boolean): string {
    return value ? 'Activo' : 'Inactivo';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  minValue(a: number, b: number) {
    return Math.min(a, b);
  }

  getCellTemplate(key: string): TemplateRef<unknown> | null {
    const directive = this.cellTemplates?.find(d => d.btCell() === key);
    return directive?.templateRef ?? null;
  }
}
