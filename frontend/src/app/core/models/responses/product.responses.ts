export interface ProductImageDto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  isMain: boolean;
  createdAt: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description: string | null;
  salePrice: number;
  minStock: number;
  maxStock: number | null;
  sku: string;
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitName: string;
  unitAbbreviation: string;
  mainImageUrl: string | null;
  barcode: string | null;
  isActive: boolean;
  createdAt: string;
}


export type ProductSummaryDto = ProductDto;


export interface ProductDetail extends ProductSummaryDto {
  costPrice: number;
  updatedAt: string;
  version: number;
  images: ProductImageDto[];
  supplier?: { id: string; name: string; nit: string };
}
