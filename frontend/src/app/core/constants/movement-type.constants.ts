export enum MovementType {
  PURCHASE_ENTRY = 'PURCHASE_ENTRY',
  SALE_EXIT = 'SALE_EXIT',
  TRANSFER_ENTRY = 'TRANSFER_ENTRY',
  TRANSFER_EXIT = 'TRANSFER_EXIT',
  ADJUSTMENT_POS = 'ADJUSTMENT_POS',
  ADJUSTMENT_NEG = 'ADJUSTMENT_NEG',
}

export interface MovementTypeOption {
  value: MovementType;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const MOVEMENT_TYPE_OPTIONS: MovementTypeOption[] = [
  {
    value: MovementType.PURCHASE_ENTRY,
    label: 'Entrada por compra',
    description: 'Ingreso de productos adquiridos',
    icon: 'shopping_cart',
    color: 'success',
  },
  {
    value: MovementType.SALE_EXIT,
    label: 'Salida por venta',
    description: 'Despacho de productos vendidos',
    icon: 'point_of_sale',
    color: 'primary',
  },
  {
    value: MovementType.TRANSFER_ENTRY,
    label: 'Entrada por traslado',
    description: 'Recepción de otra bodega',
    icon: 'arrow_downward',
    color: 'info',
  },
  {
    value: MovementType.TRANSFER_EXIT,
    label: 'Salida por traslado',
    description: 'Envío a otra bodega',
    icon: 'arrow_upward',
    color: 'warning',
  },
  {
    value: MovementType.ADJUSTMENT_POS,
    label: 'Ajuste positivo',
    description: 'Incremento de inventario',
    icon: 'add_circle',
    color: 'success',
  },
  {
    value: MovementType.ADJUSTMENT_NEG,
    label: 'Ajuste negativo',
    description: 'Reducción de inventario',
    icon: 'remove_circle',
    color: 'error',
  },
];

export const getMovementTypeLabel = (type: MovementType): string => {
  return MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === type)?.label || type;
};

export const getMovementTypeOption = (type: MovementType): MovementTypeOption | undefined => {
  return MOVEMENT_TYPE_OPTIONS.find((opt) => opt.value === type);
};