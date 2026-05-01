import type { UnitType } from '../../constants/unit-type.constants';

export interface MeasurementUnitDto {
  id: string;
  name: string;
  abbreviation: string;
  type: UnitType;
  isActive: boolean;
  isBaseUnit: boolean;
  baseUnitId: string | null;
  conversionFactor: number | null;
  createdAt: string;
}

export type MeasurementUnitSummaryDto = MeasurementUnitDto;

export interface MeasurementUnitDetail extends MeasurementUnitSummaryDto {
  updatedAt: string;
  version: number;
}
