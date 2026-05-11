import { ChangeDetectionStrategy, Component, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import type { InventorySummaryDto } from '../../../../../core/models/responses/inventory.responses';
import type { WarehouseDto } from '../../../../../core/models/responses/warehouse.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { InventoryStateService } from '../../state/inventory-state.service';
import { InventoryDetailModalComponent } from '../../components/inventory-detail-modal.component';
import { WarehouseService } from '../../../../../core/services/warehouse.service';

@Component({
  selector: 'bt-inventory',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    InventoryDetailModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class InventoryComponent implements OnInit {
  protected state = inject(InventoryStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);
  private warehouseService = inject(WarehouseService);

  @ViewChild('detailModalComponent') detailModalComponent?: InventoryDetailModalComponent;

  warehouses = signal<WarehouseDto[]>([]);
  selectedWarehouseId = signal('');
  lowStockFilter = signal(false);

  tableColumns: DataTableColumn[] = [
    { key: 'productName', label: 'Producto', align: 'left' },
    { key: 'warehouseName', label: 'Bodega', align: 'left' },
    { key: 'stock', label: 'Disponible', align: 'right' },
    { key: 'isLowStock', label: 'Stock', type: 'badge', align: 'center' },
    { key: 'actions', label: 'Acciones', align: 'center' },
  ];

  constructor() {
    effect(() => {
      const error = this.state.generalError();
      if (error) {
        this.toastService.error(error);
      }
    });

    effect(() => {
      if (!this.modalService.isOpen()) {
        this.state.clearErrors();
      }
    });

    effect(() => {
      const detail = this.state.selectedDetail();
      const isLoading = this.state.isLoadingDetail();
      if (detail && !isLoading) {
        this.openDetailModal();
      }
    });
  }

  ngOnInit(): void {
    this.warehouseService.getAll(0, 200).subscribe({
      next: (response) => this.warehouses.set(response.data.items),
    });
    this.state.loadInventories(0, this.state.pageSize());
  }

  onWarehouseFilterChange(warehouseId: string): void {
    this.selectedWarehouseId.set(warehouseId);
    this.state.loadInventories(
      0,
      this.state.pageSize(),
      warehouseId || undefined,
      this.lowStockFilter() || undefined
    );
  }

  onLowStockToggle(): void {
    const newValue = !this.lowStockFilter();
    this.lowStockFilter.set(newValue);
    this.state.loadInventories(
      0,
      this.state.pageSize(),
      this.selectedWarehouseId() || undefined,
      newValue || undefined
    );
  }

  onPageChange(newPage: number): void {
    this.state.loadInventories(
      newPage - 1,
      this.state.pageSize(),
      this.selectedWarehouseId() || undefined,
      this.lowStockFilter() || undefined
    );
  }

  onRefresh(): void {
    this.state.loadInventories(
      this.state.currentPage(),
      this.state.pageSize(),
      this.selectedWarehouseId() || undefined,
      this.lowStockFilter() || undefined
    );
  }

  openDetailModal(): void {
    if (!this.detailModalComponent) return;
    this.modalService.open({
      title: 'Detalle de Inventario',
      template: this.detailModalComponent.templateRef,
      size: '3xl',
      hideFooter: true,
    });
  }

  onRowDetailClick(item: InventorySummaryDto): void {
    this.state.loadInventoryById(item.id);
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }

  formatAvailableQuantity(item: InventorySummaryDto): string {
    return item?.availableQuantity?.toLocaleString('es-CO') ?? '—';
  }

  formatReservedQuantity(item: InventorySummaryDto): string {
    return item?.reservedQuantity?.toLocaleString('es-CO') ?? '—';
  }
}