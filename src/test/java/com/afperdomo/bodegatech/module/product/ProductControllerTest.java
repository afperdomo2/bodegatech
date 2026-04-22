package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.controller.ProductController;
import com.afperdomo.bodegatech.module.product.dto.CreateProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductDto;
import com.afperdomo.bodegatech.module.product.dto.UpdateProductRequest;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.common.response.ApiResponse;
import com.afperdomo.bodegatech.common.response.PagedResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        createRequest = new CreateProductRequest();
        createRequest.setName("Laptop Dell");
        createRequest.setDescription("Laptop de 15 pulgadas");
        createRequest.setPrice(new BigDecimal("1500.00"));
        createRequest.setStock(10);
        createRequest.setSku("DELL-LAPTOP-001");
        createRequest.setCategory("Electrónica");
        createRequest.setImageUrl("https://example.com/images/laptop.jpg");

        // updateRequest con solo algunos campos (PATCH parcial)
        updateRequest = new UpdateProductRequest();
        updateRequest.setName("Laptop Dell Pro");
        updateRequest.setPrice(new BigDecimal("1800.00"));

        productDto = new ProductDto();
        productDto.setId(productId);
        productDto.setName("Laptop Dell");
        productDto.setDescription("Laptop de 15 pulgadas");
        productDto.setPrice(new BigDecimal("1500.00"));
        productDto.setStock(10);
        productDto.setSku("DELL-LAPTOP-001");
        productDto.setCategory("Electrónica");
        productDto.setImageUrl("https://example.com/images/laptop.jpg");
        productDto.setIsActive(true);
        productDto.setCreatedAt(LocalDateTime.now());
        productDto.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllProductsSuccess() {
        // Arrange
        PagedResponse<ProductDto> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(List.of(productDto));
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);
        pagedResponse.setTotalElements(1);
        pagedResponse.setTotalPages(1);
        pagedResponse.setLast(true);

        when(productService.findAllProducts(any(Pageable.class))).thenReturn(pagedResponse);

        // Act
        ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> response =
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
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        verify(productService, times(1)).createProduct(any(CreateProductRequest.class));
    }

    @Test
    void testCreateProductWithDuplicateSku() {
        // Arrange
        when(productService.createProduct(any(CreateProductRequest.class)))
                .thenThrow(new com.afperdomo.bodegatech.common.exception.BusinessException(
                        "DUPLICATE_SKU", "SKU duplicado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.BusinessException.class, () ->
                productController.createProduct(createRequest)
        );
        verify(productService, times(1)).createProduct(any(CreateProductRequest.class));
    }

    @Test
    void testUpdateProductSuccess() {
        // Arrange
        when(productService.updateProduct(eq(productId), any(UpdateProductRequest.class)))
                .thenReturn(productDto);

        // Act
        ResponseEntity<ApiResponse<ProductDto>> response =
                productController.updateProduct(productId, updateRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        verify(productService, times(1)).updateProduct(eq(productId), any(UpdateProductRequest.class));
    }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productService.updateProduct(eq(nonExistentId), any(UpdateProductRequest.class)))
                .thenThrow(new com.afperdomo.bodegatech.common.exception.ResourceNotFoundException(
                        "Producto no encontrado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.common.exception.ResourceNotFoundException.class, () ->
                productController.updateProduct(nonExistentId, updateRequest)
        );
        verify(productService, times(1)).updateProduct(eq(nonExistentId), any(UpdateProductRequest.class));
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
