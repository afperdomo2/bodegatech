import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import type { WarehouseDto } from '../../../../../core/models/responses/warehouse.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { WarehouseStateService } from '../../state/warehouse-state.service';
import { WarehouseCreateModalComponent } from '../../components/warehouse-create-modal.component';
import { WarehouseEditModalComponent } from '../../components/warehouse-edit-modal.component';
import { WarehouseDeleteModalComponent } from '../../components/warehouse-delete-modal.component';

@Component({
  selector: 'bt-warehouses',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    WarehouseCreateModalComponent,
    WarehouseEditModalComponent,
    WarehouseDeleteModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './warehouses.html',
})
export class WarehousesComponent implements OnInit {
  protected state = inject(WarehouseStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild('createModalComponent') createModalComponent?: WarehouseCreateModalComponent;
  @ViewChild('editModalComponent') editModalComponent?: WarehouseEditModalComponent;
  @ViewChild('deleteModalComponent') deleteModalComponent?: WarehouseDeleteModalComponent;

  selectedWarehouse = signal<WarehouseDto | null>(null);
  pendingAction = signal<'create' | 'edit' | 'delete' | null>(null);
  isActiveFilter = signal<'all' | 'active' | 'inactive'>('all');

  private _editPending = signal(false);

  tableColumns: DataTableColumn[] = [
    { key: 'code', label: 'Código', type: 'text', align: 'left' },
    { key: 'name', label: 'Nombre', type: 'text', align: 'left' },
    { key: 'location', label: 'Ubicación', type: 'text', align: 'left' },
    { key: 'description', label: 'Descripción', type: 'text', align: 'left' },
    { key: 'isActive', label: 'Estado', type: 'badge', align: 'center' },
    { key: 'createdAt', label: 'Creado', type: 'date', align: 'center' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];

  constructor() {
    effect(() => {
      if (this.state.operationSuccess() > 0) {
        this.modalService.close();

        const messages = {
          create: 'Bodega creada correctamente',
          edit: 'Bodega actualizada correctamente',
          delete: 'Bodega eliminada correctamente',
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
        this.selectedWarehouse.set(null);
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
        this.editModalComponent.loadWarehouseData(detail);

        this.modalService.open({
          title: `Editar: ${detail.name}`,
          template: this.editModalComponent.templateRef,
          size: 'lg',
          onConfirm: () => this.confirmEditWarehouse(detail.id),
          onCancel: () => {},
        });
      }
    });
  }

  ngOnInit(): void {
    this.state.loadWarehouses(0, this.state.pageSize(), null);
  }

  // ========== CREATE ==========

  openCreateModal(): void {
    if (!this.createModalComponent) return;
    this.state.clearErrors();
    this.createModalComponent.reset();

    this.modalService.open({
      title: 'Crear Bodega',
      template: this.createModalComponent.templateRef,
      size: 'lg',
      onConfirm: () => this.confirmCreateWarehouse(),
      onCancel: () => {},
    });
  }

  confirmCreateWarehouse(): false | void {
    if (!this.createModalComponent) return;
    const formRequest = this.createModalComponent.triggerSubmit();
    if (!formRequest) return false;
    this.pendingAction.set('create');
    this.state.createWarehouse(formRequest);
  }

  // ========== EDIT ==========

  openEditModal(warehouse: WarehouseDto): void {
    this.selectedWarehouse.set(warehouse);
    this._editPending.set(true);
    this.state.loadWarehouseById(warehouse.id);
  }

  confirmEditWarehouse(warehouseId: string): false | void {
    if (!this.editModalComponent) return;
    const formRequest = this.editModalComponent.triggerSubmit();
    if (!formRequest) return false;
    this.pendingAction.set('edit');
    this.state.updateWarehouse(warehouseId, formRequest);
  }

  // ========== DELETE ==========

  openDeleteModal(warehouse: WarehouseDto): void {
    this.selectedWarehouse.set(warehouse);

    if (!this.deleteModalComponent) return;

    this.modalService.open({
      title: 'Eliminar Bodega',
      template: this.deleteModalComponent.templateRef,
      size: 'md',
      onConfirm: () => this.confirmDeleteWarehouse(),
      onCancel: () => {},
    });
  }

  confirmDeleteWarehouse(): void {
    if (!this.selectedWarehouse()) return;
    this.pendingAction.set('delete');
    this.state.deleteWarehouse(this.selectedWarehouse()!.id);
  }

  // ========== FILTER & PAGINATION ==========

  onIsActiveFilterChange(value: string): void {
    let isActive: boolean | null = null;
    if (value === 'active') isActive = true;
    else if (value === 'inactive') isActive = false;
    this.isActiveFilter.set(value as 'all' | 'active' | 'inactive');
    this.state.loadWarehouses(0, this.state.pageSize(), isActive);
  }

  onPageChange(newPage: number): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') isActive = true;
    else if (filterValue === 'inactive') isActive = false;
    this.state.loadWarehouses(newPage - 1, this.state.pageSize(), isActive);
  }

  refreshWarehouses(): void {
    const filterValue = this.isActiveFilter();
    let isActive: boolean | null = null;
    if (filterValue === 'active') isActive = true;
    else if (filterValue === 'inactive') isActive = false;
    this.state.loadWarehouses(this.state.currentPage(), this.state.pageSize(), isActive);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }

  onEditClick(warehouse: unknown): void {
    this.openEditModal(warehouse as WarehouseDto);
  }

  onDeleteClick(warehouse: unknown): void {
    this.openDeleteModal(warehouse as WarehouseDto);
  }
}
