export interface CreateProductRequest {
  name: string;
  description?: string;
  salePrice: number;
  costPrice?: number;
  categoryId: string;
  unitId: string;
  minStock?: number;
  maxStock?: number;
  barcode?: string;
  supplierId?: string;
}


export interface UpdateProductRequest {
  name?: string;
  description?: string;
  salePrice?: number;
  costPrice?: number;
  categoryId?: string;
  unitId?: string;
  minStock?: number;
  maxStock?: number;
  barcode?: string;
  isActive?: boolean;
  supplierId?: string;
}
