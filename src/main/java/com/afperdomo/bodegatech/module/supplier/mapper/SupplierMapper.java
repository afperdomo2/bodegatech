package com.afperdomo.bodegatech.module.supplier.mapper;

import com.afperdomo.bodegatech.module.supplier.dto.request.CreateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.request.UpdateSupplierRequest;
import com.afperdomo.bodegatech.module.supplier.dto.response.SupplierDto;
import com.afperdomo.bodegatech.module.supplier.dto.response.SupplierSummaryDto;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "isActive", ignore = true)
    Supplier toEntity(CreateSupplierRequest request);

    SupplierDto toDto(Supplier entity);

    SupplierSummaryDto toSummaryDto(Supplier entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(UpdateSupplierRequest request, @MappingTarget Supplier entity);
}
