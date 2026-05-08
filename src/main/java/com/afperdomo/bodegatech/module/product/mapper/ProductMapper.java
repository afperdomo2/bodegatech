package com.afperdomo.bodegatech.module.product.mapper;

import com.afperdomo.bodegatech.config.AwsProperties;
import com.afperdomo.bodegatech.module.product.dto.request.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.request.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductSummaryDto;
import com.afperdomo.bodegatech.module.product.dto.response.ProductDetail;
import com.afperdomo.bodegatech.module.product.dto.response.ProductImageDto;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.entity.ProductImage;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.supplier.dto.response.SupplierSummaryDto;
import com.afperdomo.bodegatech.module.supplier.entity.Supplier;
import com.afperdomo.bodegatech.module.unit.entity.MeasurementUnit;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.UUID;

/**
 * Mapper para convertir entre entidades y DTOs del producto.
 * Utiliza MapStruct para generar la implementación automáticamente.
 * 
 * <p>Nota: Las relaciones @ManyToOne con Category y MeasurementUnit se mapean
 * usando métodos helpers para extraer id, name y abbreviation.
 * 
 * <p>Clase abstracta para acceder a AwsProperties y construir URLs públicas
 * desde fileKey en tiempo de mapeo.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class ProductMapper {

    @Autowired
    protected AwsProperties awsProperties;

    /**
     * Convierte una entidad Product a ProductDto (respuesta básica).
     * Mapea relaciones Category y MeasurementUnit usando métodos helpers.
     * Utilizado en POST y PATCH responses.
     * NOTA: costPrice NO se incluye (información sensible).
     */
    @Mapping(source = "category", target = "categoryId", qualifiedByName = "mapCategoryId")
    @Mapping(source = "category", target = "categoryName", qualifiedByName = "mapCategoryName")
    @Mapping(source = "unit", target = "unitId", qualifiedByName = "mapUnitId")
    @Mapping(source = "unit", target = "unitName", qualifiedByName = "mapUnitName")
    @Mapping(source = "unit", target = "unitAbbreviation", qualifiedByName = "mapUnitAbbreviation")
    @Mapping(source = "supplier", target = "supplier", qualifiedByName = "mapSupplierSummary")
    @Mapping(source = "mainImageKey", target = "mainImageUrl", qualifiedByName = "mapMainImageUrl")
    public abstract ProductDto toDto(Product product);

    /**
     * Convierte una entidad Product a ProductSummaryDto (respuesta resumida).
     * Mapea relaciones Category y MeasurementUnit usando métodos helpers.
     * Utilizado en listados paginados (GET /api/products).
     * NOTA: costPrice, minStock, maxStock, stock, barcode, supplier NO se incluyen.
     */
    @Mapping(source = "category", target = "categoryId", qualifiedByName = "mapCategoryId")
    @Mapping(source = "category", target = "categoryName", qualifiedByName = "mapCategoryName")
    @Mapping(source = "unit", target = "unitId", qualifiedByName = "mapUnitId")
    @Mapping(source = "unit", target = "unitName", qualifiedByName = "mapUnitName")
    @Mapping(source = "unit", target = "unitAbbreviation", qualifiedByName = "mapUnitAbbreviation")
    @Mapping(source = "mainImageKey", target = "mainImageUrl", qualifiedByName = "mapMainImageUrl")
    public abstract ProductSummaryDto toSummaryDto(Product product);

    /**
     * Convierte una entidad Product a ProductDetail (respuesta completa).
     * Mapea relaciones Category y MeasurementUnit usando métodos helpers.
     * Utilizado en GET /api/products/{id}.
     * NOTA: Incluye TODOS los campos incluyendo costPrice (información sensible).
     */
    @Mapping(source = "category", target = "categoryId", qualifiedByName = "mapCategoryId")
    @Mapping(source = "category", target = "categoryName", qualifiedByName = "mapCategoryName")
    @Mapping(source = "unit", target = "unitId", qualifiedByName = "mapUnitId")
    @Mapping(source = "unit", target = "unitName", qualifiedByName = "mapUnitName")
    @Mapping(source = "unit", target = "unitAbbreviation", qualifiedByName = "mapUnitAbbreviation")
    @Mapping(source = "images", target = "images", qualifiedByName = "mapProductImages")
    @Mapping(source = "supplier", target = "supplier", qualifiedByName = "mapSupplierSummary")
    @Mapping(source = "mainImageKey", target = "mainImageUrl", qualifiedByName = "mapMainImageUrl")
    public abstract ProductDetail toDetail(Product product);

    /**
     * Convierte un CreateProductRequest a entidad Product.
     * Los campos id, createdAt, updatedAt, version, isActive, category, unit y supplier
     * se gestionan en el servicio, no en el mapper.
     * Ignora: category, unit, supplier, stock (inicializado en servicio).
     */
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    public abstract Product toEntity(CreateProductRequest request);

    /**
     * Actualiza parcialmente una entidad Product con los campos de UpdateProductRequest.
     * Los campos null en el request se ignoran, preservando el valor actual de la entidad.
     * Preserva siempre: id, sku, createdAt, updatedAt, version, isActive.
     * Ignora: category, unit, supplier (se asignan en ProductService si cambian).
     */
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    public abstract void updateEntity(UpdateProductRequest request, @MappingTarget Product product);

    /**
     * Helper para extraer el ID de la categoría.
     */
    @Named("mapCategoryId")
    protected UUID mapCategoryId(Category category) {
        return category != null ? category.getId() : null;
    }

    /**
     * Helper para extraer el nombre de la categoría.
     */
    @Named("mapCategoryName")
    protected String mapCategoryName(Category category) {
        return category != null ? category.getName() : null;
    }

    /**
     * Helper para extraer el ID de la unidad de medida.
     */
    @Named("mapUnitId")
    protected UUID mapUnitId(MeasurementUnit unit) {
        return unit != null ? unit.getId() : null;
    }

    /**
     * Helper para extraer el nombre de la unidad de medida.
     */
    @Named("mapUnitName")
    protected String mapUnitName(MeasurementUnit unit) {
        return unit != null ? unit.getName() : null;
    }

    /**
     * Helper para extraer la abreviación de la unidad de medida.
     */
    @Named("mapUnitAbbreviation")
    protected String mapUnitAbbreviation(MeasurementUnit unit) {
        return unit != null ? unit.getAbbreviation() : null;
    }

    /**
     * Helper para mapear Supplier a SupplierSummaryDto.
     */
    @Named("mapSupplierSummary")
    protected SupplierSummaryDto mapSupplierSummary(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        return SupplierSummaryDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .nit(supplier.getNit())
                .build();
    }

     /**
      * Helper para convertir lista de ProductImage a lista de ProductImageDto.
      * Usada en toDetail() para incluir las imágenes del producto.
      * Construye las URLs públicas desde los fileKeys.
      */
     @Named("mapProductImages")
     protected List<ProductImageDto> mapProductImages(List<ProductImage> images) {
         if (images == null || images.isEmpty()) {
             return List.of();
         }
         return images.stream()
             .map(image -> ProductImageDto.builder()
                 .id(image.getId())
                 .url(buildUrl(image.getFileKey()))
                 .thumbnailUrl(image.getThumbnailKey() != null ?
                         buildUrl(image.getThumbnailKey()) : null)
                 .mediumUrl(image.getMediumKey() != null ?
                         buildUrl(image.getMediumKey()) : null)
                 .isMain(image.getIsMain())
                 .createdAt(image.getCreatedAt())
                 .build())
             .toList();
     }

    /**
     * Helper para construir URL pública desde un fileKey.
     * Concatena la URL base de S3/CloudFront configurada con el fileKey.
     */
    @Named("mapMainImageUrl")
    protected String mapMainImageUrl(String mainImageKey) {
        if (mainImageKey == null) {
            return null;
        }
        return buildUrl(mainImageKey);
    }

    /**
     * Helper privado para construir URL pública desde un fileKey.
     *
     * @param fileKey Clave del archivo en S3 (ej: "products/123/uuid_imagen.jpg")
     * @return URL pública del objeto en S3/CloudFront
     */
    private String buildUrl(String fileKey) {
        return awsProperties.getS3().getPublicUrl() + "/" + fileKey;
    }
}
