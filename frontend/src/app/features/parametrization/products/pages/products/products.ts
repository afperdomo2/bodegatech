import { CommonModule } from '@angular/common';
import type { OnInit, OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import type { ProductSummaryDto } from '../../../../../core/models/responses/product.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { ProductStateService } from '../../state/product-state.service';
import { ProductCreateModalComponent } from '../../components/product-create-modal.component';
import { ProductEditModalComponent } from '../../components/product-edit-modal.component';
import { ProductDeleteModalComponent } from '../../components/product-delete-modal.component';
import { ProductImagesModalComponent } from '../../components/product-images-modal.component';
import { ImageThumbnail } from '../../../../../shared/components/image-thumbnail/image-thumbnail';

@Component({
  selector: 'bt-products',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    ImageThumbnail,
    ProductCreateModalComponent,
    ProductEditModalComponent,
    ProductDeleteModalComponent,
    ProductImagesModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class ProductsComponent implements OnInit, OnDestroy {
  protected state = inject(ProductStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  private destroy$ = new Subject<void>();

  // ViewChild para los 3 componentes modales
  @ViewChild('createModalComponent') createModalComponent?: ProductCreateModalComponent;
  @ViewChild('editModalComponent') editModalComponent?: ProductEditModalComponent;
  @ViewChild('deleteModalComponent') deleteModalComponent?: ProductDeleteModalComponent;
  @ViewChild('imagesModalComponent') imagesModalComponent?: ProductImagesModalComponent;

  selectedProduct = signal<ProductSummaryDto | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');

  // Control para el effect de edit modal
  private _editPending = signal(false);

  tableColumns: DataTableColumn[] = [
    { key: 'mainImageUrl', label: '', align: 'center', width: '60px' },
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'sku', label: 'SKU', type: 'text', align: 'center' },
    { key: 'salePrice', label: 'Precio de Venta', type: 'number', align: 'right' },
    { key: 'unitName', label: 'Unidad', type: 'text', align: 'center' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];

  constructor() {
    // Effect: operación exitosa (create, edit, delete)
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();

        const messages = {
          create: 'Producto creado correctamente',
          edit: 'Producto actualizado correctamente',
          delete: 'Producto eliminado correctamente',
        };

        const action = this.pendingAction();
        if (action && action in messages) {
          this.toastService.success(messages[action as keyof typeof messages]);
          this.pendingAction.set(null);
        }
      }
    });

    // Effect: cerrar modal y limpiar errores
    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.selectedProduct.set(null);
      }
    });

    // Effect: mostrar errores generales
    effect(() => {
      if (this.state.generalError()) {
        this.toastService.error(this.state.generalError() || 'Error desconocido');
      }
    });

     // Effect: abre el modal de edición cuando el detalle llega
    effect(() => {
      const detail = this.state.selectedDetail();
      const isLoading = this.state.isLoadingDetail();
      if (this._editPending() && detail && !isLoading) {
        this._editPending.set(false);
        if (!this.editModalComponent) return;

        // Reiniciar estado del modal antes de cargar nuevos datos
        this.editModalComponent.reset();

        // Cargar datos en el formulario
        this.editModalComponent.loadProductData(detail);

        this.modalService.open({
          title: `Editar: ${detail.name}`,
          template: this.editModalComponent.editModalTemplate,
          size: 'xl',
          onConfirm: () => this.confirmEditProduct(detail.id),
          onCancel: () => {},
        });
      }
    });
  }

  ngOnInit(): void {
    const filterValue = this.state.isActiveFilter();
    this.state.loadProducts(0, this.state.pageSize(), filterValue);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== CREATE ==========

  openCreateModal(): void {
    // Cargar dependencias (categorías, unidades) de forma lazy
    this.state.loadFormDependencies();

    if (!this.createModalComponent) return;
    this.createModalComponent.reset();

    this.modalService.open({
      title: 'Crear Producto',
      template: this.createModalComponent.createModalTemplate,
      size: 'xl',
      onConfirm: () => this.confirmCreateProduct(),
      onCancel: () => {},
    });
  }

  confirmCreateProduct(): false | void {
    if (!this.createModalComponent) return;

    const formRequest = this.createModalComponent.triggerSubmit();
    if (!formRequest) return false;

    this.pendingAction.set('create');
    this.state.createProduct(formRequest);
  }

  // ========== EDIT ==========

  openEditModal(product: ProductSummaryDto): void {
    this.selectedProduct.set(product);
    this._editPending.set(true); // Activar el effect que espera el detalle
    this.state.loadFormDependencies();
    this.state.loadProductById(product.id);
  }

  confirmEditProduct(productId: string): false | void {
    if (!this.editModalComponent) return;

    const formRequest = this.editModalComponent.triggerSubmit();
    if (!formRequest) return false;

    this.pendingAction.set('edit');
    this.state.updateProduct(productId, formRequest);
  }

  // ========== DELETE ==========

  openDeleteModal(product: ProductSummaryDto): void {
    this.selectedProduct.set(product);

    if (!this.deleteModalComponent) return;

    this.modalService.open({
      title: 'Eliminar Producto',
      template: this.deleteModalComponent.deleteModalTemplate,
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

  // ========== FILTER & PAGINATION ==========

  onIsActiveFilterChange(value: string): void {
    let isActive: boolean | null = null;
    if (value === 'active') {
      isActive = true;
    } else if (value === 'inactive') {
      isActive = false;
    }
    this.isActiveFilter.set(value as 'all' | 'active' | 'inactive');
    this.state.loadProducts(0, this.state.pageSize(), isActive);
  }

  onPageChange(newPage: number): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') {
      isActive = true;
    } else if (filterValue === 'inactive') {
      isActive = false;
    }
    this.state.loadProducts(newPage - 1, this.state.pageSize(), isActive);
  }

  // ========== TABLE ACTIONS ==========

  onEditClick(product: unknown): void {
    this.openEditModal(product as ProductSummaryDto);
  }

  onDeleteClick(product: unknown): void {
    this.openDeleteModal(product as ProductSummaryDto);
  }

  onImagesClick(product: unknown): void {
    this.openImagesModal(product as ProductSummaryDto);
  }

  // ========== IMAGES MODAL ==========

  openImagesModal(product: ProductSummaryDto): void {
    this.selectedProduct.set(product);

    if (!this.imagesModalComponent) return;

    // Resetear el formulario (limpiar lista de imágenes)
    this.imagesModalComponent.resetForm();

    // Cargar imágenes existentes desde el backend
    this.imagesModalComponent.loadExistingImages(product.id);

    this.modalService.open({
      title: `Imágenes: ${product.name}`,
      template: this.imagesModalComponent.imagesModalTemplate,
      size: 'xl',
      hideFooter: true,
      onCancel: () => {},
    });
  }

  refreshProducts(): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') {
      isActive = true;
    } else if (filterValue === 'inactive') {
      isActive = false;
    }
    this.state.loadProducts(this.state.currentPage(), this.state.pageSize(), isActive);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }
}
