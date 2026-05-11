import type { MovementType } from '../../constants/movement-type.constants';

export interface MovementDetailRequest {
  productId: string;
  quantity: number;
}

export interface CreateMovementRequest {
  type: MovementType;
  warehouseId: string;
  supplierId?: string;
  referenceDocument?: string;
  observations?: string;
  details: MovementDetailRequest[];
}