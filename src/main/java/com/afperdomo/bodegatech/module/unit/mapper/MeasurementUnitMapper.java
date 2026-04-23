package com.afperdomo.bodegatech.module.unit.mapper;

import com.afperdomo.bodegatech.module.unit.dto.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MeasurementUnitMapper {

    MeasurementUnitDto toDto(MeasurementUnit unit);

    MeasurementUnit toEntity(CreateMeasurementUnitRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateMeasurementUnitRequest request, @MappingTarget MeasurementUnit unit);
}
