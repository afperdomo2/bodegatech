package com.afperdomo.bodegatech.module.warehouse.mapper;

import com.afperdomo.bodegatech.module.warehouse.dto.request.CreateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.request.UpdateWarehouseRequest;
import com.afperdomo.bodegatech.module.warehouse.dto.response.WarehouseDto;
import com.afperdomo.bodegatech.module.warehouse.entity.Warehouse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    @Mapping(target = "isActive", ignore = true)
    Warehouse toEntity(CreateWarehouseRequest request);

    WarehouseDto toDto(Warehouse entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(UpdateWarehouseRequest request, @MappingTarget Warehouse entity);
}
