package com.afperdomo.bodegatech.module.product;

import com.afperdomo.bodegatech.module.product.dto.ProductRequest;
import com.afperdomo.bodegatech.module.product.dto.ProductResponse;
import com.afperdomo.bodegatech.module.product.entity.Product;
import com.afperdomo.bodegatech.module.product.mapper.ProductMapper;
import com.afperdomo.bodegatech.module.product.repository.ProductRepository;
import com.afperdomo.bodegatech.module.product.service.ProductServiceImpl;
import com.afperdomo.bodegatech.shared.exception.BusinessException;
import com.afperdomo.bodegatech.shared.exception.ResourceNotFoundException;
import com.afperdomo.bodegatech.shared.response.PagedResponse;
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
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product product;
    private ProductRequest productRequest;
    private ProductResponse productResponse;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();

        product = new Product();
        product.setId(productId);
        product.setName("Laptop Dell");
        product.setDescription("Laptop de 15 pulgadas");
        product.setPrice(new BigDecimal("1500.00"));
        product.setStock(10);
        product.setSku("DELL-LAPTOP-001");
        product.setCategory("Electrónica");
        product.setImageUrl("https://example.com/images/laptop.jpg");
        product.setIsActive(true);
        product.setCreatedAt(LocalDateTime.now());
        product.setUpdatedAt(LocalDateTime.now());

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
    void testFindAllProducts() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Product> page = new PageImpl<>(List.of(product), pageable, 1);

        when(productRepository.findAllActive(pageable)).thenReturn(page);
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        // Act
        PagedResponse<ProductResponse> result = productService.findAllProducts(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Laptop Dell", result.getContent().get(0).getName());
        verify(productRepository, times(1)).findAllActive(pageable);
    }

    @Test
    void testFindProductByIdSuccess() {
        // Arrange
        when(productRepository.findByIdActive(product.getId())).thenReturn(Optional.of(product));
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        // Act
        ProductResponse result = productService.findProductById(product.getId());

        // Assert
        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).findByIdActive(product.getId());
    }

    @Test
    void testFindProductByIdNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.findProductById(nonExistentId);
        });
        verify(productRepository, times(1)).findByIdActive(nonExistentId);
    }

    @Test
    void testCreateProductSuccess() {
        // Arrange
        when(productRepository.findBySku(productRequest.getSku())).thenReturn(Optional.empty());
        when(productMapper.toEntity(productRequest)).thenReturn(product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        // Act
        ProductResponse result = productService.createProduct(productRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Laptop Dell", result.getName());
        verify(productRepository, times(1)).findBySku(productRequest.getSku());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testCreateProductDuplicateSku() {
        // Arrange
        when(productRepository.findBySku(productRequest.getSku())).thenReturn(Optional.of(product));

        // Act & Assert
        assertThrows(BusinessException.class, () -> {
            productService.createProduct(productRequest);
        });
        verify(productRepository, times(1)).findBySku(productRequest.getSku());
        verify(productRepository, never()).save(any());
    }

    @Test
    void testUpdateProductSuccess() {
        // Arrange
        when(productRepository.findByIdActive(product.getId())).thenReturn(Optional.of(product));
        // No necesitamos stub de findBySku porque el SKU es el mismo
        doNothing().when(productMapper).updateEntity(productRequest, product);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(product)).thenReturn(productResponse);

        // Act
        ProductResponse result = productService.updateProduct(product.getId(), productRequest);

        // Assert
        assertNotNull(result);
        verify(productRepository, times(1)).findByIdActive(product.getId());
        verify(productRepository, times(1)).save(any(Product.class));
        verify(productMapper, times(1)).updateEntity(productRequest, product);
    }

    @Test
    void testUpdateProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.updateProduct(nonExistentId, productRequest);
        });
        verify(productRepository, never()).save(any());
    }

    @Test
    void testDeleteProductSuccess() {
        // Arrange
        when(productRepository.findByIdActive(product.getId())).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // Act
        productService.deleteProduct(product.getId());

        // Assert
        assertFalse(product.getIsActive());
        verify(productRepository, times(1)).findByIdActive(product.getId());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    void testDeleteProductNotFound() {
        // Arrange
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findByIdActive(nonExistentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            productService.deleteProduct(nonExistentId);
        });
        verify(productRepository, never()).save(any());
    }
}
