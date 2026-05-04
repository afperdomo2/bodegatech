import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import type { TemplateRef } from '@angular/core';
import type { ProductSummaryDto } from '../../../../../core/models/responses/product.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ProductStateService } from '../../state/product-state.service';

@Component({
  selector: 'bt-products',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit {
  protected state = inject(ProductStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild('deleteModalTemplate') deleteModalTemplate!: TemplateRef<unknown>;

  selectedProduct = signal<ProductSummaryDto | null>(null);
  pendingAction = signal<'delete' | null>(null);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');

  tableColumns: DataTableColumn[] = [
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'sku', label: 'SKU', type: 'text', align: 'center' },
    { key: 'salePrice', label: 'Precio de Venta', type: 'number', align: 'right' },
    { key: 'stock', label: 'Stock', type: 'number', align: 'center' },
    { key: 'unitName', label: 'Unidad', type: 'text', align: 'center' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', type: 'actions', align: 'center' },
  ];

  constructor() {
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();

        const messages = {
          delete: 'Producto eliminado correctamente',
        };

        const action = this.pendingAction();
        if (action) {
          this.toastService.success(messages[action]);
          this.pendingAction.set(null);
        }
      }
    });

    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.selectedProduct.set(null);
      }
    });

    effect(() => {
      if (this.state.generalError()) {
        this.toastService.error(this.state.generalError() || 'Error desconocido');
      }
    });
  }

  ngOnInit(): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadProducts(0, this.state.pageSize(), filterValue);
  }

  openDeleteModal(product: ProductSummaryDto): void {
    this.selectedProduct.set(product);
    this.modalService.open({
      title: 'Eliminar Producto',
      template: this.deleteModalTemplate,
      size: 'md',
      onConfirm: () => this.confirmDeleteProduct(),
      onCancel: () => {},
    });
  }

  confirmDeleteProduct(): void {
    if (!this.selectedProduct()) return;
    this.pendingAction.set('delete');
    this.state.deleteProduct(this.selectedProduct()!.id);
  }

  onIsActiveFilterChange(value: string): void {
    let isActive: boolean | null = null;
    if (value === 'active') {
      isActive = true;
    } else if (value === 'inactive') {
      isActive = false;
    }
    this.state.loadProducts(0, this.state.pageSize(), isActive);
  }

  onPageChange(newPage: number): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadProducts(newPage - 1, this.state.pageSize(), filterValue);
  }

  onEditClick(product: unknown): void {
    // TODO: Implementar modal de edición
    console.log('Editar:', product);
  }

  onDeleteClick(product: unknown): void {
    this.openDeleteModal(product as ProductSummaryDto);
  }

  openCreateModal(): void {
    // TODO: Implementar modal de creación
    console.log('Crear nuevo producto');
  }

  refreshProducts(): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadProducts(this.state.currentPage(), this.state.pageSize(), filterValue);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }
}
