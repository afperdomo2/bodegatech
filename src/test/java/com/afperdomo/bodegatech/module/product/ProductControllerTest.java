package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.controller.ProductController;
import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.module.product.service.ProductService;
import com.afperdomo.bodegatech.shared.response.ApiResponse;
import com.afperdomo.bodegatech.shared.response.PagedResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
 */
@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    @Mock
    private ProductService productService;

    @InjectMocks
    private ProductController productController;

    private ProductResponse productResponse;
    private ProductRequest productRequest;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        productRequest = new ProductRequest();
        productRequest.setName("Laptop Dell");
        productRequest.setDescription("Laptop de 15 pulgadas");
        productRequest.setPrice(new BigDecimal("1500.00"));
        productRequest.setStock(10);
        productRequest.setSku("DELL-LAPTOP-001");
        productRequest.setCategory("Electrónica");
        productRequest.setImageUrl("https://example.com/images/laptop.jpg");

        productResponse = new ProductResponse();
        productResponse.setId(productId);
        productResponse.setName("Laptop Dell");
        productResponse.setDescription("Laptop de 15 pulgadas");
        productResponse.setPrice(new BigDecimal("1500.00"));
        productResponse.setStock(10);
        productResponse.setSku("DELL-LAPTOP-001");
        productResponse.setCategory("Electrónica");
        productResponse.setImageUrl("https://example.com/images/laptop.jpg");
        productResponse.setIsActive(true);
        productResponse.setCreatedAt(LocalDateTime.now());
        productResponse.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void testGetAllProductsSuccess() {
        // Arrange
        PagedResponse<ProductResponse> pagedResponse = new PagedResponse<>();
        pagedResponse.setContent(List.of(productResponse));
        pagedResponse.setPage(0);
        pagedResponse.setSize(10);
        pagedResponse.setTotalElements(1);
        pagedResponse.setTotalPages(1);
        pagedResponse.setLast(true);

        when(productService.findAllProducts(any(Pageable.class))).thenReturn(pagedResponse);

        // Act
        ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> response =
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
        when(productService.findProductById(productId)).thenReturn(productResponse);

        // Act
        ResponseEntity<ApiResponse<ProductResponse>> response = productController.getProductById(productId);

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
                .thenThrow(new com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException(
                        "Producto no encontrado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException.class, () -> {
            productController.getProductById(nonExistentId);
        });
        verify(productService, times(1)).findProductById(nonExistentId);
    }

    @Test
    void testCreateProductSuccess() {
        // Arrange
        when(productService.createProduct(any(ProductRequest.class))).thenReturn(productResponse);

        // Act
        ResponseEntity<ApiResponse<ProductResponse>> response = productController.createProduct(productRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        verify(productService, times(1)).createProduct(any(ProductRequest.class));
    }

    @Test
    void testCreateProductWithDuplicateSku() {
        // Arrange
        when(productService.createProduct(any(ProductRequest.class)))
                .thenThrow(new com.afperdomo.bodegatech.shared.exception.BusinessException(
                        "DUPLICATE_SKU", "SKU duplicado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.shared.exception.BusinessException.class, () -> {
            productController.createProduct(productRequest);
        });
        verify(productService, times(1)).createProduct(any(ProductRequest.class));
    }

    @Test
    void testUpdateProductSuccess() {
        // Arrange
        when(productService.updateProduct(eq(productId), any(ProductRequest.class)))
                .thenReturn(productResponse);

        // Act
        ResponseEntity<ApiResponse<ProductResponse>> response =
                productController.updateProduct(productId, productRequest);

        // Assert
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals("Laptop Dell", response.getBody().getData().getName());
        verify(productService, times(1)).updateProduct(eq(productId), any(ProductRequest.class));
    }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productService.updateProduct(eq(nonExistentId), any(ProductRequest.class)))
                .thenThrow(new com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException(
                        "Producto no encontrado"
                ));

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException.class, () -> {
            productController.updateProduct(nonExistentId, productRequest);
        });
        verify(productService, times(1)).updateProduct(eq(nonExistentId), any(ProductRequest.class));
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
        doThrow(new com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException(
                "Producto no encontrado"
        )).when(productService).deleteProduct(nonExistentId);

        // Act & Assert
        assertThrows(com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException.class, () -> {
            productController.deleteProduct(nonExistentId);
        });
        verify(productService, times(1)).deleteProduct(nonExistentId);
    }
}
