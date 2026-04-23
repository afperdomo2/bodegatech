package com.afperdomo.bodegatech.module.unitconversion.mapper;

import com.afperdomo.bodegatech.module.unitconversion.dto.CreateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.dto.UnitConversionDto;
import com.afperdomo.bodegatech.module.unitconversion.dto.UpdateUnitConversionRequest;
import com.afperdomo.bodegatech.module.unitconversion.entity.UnitConversion;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UnitConversionMapper {

    @Mapping(source = "fromUnit.id", target = "fromUnitId")
    @Mapping(source = "fromUnit.name", target = "fromUnitName")
    @Mapping(source = "fromUnit.abbreviation", target = "fromUnitAbbreviation")
    @Mapping(source = "toUnit.id", target = "toUnitId")
    @Mapping(source = "toUnit.name", target = "toUnitName")
    @Mapping(source = "toUnit.abbreviation", target = "toUnitAbbreviation")
    UnitConversionDto toDto(UnitConversion conversion);

    @Mapping(target = "fromUnit", ignore = true)
    @Mapping(target = "toUnit", ignore = true)
    UnitConversion toEntity(CreateUnitConversionRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "fromUnit", ignore = true)
    @Mapping(target = "toUnit", ignore = true)
    void updateEntity(UpdateUnitConversionRequest request, @MappingTarget UnitConversion conversion);
}
