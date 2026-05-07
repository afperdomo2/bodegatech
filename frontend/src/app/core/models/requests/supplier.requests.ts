export interface CreateSupplierRequest {
  name: string;
  nit: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  nit?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}
