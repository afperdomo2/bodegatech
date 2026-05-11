export interface InventorySummaryDto {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number;
  isLowStock: boolean;
  lastMovementAt: string | null;
  createdAt: string;
}

export interface InventoryProductInfo {
  id: string;
  name: string;
  sku: string;
  salePrice: number;
  costPrice: number;
  minStock: number;
  maxStock: number | null;
}

export interface InventoryWarehouseInfo {
  id: string;
  name: string;
  code: string;
  location: string | null;
  description: string | null;
}

export interface InventoryDto {
  id: string;
  product: InventoryProductInfo;
  warehouse: InventoryWarehouseInfo;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastMovementAt: string | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}