import type { UnitType } from '../../constants/unit-type.constants';

export interface CreateMeasurementUnitRequest {
  name: string;
  abbreviation: string;
  type: UnitType;
  isBaseUnit: boolean;
  baseUnitId?: string | null;
  conversionFactor?: number | null;
}

export interface UpdateMeasurementUnitRequest {
  name?: string;
  abbreviation?: string;
  type?: UnitType;
  isBaseUnit?: boolean;
  baseUnitId?: string | null;
  conversionFactor?: number | null;
}
