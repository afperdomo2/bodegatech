import type { MovementType } from '../../constants/movement-type.constants';

export interface MovementWarehouseDto {
  id: string;
  name: string;
  code: string;
}

export interface MovementSupplierDto {
  id: string;
  name: string;
}

export interface MovementDetailDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  mainImageUrl: string | null;
  quantity: number;
  previousStock: number;
  currentStock: number;
  createdAt: string;
}

export interface InventoryMovementDto {
  id: string;
  type: MovementType;
  createdAt: string;
  updatedAt: string;
  version: number;
  warehouse: MovementWarehouseDto;
  supplier: MovementSupplierDto | null;
  referenceDocument: string | null;
  observations: string | null;
  detailCount: number;
  details: MovementDetailDto[];
}

export interface InventoryMovementSummaryDto {
  id: string;
  type: MovementType;
  warehouseName: string;
  warehouseCode: string;
  supplierName: string | null;
  referenceDocument: string | null;
  detailCount: number;
  createdAt: string;
}