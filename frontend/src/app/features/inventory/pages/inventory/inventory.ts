import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'available' | 'low' | 'out';
}

@Component({
  selector: 'bt-inventory',
  imports: [CommonModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryComponent {
  products = signal<Product[]>([
    { id: '1', name: 'Producto A', category: 'Electrónica', stock: 150, minStock: 50, price: 99.99, status: 'available' },
    { id: '2', name: 'Producto B', category: 'Ropa', stock: 30, minStock: 50, price: 49.99, status: 'low' },
    { id: '3', name: 'Producto C', category: 'Alimentos', stock: 0, minStock: 100, price: 9.99, status: 'out' },
    { id: '4', name: 'Producto D', category: 'Electrónica', stock: 200, minStock: 100, price: 199.99, status: 'available' },
  ]);

  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'out': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'available': return 'Disponible';
      case 'low': return 'Stock bajo';
      case 'out': return 'Agotado';
      default: return 'Desconocido';
    }
  }
}
