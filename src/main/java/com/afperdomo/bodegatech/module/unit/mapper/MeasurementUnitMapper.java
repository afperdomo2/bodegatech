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
    @Mapping(source = "isBaseUnit", target = "isBase")
    MeasurementUnit toEntity(CreateMeasurementUnitRequest request);

    // Update: request → entity (partial update)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "isBaseUnit", target = "isBase")
    void updateEntity(UpdateMeasurementUnitRequest request, @MappingTarget MeasurementUnit unit);

    // Response: entity → Dto (POST/PATCH response)
    @Mapping(source = "isBase", target = "isBaseUnit")
    @Mapping(source = "baseUnit.id", target = "baseUnitId")
    @Mapping(source = "baseUnit.name", target = "baseUnitName")
    MeasurementUnitDto toDto(MeasurementUnit unit);

    // Response: entity → SummaryDto (GET / listado)
    @Mapping(source = "isBase", target = "isBaseUnit")
    @Mapping(source = "baseUnit.id", target = "baseUnitId")
    @Mapping(source = "baseUnit.name", target = "baseUnitName")
    MeasurementUnitSummaryDto toSummaryDto(MeasurementUnit unit);

    // Response: entity → Detail (GET /{id})
    @Mapping(source = "isBase", target = "isBaseUnit")
    @Mapping(source = "baseUnit.id", target = "baseUnitId")
    @Mapping(source = "baseUnit.name", target = "baseUnitName")
    MeasurementUnitDetail toDetail(MeasurementUnit unit);
}
