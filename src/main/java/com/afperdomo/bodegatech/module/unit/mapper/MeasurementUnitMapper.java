package com.afperdomo.bodegatech.module.unit.mapper;

import com.afperdomo.bodegatech.module.unit.dto.request.CreateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.request.UpdateMeasurementUnitRequest;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDto;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitDetail;
import com.afperdomo.bodegatech.module.unit.dto.response.MeasurementUnitSummaryDto;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MeasurementUnitMapper {

    // Create: request → entity
    // Ignorar baseUnitId porque es read-only; se setea manualmente en el servicio a través de baseUnit
    @Mapping(target = "baseUnitId", ignore = true)
    MeasurementUnit toEntity(CreateMeasurementUnitRequest request);

    // Update: request → entity (partial update)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "baseUnitId", ignore = true)
    void updateEntity(UpdateMeasurementUnitRequest request, @MappingTarget MeasurementUnit unit);

    // Response: entity → Dto (POST/PATCH response)
    MeasurementUnitDto toDto(MeasurementUnit unit);

    // Response: entity → SummaryDto (GET / listado)
    MeasurementUnitSummaryDto toSummaryDto(MeasurementUnit unit);

    // Response: entity → Detail (GET /{id})
    MeasurementUnitDetail toDetail(MeasurementUnit unit);
}
