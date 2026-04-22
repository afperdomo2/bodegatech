package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.module.category.entity.Category;
import com.afperdomo.bodegatech.module.category.repository.CategoryRepository;
import com.afperdomo.bodegatech.module.category.dto.CategorySummaryDto;
import com.afperdomo.bodegatech.common.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.common.util.SkuGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del servicio ProductService.
 * La actualización usa PATCH con campos opcionales (campos null se ignoran).
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private SkuGenerator skuGenerator;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private Category category;
    private CreateProductRequest createRequest;
    private UpdateProductRequest updateRequest;
    private ProductDto productDto;
    private CategorySummaryDto categorySummaryDto;
    private UUID productId;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        // Setup Category
        category = new Category();
        category.setId(categoryId);
        category.setName("Electrónica");
        category.setDescription("Productos electrónicos");
        category.setIsActive(true);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        // Setup Product
        product = new Product();
        product.setId(productId);
        product.setName("Laptop Dell");
        product.setDescription("Laptop de 15 pulgadas");
        product.setPrice(new BigDecimal("1500.00"));
        product.setStock(10);
        product.setSku("LAP-ELE-4F2A");
        product.setCategory(category);
        product.setIsActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

        // Setup CategorySummaryDto
        categorySummaryDto = new CategorySummaryDto();
        categorySummaryDto.setId(categoryId);
        categorySummaryDto.setName("Electrónica");

        // Setup CreateProductRequest
        createRequest = new CreateProductRequest();
        createRequest.setName("Laptop Dell");
        createRequest.setDescription("Laptop de 15 pulgadas");
        createRequest.setPrice(new BigDecimal("1500.00"));
        createRequest.setStock(10);
        createRequest.setCategoryId(categoryId);

        // Setup UpdateProductRequest
        updateRequest = new UpdateProductRequest();
        updateRequest.setName("Laptop Dell Pro");
        updateRequest.setPrice(new BigDecimal("1800.00"));

        // Setup ProductDto
        productDto = new ProductDto();
        productDto.setId(productId);
        productDto.setName("Laptop Dell");
        productDto.setDescription("Laptop de 15 pulgadas");
        productDto.setPrice(new BigDecimal("1500.00"));
        productDto.setStock(10);
        productDto.setSku("LAP-ELE-4F2A");
        productDto.setCategory(categorySummaryDto);
        productDto.setIsActive(true);
        productDto.setCreatedAt(LocalDateTime.now());
        productDto.setUpdatedAt(LocalDateTime.now());
        productDto.setVersion(0L);
    }

     @Test
     void testFindAllProducts() {
         // Arrange
         Pageable pageable = PageRequest.of(0, 10);
         Page<Product> page = new PageImpl<>(List.of(product), pageable, 1);

         when(productRepository.findAllActive(pageable)).thenReturn(page);
         when(productMapper.toDto(product)).thenReturn(productDto);

         // Act
         Page<ProductDto> result = productService.findAllProducts(pageable);

         // Assert
         assertNotNull(result);
         assertEquals(1, result.getContent().size());
         assertEquals("Laptop Dell", result.getContent().get(0).getName());
         verify(productRepository, times(1)).findAllActive(pageable);
     }

    @Test
    void testFindProductByIdSuccess() {
        // Arrange
        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        ProductDto result = productService.findProductById(productId);

        // Assert
        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).findByIdActive(productId);
    }

    @Test
    void testFindProductByIdNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.findProductById(nonExistentId)
        );
        verify(productRepository, times(1)).findByIdActive(nonExistentId);
    }

     @Test
     void testCreateProductSuccess() {
         // Arrange
         when(categoryRepository.findByIdActive(categoryId)).thenReturn(Optional.of(category));
         when(skuGenerator.generateUniqueSku("Laptop Dell", "Electrónica", productRepository))
                 .thenReturn("LAP-ELE-4F2A");
         when(productMapper.toEntity(createRequest)).thenReturn(product);
         when(productRepository.save(any(Product.class))).thenReturn(product);
         when(productMapper.toDto(product)).thenReturn(productDto);

         // Act
         ProductDto result = productService.createProduct(createRequest);

         // Assert
         assertNotNull(result);
         assertEquals(productId, result.getId());
         assertEquals("LAP-ELE-4F2A", result.getSku());
         assertEquals("Laptop Dell", result.getName());
         verify(categoryRepository, times(1)).findByIdActive(categoryId);
         verify(skuGenerator, times(1)).generateUniqueSku("Laptop Dell", "Electrónica", productRepository);
         verify(productRepository, times(1)).save(any(Product.class));
         verify(productMapper, times(1)).toDto(product);
     }

    @Test
    void testCreateProductCategoryNotFound() {
        // Arrange
        UUID nonExistentCategoryId = UUID.randomUUID();
        createRequest.setCategoryId(nonExistentCategoryId);
        when(categoryRepository.findByIdActive(nonExistentCategoryId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.createProduct(createRequest)
        );
        verify(categoryRepository, times(1)).findByIdActive(nonExistentCategoryId);
        verify(skuGenerator, never()).generateUniqueSku(anyString(), anyString(), any());
        verify(productRepository, never()).save(any());
    }

     @Test
     void testUpdateProductSuccess() {
         // Arrange - updateRequest contiene nombre, precio y categoría diferente (nombre cambió)
         UUID newCategoryId = UUID.randomUUID();
         Category newCategory = new Category();
         newCategory.setId(newCategoryId);
         newCategory.setName("Informática");
         newCategory.setDescription("Productos de informática");
         newCategory.setIsActive(true);
         newCategory.setCreatedAt(LocalDateTime.now());
         newCategory.setUpdatedAt(LocalDateTime.now());

         updateRequest.setCategoryId(newCategoryId);
         when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
         when(categoryRepository.findByIdActive(newCategoryId)).thenReturn(Optional.of(newCategory));
         when(skuGenerator.generateUniqueSku("Laptop Dell Pro", "Informática", productRepository))
                 .thenReturn("LAP-INF-7C4D");
         doNothing().when(productMapper).updateEntity(updateRequest, product);
         when(productRepository.save(any(Product.class))).thenReturn(product);
         when(productMapper.toDto(product)).thenReturn(productDto);

         // Act
         ProductDto result = productService.updateProduct(productId, updateRequest);

         // Assert
         assertNotNull(result);
         // SKU debe regenerarse porque nombre y categoría cambiaron
         verify(skuGenerator, times(1)).generateUniqueSku("Laptop Dell Pro", "Informática", productRepository);
         verify(productRepository, times(1)).findByIdActive(productId);
         verify(categoryRepository, times(1)).findByIdActive(newCategoryId);
         verify(productRepository, times(1)).save(any(Product.class));
         verify(productMapper, times(1)).updateEntity(updateRequest, product);
     }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.updateProduct(nonExistentId, updateRequest)
        );
        verify(productRepository, never()).save(any());
    }

    @Test
    void testUpdateProductSkuNotRegeneratedWhenOnlyPriceChanges() {
        // Arrange - actualizar solo precio (sin cambiar nombre ni categoría)
        UpdateProductRequest priceOnlyRequest = new UpdateProductRequest();
        priceOnlyRequest.setPrice(new BigDecimal("2000.00"));

        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        doNothing().when(productMapper).updateEntity(priceOnlyRequest, product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toDto(product)).thenReturn(productDto);

        // Act
        ProductDto result = productService.updateProduct(productId, priceOnlyRequest);

        // Assert
        assertNotNull(result);
        // SKU NO debe regenerarse porque ni nombre ni categoría cambiaron
        verify(skuGenerator, never()).generateUniqueSku(anyString(), anyString(), any());
        verify(productRepository, times(1)).findByIdActive(productId);
        verify(productRepository, times(1)).save(any(Product.class));
        verify(productMapper, times(1)).updateEntity(priceOnlyRequest, product);
    }

    @Test
    void testDeleteProductSuccess() {
        // Arrange
        when(productRepository.findByIdActive(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        productService.deleteProduct(productId);

        // Assert
        assertFalse(product.getIsActive());
        verify(productRepository, times(1)).findByIdActive(productId);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testDeleteProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () ->
                productService.deleteProduct(nonExistentId)
        );
        verify(productRepository, never()).save(any());
    }
}
