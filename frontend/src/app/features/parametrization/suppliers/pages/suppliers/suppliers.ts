import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import type { SupplierDto } from '../../../../../core/models/responses/supplier.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { SupplierStateService } from '../../state/supplier-state.service';
import { SupplierCreateModalComponent } from '../../components/supplier-create-modal.component';
import { SupplierEditModalComponent } from '../../components/supplier-edit-modal.component';
import { SupplierDeleteModalComponent } from '../../components/supplier-delete-modal.component';

@Component({
  selector: 'bt-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    SupplierCreateModalComponent,
    SupplierEditModalComponent,
    SupplierDeleteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './suppliers.html',
})
export class SuppliersComponent implements OnInit {
  protected state = inject(SupplierStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild('createModalComponent') createModalComponent?: SupplierCreateModalComponent;
  @ViewChild('editModalComponent') editModalComponent?: SupplierEditModalComponent;
  @ViewChild('deleteModalComponent') deleteModalComponent?: SupplierDeleteModalComponent;

  selectedSupplier = signal<SupplierDto | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');

  private _editPending = signal(false);

  tableColumns: DataTableColumn[] = [
    { key: 'nit', label: 'NIT', type: 'text', align: 'left' },
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'contactName', label: 'Contacto', type: 'text', align: 'left' },
    { key: 'email', label: 'Email', type: 'text', align: 'left' },
    { key: 'phone', label: 'Teléfono', type: 'text', align: 'center' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];

  constructor() {
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();

        const messages = {
          create: 'Proveedor creado correctamente',
          edit: 'Proveedor actualizado correctamente',
          delete: 'Proveedor eliminado correctamente',
        };

        const action = this.pendingAction();
        if (action && action in messages) {
          this.toastService.success(messages[action as keyof typeof messages]);
          this.pendingAction.set(null);
        }
      }
    });

    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
        this.selectedSupplier.set(null);
      }
    });

    effect(() => {
      if (this.state.generalError()) {
        this.toastService.error(this.state.generalError() || 'Error desconocido');
      }
    });

    effect(() => {
      const detail = this.state.selectedDetail();
      const isLoading = this.state.isLoadingDetail();
      if (this._editPending() && detail && !isLoading) {
        this._editPending.set(false);
        if (!this.editModalComponent) return;

        this.editModalComponent.reset();
        this.editModalComponent.loadSupplierData(detail);

        this.modalService.open({
          title: `Editar: ${detail.name}`,
          template: this.editModalComponent.templateRef,
          size: 'lg',
          onConfirm: () => this.confirmEditSupplier(detail.id),
          onCancel: () => {},
        });
      }
    });
  }

  ngOnInit(): void {
    this.state.loadSuppliers(0, this.state.pageSize(), null);
  }

  // ========== CREATE ==========

  openCreateModal(): void {
    if (!this.createModalComponent) return;
    this.state.clearErrors();
    this.createModalComponent.reset();

    this.modalService.open({
      title: 'Crear Proveedor',
      template: this.createModalComponent.templateRef,
      size: 'lg',
      onConfirm: () => this.confirmCreateSupplier(),
      onCancel: () => {},
    });
  }

  confirmCreateSupplier(): false | void {
    if (!this.createModalComponent) return;
    const formRequest = this.createModalComponent.triggerSubmit();
    if (!formRequest) return false;
    this.pendingAction.set('create');
    this.state.createSupplier(formRequest);
  }

  // ========== EDIT ==========

  openEditModal(supplier: SupplierDto): void {
    this.selectedSupplier.set(supplier);
    this._editPending.set(true);
    this.state.loadSupplierById(supplier.id);
  }

  confirmEditSupplier(supplierId: string): false | void {
    if (!this.editModalComponent) return;
    const formRequest = this.editModalComponent.triggerSubmit();
    if (!formRequest) return false;
    this.pendingAction.set('edit');
    this.state.updateSupplier(supplierId, formRequest);
  }

  // ========== DELETE ==========

  openDeleteModal(supplier: SupplierDto): void {
    this.selectedSupplier.set(supplier);

    if (!this.deleteModalComponent) return;

    this.modalService.open({
      title: 'Eliminar Proveedor',
      template: this.deleteModalComponent.templateRef,
      size: 'md',
      onConfirm: () => this.confirmDeleteSupplier(),
      onCancel: () => {},
    });
  }

  confirmDeleteSupplier(): void {
    if (!this.selectedSupplier()) return;
    this.pendingAction.set('delete');
    this.state.deleteSupplier(this.selectedSupplier()!.id);
  }

  // ========== FILTER & PAGINATION ==========

  onIsActiveFilterChange(value: string): void {
    let isActive: boolean | null = null;
    if (value === 'active') isActive = true;
    else if (value === 'inactive') isActive = false;
    this.isActiveFilter.set(value as 'all' | 'active' | 'inactive');
    this.state.loadSuppliers(0, this.state.pageSize(), isActive);
  }

  onPageChange(newPage: number): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') isActive = true;
    else if (filterValue === 'inactive') isActive = false;
    this.state.loadSuppliers(newPage - 1, this.state.pageSize(), isActive);
  }

  refreshSuppliers(): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') isActive = true;
    else if (filterValue === 'inactive') isActive = false;
    this.state.loadSuppliers(this.state.currentPage(), this.state.pageSize(), isActive);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }

  onEditClick(supplier: unknown): void {
    this.openEditModal(supplier as SupplierDto);
  }

  onDeleteClick(supplier: unknown): void {
    this.openDeleteModal(supplier as SupplierDto);
  }
}
