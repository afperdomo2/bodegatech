import type { UnitType } from '../constants/unit-type.constants';

export interface MeasurementUnitDto {
  id: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  isActive: boolean;
  isBaseUnit: boolean;
  baseUnitId: string | null;
  baseUnitName: string | null;
  conversionFactor: number | null;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateUnitRequest {
  name: string;
  abbreviation: string;
  type: UnitType;
  isBaseUnit: boolean;
  baseUnitId?: string | null;
  conversionFactor?: number | null;
}

export interface UpdateUnitRequest {
  name?: string;
  abbreviation?: string;
  type?: UnitType;
  isBaseUnit?: boolean;
  baseUnitId?: string | null;
  conversionFactor?: number | null;
}
