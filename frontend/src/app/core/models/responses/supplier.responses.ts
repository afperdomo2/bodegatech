export interface SupplierDto {
  id: string;
  name: string;
  nit: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SupplierSummaryDto = SupplierDto;

export type SupplierDetail = SupplierSummaryDto;
