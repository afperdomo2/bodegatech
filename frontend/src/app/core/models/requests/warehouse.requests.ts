export interface CreateWarehouseRequest {
  name: string;
  code: string;
  location?: string;
  description: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  code?: string;
  location?: string;
  description?: string;
  isActive?: boolean;
}
