import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import type { DataTableColumn } from '../../../../shared/components/data-table/data-table';
import { DataTable } from '../../../../shared/components/data-table/data-table';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { SearchInput } from '../../../../shared/components/search-input/search-input';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'Disponible' | 'Bajo Stock' | 'Agotado';
  actions: string;
}

@Component({
  selector: 'bt-inventory',
  standalone: true,
  imports: [CommonModule, DataTable, PageHeader, SearchInput],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryComponent {
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  pageSize = signal(10);

  categories = ['Energía Solar', 'Almacenamiento', 'Accesorios'];
  statuses = ['Disponible', 'Bajo Stock', 'Agotado'];

  products = signal<Product[]>([
    {
      id: '1',
      sku: 'PS-400-001',
      name: 'Panel Solar 400W',
      category: 'Energía Solar',
      stock: 150,
      minStock: 50,
      price: 599.99,
      status: 'Disponible',
      actions: 'more_vert',
    },
    {
      id: '2',
      sku: 'BAT-LFP-048',
      name: 'Batería LiFePO4 48V',
      category: 'Almacenamiento',
      stock: 12,
      minStock: 50,
      price: 1299.99,
      status: 'Bajo Stock',
      actions: 'more_vert',
    },
    {
      id: '3',
      sku: 'INV-HYB-006',
      name: 'Inversor Híbrido 6kW',
      category: 'Almacenamiento',
      stock: 0,
      minStock: 20,
      price: 2499.99,
      status: 'Agotado',
      actions: 'more_vert',
    },
    {
      id: '4',
      sku: 'CABLE-MC4-50',
      name: 'Cable Tipo MC4 50M',
      category: 'Accesorios',
      stock: 245,
      minStock: 100,
      price: 79.99,
      status: 'Disponible',
      actions: 'more_vert',
    },
    {
      id: '5',
      sku: 'STRUCT-RAIL-10',
      name: 'Estructura de Montaje Rail 10M',
      category: 'Accesorios',
      stock: 45,
      minStock: 30,
      price: 189.99,
      status: 'Disponible',
      actions: 'more_vert',
    },
  ]);

  columns: DataTableColumn[] = [
    { key: 'sku', label: 'SKU', width: '120px', align: 'left', type: 'text' },
    { key: 'name', label: 'Producto', width: 'auto', align: 'left', type: 'text' },
    { key: 'category', label: 'Categoría', width: '150px', align: 'left', type: 'text' },
    { key: 'stock', label: 'Stock Actual', width: '100px', align: 'right', type: 'number' },
    { key: 'price', label: 'Precio Unitario', width: '120px', align: 'right', type: 'text' },
    { key: 'status', label: 'Estado', width: '120px', align: 'left', type: 'status' },
    { key: 'actions', label: 'Acciones', width: '80px', align: 'center', type: 'actions' },
  ];

  onSearch(query: string) {
    this.searchQuery.set(query);
  }

  handleCategoryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.onCategoryChange(value);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
  }

  handleStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.onStatusChange(value);
  }

  onStatusChange(status: string) {
    this.selectedStatus.set(status);
  }
}
