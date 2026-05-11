import { ChangeDetectionStrategy, Component, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import type { InventoryMovementSummaryDto } from '../../../../../core/models/responses/movement.responses';
import { DataTable, type DataTableColumn } from '../../../../../shared/components/data-table/data-table';
import { BtCellDirective } from '../../../../../shared/components/data-table/data-table-cell.directive';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { MovementTypeBadge } from '../../../../../shared/components/movement-type-badge/movement-type-badge';
import { ModalService } from '../../../../../shared/services/modal.service';
import { ToastService } from '../../../../../shared/services/toast.service';
import { MovementStateService } from '../../state/movement-state.service';
import { MovementDetailModalComponent } from '../../components/movement-detail-modal.component';

@Component({
  selector: 'bt-movements',
  standalone: true,
  imports: [
    CommonModule,
    PageHeader,
    DataTable,
    BtCellDirective,
    MovementTypeBadge,
    MovementDetailModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movements.html',
  styleUrl: './movements.scss',
})
export class MovementsComponent implements OnInit {
  protected state = inject(MovementStateService);
  protected modalService = inject(ModalService);
  protected toastService = inject(ToastService);

  @ViewChild('detailModalComponent') detailModalComponent?: MovementDetailModalComponent;

  tableColumns: DataTableColumn[] = [
    { key: 'type', label: 'Tipo', align: 'left' },
    { key: 'warehouseName', label: 'Bodega', align: 'left' },
    { key: 'detailCount', label: 'Productos', align: 'center' },
    { key: 'createdAt', label: 'Fecha', align: 'left' },
    { key: 'actions', label: '', align: 'center' },
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
    this.state.loadMovements(0, this.state.pageSize());
  }

  onPageChange(newPage: number): void {
    this.state.loadMovements(newPage - 1, this.state.pageSize());
  }

  onRefresh(): void {
    this.state.loadMovements(this.state.currentPage(), this.state.pageSize());
  }

  onRowDetailClick(item: InventoryMovementSummaryDto): void {
    this.state.loadMovementById(item.id);
  }

  openDetailModal(): void {
    if (!this.detailModalComponent) return;
    this.modalService.open({
      title: 'Detalle de Movimiento',
      template: this.detailModalComponent.templateRef,
      size: 'xl',
      hideFooter: true,
    });
  }

  getCurrentPageForDataTable(): number {
    return this.state.currentPage() + 1;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(date);
  }
}