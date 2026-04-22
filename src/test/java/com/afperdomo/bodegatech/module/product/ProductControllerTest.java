package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.controller.ProductController;
import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.module.category.dto.CategorySummaryDto;
import com.afperdomo.bodegatech.common.response.ApiResponse;
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
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitarios del controlador ProductController.
 * El endpoint de actualización usa PATCH con campos opcionales.
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private ProductDto productDto;
    private CreateProductRequest createRequest;
    private UpdateProductRequest updateRequest;
    private UUID productId;
    private UUID categoryId;
    private CategorySummaryDto categorySummaryDto;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

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
     void testGetAllProductsSuccess() {
         // Arrange
         Pageable pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
         Page<ProductDto> page = new PageImpl<>(List.of(productDto), pageable, 1);

         when(productService.findAllProducts(any(Pageable.class))).thenReturn(page);

         // Act
         ResponseEntity<ApiResponse<Page<ProductDto>>> response =
                 productController.getAllProducts(0, 10, "createdAt", Sort.Direction.DESC);

         // Assert
         assertNotNull(response);
         assertEquals(HttpStatus.OK, response.getStatusCode());
         assertTrue(response.getBody().isSuccess());
         assertEquals(1, response.getBody().getData().getContent().size());
         verify(productService, times(1)).findAllProducts(any(Pageable.class));
     }

    @Test
    void testGetProductByIdSuccess() {
        // Arrange
        when(productService.findProductById(productId)).thenReturn(productDto);

        // Act
        ResponseEntity<ApiResponse<ProductDto>> response = productController.getProductById(productId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        assertEquals(categoryId, response.getBody().getData().getCategory().getId());
        verify(productService, times(1)).findProductById(productId);
    }

    @Test
    void testGetProductByIdNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productService.findProductById(nonExistentId))
                .thenThrow(new com.afperdomo.bodegatech.common.exception.ResourceNotFoundException(
                        "Producto no encontrado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.ResourceNotFoundException.class, () ->
                productController.getProductById(nonExistentId)
        );
        verify(productService, times(1)).findProductById(nonExistentId);
    }

     @Test
     void testCreateProductSuccess() {
         // Arrange
         when(productService.createProduct(any(CreateProductRequest.class))).thenReturn(productDto);

         // Act
         ResponseEntity<ApiResponse<ProductDto>> response = productController.createProduct(createRequest);

         // Assert
         assertNotNull(response);
         assertEquals(HttpStatus.CREATED, response.getStatusCode());
         assertTrue(response.getBody().isSuccess());
         assertEquals(productId, response.getBody().getData().getId());
         assertEquals("LAP-ELE-4F2A", response.getBody().getData().getSku());
         assertEquals("Laptop Dell", response.getBody().getData().getName());
         verify(productService, times(1)).createProduct(any(CreateProductRequest.class));
     }

    @Test
    void testCreateProductMissingCategoryId() {
        // Arrange
        CreateProductRequest invalidRequest = new CreateProductRequest();
        invalidRequest.setName("Laptop");
        invalidRequest.setPrice(new BigDecimal("1500.00"));
        invalidRequest.setStock(10);
        // categoryId no se envía

        when(productService.createProduct(any(CreateProductRequest.class)))
                .thenThrow(new com.afperdomo.bodegatech.common.exception.ResourceNotFoundException(
                        "Categoría no encontrada"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.ResourceNotFoundException.class, () ->
                productController.createProduct(invalidRequest)
        );
    }

    @Test
    void testUpdateProductSuccess() {
        // Arrange
        when(productService.updateProduct(productId, updateRequest)).thenReturn(productDto);

        // Act
        ResponseEntity<ApiResponse<ProductDto>> response = productController.updateProduct(productId, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        verify(productService, times(1)).updateProduct(productId, updateRequest);
    }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productService.updateProduct(nonExistentId, updateRequest))
                .thenThrow(new com.afperdomo.bodegatech.common.exception.ResourceNotFoundException(
                        "Producto no encontrado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.ResourceNotFoundException.class, () ->
                productController.updateProduct(nonExistentId, updateRequest)
        );
        verify(productService, times(1)).updateProduct(nonExistentId, updateRequest);
    }

    @Test
    void testDeleteProductSuccess() {
        // Arrange
        doNothing().when(productService).deleteProduct(productId);

        // Act
        ResponseEntity<Void> response = productController.deleteProduct(productId);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(productService, times(1)).deleteProduct(productId);
    }

    @Test
    void testDeleteProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        doThrow(new com.afperdomo.bodegatech.common.exception.ResourceNotFoundException(
                "Producto no encontrado"
        )).when(productService).deleteProduct(nonExistentId);

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.ResourceNotFoundException.class, () ->
                productController.deleteProduct(nonExistentId)
        );
        verify(productService, times(1)).deleteProduct(nonExistentId);
    }
}
