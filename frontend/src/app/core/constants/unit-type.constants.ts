export enum UnitType {
  MASS = 'MASS',
  VOLUME = 'VOLUME',
  LENGTH = 'LENGTH',
  AREA = 'AREA',
  QUANTITY = 'QUANTITY',
  TIME = 'TIME',
  TEMPERATURE = 'TEMPERATURE',
}

export interface UnitTypeOption {
  value: UnitType;
  label: string;
}

export const UNIT_TYPE_OPTIONS: UnitTypeOption[] = [
  { value: UnitType.MASS, label: 'Masa' },
  { value: UnitType.VOLUME, label: 'Volumen' },
  { value: UnitType.LENGTH, label: 'Longitud' },
  { value: UnitType.AREA, label: 'Área' },
  { value: UnitType.QUANTITY, label: 'Cantidad' },
  { value: UnitType.TIME, label: 'Tiempo' },
  { value: UnitType.TEMPERATURE, label: 'Temperatura' },
];

export const getUnitTypeLabel = (unitType: UnitType): string => {
  return UNIT_TYPE_OPTIONS.find((opt) => opt.value === unitType)?.label || unitType;
};
