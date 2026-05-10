export interface WarehouseDto {
  id: string;
  name: string;
  code: string;
  location: string | null;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type WarehouseSummaryDto = WarehouseDto;

export type WarehouseDetail = WarehouseSummaryDto;
